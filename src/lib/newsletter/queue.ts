// /src/lib/newsletter/queue.ts
import { createD1Client } from '../db';

export class NewsletterQueue {
  private db: any;
  private batchSize: number = 100;

  constructor(env: any) {
    this.db = createD1Client(env.DB);
  }

  async enqueueCampaign(campaignId: number) {
    // Get all active subscribers for this campaign
    const subscribers = await this.db.prepare(`
      SELECT 
        ns.id as subscriber_id,
        ns.email,
        ns.first_name,
        ns.last_name
      FROM newsletter_subscribers ns
      JOIN newsletter_list_members nlm ON ns.id = nlm.subscriber_id
      WHERE ns.status = 'active'
        AND nlm.subscribed = 1
    `).all();

    // Create queue entries
    for (const sub of subscribers.results) {
      // Check if already in queue
      const existing = await this.db.prepare(`
        SELECT id FROM newsletter_queue 
        WHERE campaign_id = ? AND subscriber_id = ?
      `).bind(campaignId, sub.subscriber_id).first();

      if (!existing) {
        await this.db.prepare(`
          INSERT INTO newsletter_queue (campaign_id, subscriber_id)
          VALUES (?, ?)
        `).bind(campaignId, sub.subscriber_id).run();

        // Create recipient record
        await this.db.prepare(`
          INSERT INTO newsletter_campaign_recipients (campaign_id, subscriber_id)
          VALUES (?, ?)
        `).bind(campaignId, sub.subscriber_id).run();
      }
    }

    // Update campaign total recipients
    await this.db.prepare(`
      UPDATE newsletter_campaigns 
      SET total_recipients = (
        SELECT COUNT(*) FROM newsletter_campaign_recipients 
        WHERE campaign_id = ?
      )
      WHERE id = ?
    `).bind(campaignId, campaignId).run();

    return subscribers.results.length;
  }

  async processBatch(): Promise<number> {
    // Get pending jobs
    const jobs = await this.db.prepare(`
      SELECT 
        nq.id as queue_id,
        nq.campaign_id,
        nq.subscriber_id,
        nc.subject,
        nc.content_html,
        ns.email,
        ns.first_name
      FROM newsletter_queue nq
      JOIN newsletter_campaigns nc ON nq.campaign_id = nc.id
      JOIN newsletter_subscribers ns ON nq.subscriber_id = ns.id
      WHERE nq.status = 'pending'
        AND nq.attempts < nq.max_attempts
      ORDER BY nq.priority DESC, nq.created_at ASC
      LIMIT ?
    `).bind(this.batchSize).all();

    let processed = 0;

    for (const job of jobs.results) {
      try {
        // Update to processing
        await this.db.prepare(`
          UPDATE newsletter_queue 
          SET status = 'processing', 
              attempts = attempts + 1
          WHERE id = ?
        `).bind(job.queue_id).run();

        // Here you would send the email via Resend or other provider
        // For now, just mark as completed
        console.log(`Sending email to ${job.email}: ${job.subject}`);

        // Update recipient
        await this.db.prepare(`
          UPDATE newsletter_campaign_recipients 
          SET status = 'sent', 
              sent_at = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
          WHERE campaign_id = ? AND subscriber_id = ?
        `).bind(job.campaign_id, job.subscriber_id).run();

        // Update queue
        await this.db.prepare(`
          UPDATE newsletter_queue 
          SET status = 'completed', 
              processed_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(job.queue_id).run();

        // Update campaign delivered count
        await this.db.prepare(`
          UPDATE newsletter_campaigns 
          SET delivered_count = delivered_count + 1
          WHERE id = ?
        `).bind(job.campaign_id).run();

        processed++;

      } catch (error) {
        console.error(`Error processing job ${job.queue_id}:`, error);

        // Update queue with error
        await this.db.prepare(`
          UPDATE newsletter_queue 
          SET status = 'failed',
              error_message = ?,
              processed_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(error.message || 'Unknown error', job.queue_id).run();

        // Update recipient
        await this.db.prepare(`
          UPDATE newsletter_campaign_recipients 
          SET status = 'failed',
              error_message = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE campaign_id = ? AND subscriber_id = ?
        `).bind(error.message || 'Unknown error', job.campaign_id, job.subscriber_id).run();
      }
    }

    return processed;
  }
}