// ============================================
// CAMPAIGN SCHEDULER
// Handles scheduled campaigns and automations
// ============================================

import { getDB, prepare, prepareFirst } from '../db';  // ← FIXED PATH
import { NewsletterQueue } from './queue';

export class CampaignScheduler {
  private env: any;
  private queue: NewsletterQueue;

  constructor(env: any) {
    this.env = env;
    this.queue = new NewsletterQueue(env);
  }

  // ============================================
  // SCHEDULE CAMPAIGN
  // ============================================
  async scheduleCampaign(campaignId: number, scheduledAt: Date): Promise<void> {
    const db = getDB(this.env);
    
    await db
      .prepare(`
        UPDATE newsletter_campaigns 
        SET status = 'scheduled',
            scheduled_at = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(scheduledAt.toISOString(), campaignId)
      .run();
  }

  // ============================================
  // PROCESS SCHEDULED CAMPAIGNS
  // Called by worker every 5 minutes
  // ============================================
  async processScheduled(): Promise<number> {
    const db = getDB(this.env);
    let processed = 0;

    try {
      // Get campaigns ready to send
      const campaigns = await prepare(
        db,
        `
          SELECT id, list_id, subject, content_html
          FROM newsletter_campaigns 
          WHERE status = 'scheduled' 
            AND scheduled_at <= CURRENT_TIMESTAMP
        `
      );

      if (!campaigns.results || campaigns.results.length === 0) {
        return 0;
      }

      console.log(`📋 Found ${campaigns.results.length} scheduled campaign(s) to process`);

      for (const campaign of campaigns.results) {
        try {
          console.log(`🚀 Starting scheduled campaign ${campaign.id}: ${campaign.subject}`);
          
          // Enqueue the campaign
          const result = await this.queue.enqueueCampaign(campaign.id);
          
          if (result.success) {
            processed++;
            console.log(`✅ Campaign ${campaign.id} enqueued with ${result.count} recipients`);
          } else {
            console.error(`❌ Failed to enqueue campaign ${campaign.id}`);
          }
        } catch (error) {
          console.error(`❌ Error processing campaign ${campaign.id}:`, error);
        }
      }

      return processed;

    } catch (error) {
      console.error('❌ Error processing scheduled campaigns:', error);
      return processed;
    }
  }

  // ============================================
  // PAUSE CAMPAIGN
  // ============================================
  async pauseCampaign(campaignId: number): Promise<void> {
    const db = getDB(this.env);
    
    await db
      .prepare(`
        UPDATE newsletter_campaigns 
        SET status = 'paused',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(campaignId)
      .run();

    // Also pause any pending queue items
    await db
      .prepare(`
        UPDATE newsletter_queue 
        SET status = 'skipped',
            updated_at = CURRENT_TIMESTAMP
        WHERE campaign_id = ? AND status = 'pending'
      `)
      .bind(campaignId)
      .run();

    console.log(`⏸️ Campaign ${campaignId} paused`);
  }

  // ============================================
  // RESUME CAMPAIGN
  // ============================================
  async resumeCampaign(campaignId: number): Promise<void> {
    const db = getDB(this.env);
    
    // Check if campaign exists and is paused
    const campaign = await prepareFirst(
      db,
      'SELECT * FROM newsletter_campaigns WHERE id = ? AND status = "paused"',
      [campaignId]
    );

    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found or not paused`);
    }

    // Resume pending queue items
    await db
      .prepare(`
        UPDATE newsletter_queue 
        SET status = 'pending',
            updated_at = CURRENT_TIMESTAMP
        WHERE campaign_id = ? AND status = 'skipped'
      `)
      .bind(campaignId)
      .run();

    // Update campaign status
    await db
      .prepare(`
        UPDATE newsletter_campaigns 
        SET status = 'sending',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(campaignId)
      .run();

    console.log(`▶️ Campaign ${campaignId} resumed`);
  }

  // ============================================
  // CANCEL CAMPAIGN
  // ============================================
  async cancelCampaign(campaignId: number): Promise<void> {
    const db = getDB(this.env);
    
    // Check if campaign can be cancelled
    const campaign = await prepareFirst(
      db,
      'SELECT status FROM newsletter_campaigns WHERE id = ?',
      [campaignId]
    );

    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    if (campaign.status === 'completed') {
      throw new Error('Cannot cancel a completed campaign');
    }

    // Cancel all pending queue items
    await db
      .prepare(`
        UPDATE newsletter_queue 
        SET status = 'skipped',
            processed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE campaign_id = ? AND status IN ('pending', 'processing')
      `)
      .bind(campaignId)
      .run();

    // Update campaign status
    await db
      .prepare(`
        UPDATE newsletter_campaigns 
        SET status = 'cancelled',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(campaignId)
      .run();

    console.log(`❌ Campaign ${campaignId} cancelled`);
  }

  // ============================================
  // GET CAMPAIGN PROGRESS
  // ============================================
  async getCampaignProgress(campaignId: number): Promise<any> {
    const db = getDB(this.env);
    
    const stats = await prepareFirst(
      db,
      `
        SELECT 
          c.id,
          c.subject,
          c.status,
          c.total_recipients,
          c.delivered_count,
          c.opened_count,
          c.unique_opens,
          c.clicked_count,
          c.unique_clicks,
          c.unsubscribed_count,
          c.bounced_count,
          c.created_at,
          c.scheduled_at,
          c.sent_at,
          (
            SELECT COUNT(*) 
            FROM newsletter_queue 
            WHERE campaign_id = c.id AND status = 'pending'
          ) as queued,
          (
            SELECT COUNT(*) 
            FROM newsletter_queue 
            WHERE campaign_id = c.id AND status = 'processing'
          ) as processing,
          (
            SELECT COUNT(*) 
            FROM newsletter_queue 
            WHERE campaign_id = c.id AND status = 'failed'
          ) as failed,
          (
            SELECT COUNT(*) 
            FROM newsletter_queue 
            WHERE campaign_id = c.id AND status = 'bounced'
          ) as bounced
        FROM newsletter_campaigns c
        WHERE c.id = ?
      `,
      [campaignId]
    );

    if (!stats) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    // Calculate progress percentage
    const progress = stats.total_recipients > 0
      ? Math.round((stats.delivered_count / stats.total_recipients) * 100)
      : 0;

    return {
      ...stats,
      progress,
      remaining: stats.total_recipients - stats.delivered_count - stats.failed - stats.bounced
    };
  }
}