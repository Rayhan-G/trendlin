// ============================================
// NEWSLETTER WORKER - CLOUDFLARE CRON JOB
// Runs every 5 minutes to process queue
// ============================================

import { NewsletterQueue } from '../lib/newsletter/queue';  // ← FIXED PATH
import { CampaignScheduler } from '../lib/newsletter/scheduler';  // ← FIXED PATH

export interface Env {
  DB: D1Database;
  RESEND_API_KEY: string;
  SITE_URL: string;
  FROM_EMAIL: string;
}

export default {
  // ============================================
  // SCHEDULED CRON (Every 5 minutes)
  // ============================================
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    console.log(`📬 Newsletter worker started at ${new Date().toISOString()}`);
    console.log(`📋 Cron: ${event.cron}`);
    
    const startTime = Date.now();
    const queue = new NewsletterQueue(env);
    const scheduler = new CampaignScheduler(env);

    try {
      // 1. Process scheduled campaigns (campaigns that are ready to send)
      console.log('⏰ Checking for scheduled campaigns...');
      const scheduledCount = await scheduler.processScheduled();
      if (scheduledCount > 0) {
        console.log(`✅ ${scheduledCount} scheduled campaign(s) started`);
      } else {
        console.log('✅ No scheduled campaigns to process');
      }

      // 2. Process queue (send emails)
      console.log('📤 Processing email queue...');
      const result = await queue.processBatch(200);
      
      console.log(`📊 Queue results:`);
      console.log(`   ✅ Processed: ${result.processed}`);
      console.log(`   ✅ Successful: ${result.successful}`);
      console.log(`   ❌ Failed: ${result.failed}`);
      console.log(`   🔄 Bounced: ${result.bounced}`);
      console.log(`   ⏭️  Skipped: ${result.skipped}`);

      // 3. Log summary
      const duration = Date.now() - startTime;
      console.log(`⏱️ Worker completed in ${duration}ms`);
      
      // 4. Check if any campaigns are stuck
      await this.checkStuckCampaigns(env);

    } catch (error) {
      console.error('❌ Worker error:', error);
      // Log to error tracking service (e.g., Sentry)
    }
  },

  // ============================================
  // MANUAL TRIGGER (For testing via HTTP)
  // ============================================
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    
    // Process queue manually
    if (url.pathname === '/api/workers/process-queue' && request.method === 'POST') {
      try {
        const queue = new NewsletterQueue(env);
        const result = await queue.processBatch(100);
        return new Response(
          JSON.stringify({
            success: true,
            data: result,
            timestamp: new Date().toISOString()
          }),
          { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      } catch (error: any) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message 
          }),
          { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Get queue status
    if (url.pathname === '/api/workers/queue-status' && request.method === 'GET') {
      try {
        const db = env.DB;
        const status = await db
          .prepare(`
            SELECT 
              status,
              COUNT(*) as count
            FROM newsletter_queue
            GROUP BY status
          `)
          .all();

        const total = await db
          .prepare('SELECT COUNT(*) as total FROM newsletter_queue')
          .first();

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              statuses: status.results,
              total: total?.total || 0
            },
            timestamp: new Date().toISOString()
          }),
          { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      } catch (error: any) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message 
          }),
          { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Get campaign progress
    if (url.pathname.startsWith('/api/workers/campaign-progress/') && request.method === 'GET') {
      try {
        const campaignId = parseInt(url.pathname.split('/').pop() || '0');
        const queue = new NewsletterQueue(env);
        const status = await queue.getQueueStatus(campaignId);
        
        return new Response(
          JSON.stringify({
            success: true,
            data: status,
            timestamp: new Date().toISOString()
          }),
          { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      } catch (error: any) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message 
          }),
          { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    return new Response('Not found', { status: 404 });
  },

  // ============================================
  // HELPER: Check for stuck campaigns
  // ============================================
  async checkStuckCampaigns(env: Env) {
    const db = env.DB;
    
    // Find campaigns that have been 'sending' for more than 30 minutes
    const stuckCampaigns = await db
      .prepare(`
        SELECT id, status, created_at 
        FROM newsletter_campaigns 
        WHERE status = 'sending' 
          AND created_at < datetime('now', '-30 minutes')
          AND (
            SELECT COUNT(*) FROM newsletter_queue 
            WHERE campaign_id = id AND status IN ('pending', 'processing')
          ) > 0
      `)
      .all();

    if (stuckCampaigns.results && stuckCampaigns.results.length > 0) {
      console.log(`⚠️ Found ${stuckCampaigns.results.length} stuck campaigns`);
      
      for (const campaign of stuckCampaigns.results) {
        console.log(`   Campaign ${campaign.id} stuck since ${campaign.created_at}`);
        
        // Try to resume processing
        try {
          const queue = new NewsletterQueue(env);
          await queue.resumeCampaign(campaign.id);
          console.log(`   ✅ Campaign ${campaign.id} resumed`);
        } catch (error) {
          console.error(`   ❌ Failed to resume campaign ${campaign.id}:`, error);
        }
      }
    }
  }
};