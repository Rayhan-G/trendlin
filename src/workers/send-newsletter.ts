// ============================================
// NEWSLETTER WORKER - SEND QUEUE PROCESSING
// ============================================

import { NewsletterQueue } from '../lib/newsletter/queue';
import { CampaignScheduler } from '../lib/newsletter/scheduler';

export interface Env {
  DB: D1Database;
  RESEND_API_KEY: string;
  SITE: string;
}

export default {
  // ============================================
  // SCHEDULED CRON (Every 5 minutes)
  // ============================================
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    console.log(`📬 Newsletter worker started at ${new Date().toISOString()}`);
    console.log(`📋 Cron: ${event.cron}`);
    
    const startTime = Date.now();
    
    try {
      // Check if RESEND_API_KEY is set
      if (!env.RESEND_API_KEY) {
        console.error('❌ RESEND_API_KEY is not set! Please run: npx wrangler secret put RESEND_API_KEY');
        return;
      }

      const queue = new NewsletterQueue(env);
      const scheduler = new CampaignScheduler(env);

      // 1. Process scheduled campaigns
      console.log('⏰ Checking for scheduled campaigns...');
      const scheduledCount = await scheduler.processScheduled();
      if (scheduledCount > 0) {
        console.log(`✅ ${scheduledCount} scheduled campaign(s) started`);
      } else {
        console.log('✅ No scheduled campaigns to process');
      }

      // 2. Process queue
      console.log('📤 Processing email queue...');
      const result = await queue.processBatch(200);
      
      console.log(`📊 Queue results:`);
      console.log(`   ✅ Processed: ${result.processed}`);
      console.log(`   ✅ Successful: ${result.successful}`);
      console.log(`   ❌ Failed: ${result.failed}`);
      console.log(`   🔄 Bounced: ${result.bounced}`);
      console.log(`   ⏭️  Skipped: ${result.skipped}`);

      // 3. Check queue status
      const db = env.DB;
      const queueStatus = await db
        .prepare(`
          SELECT status, COUNT(*) as count
          FROM newsletter_queue
          GROUP BY status
        `)
        .all();
      
      console.log(`📊 Queue Status:`, queueStatus.results);

      const duration = Date.now() - startTime;
      console.log(`⏱️ Worker completed in ${duration}ms`);

    } catch (error) {
      console.error('❌ Worker error:', error);
    }
  },

  // ============================================
  // MANUAL TRIGGER (For testing via HTTP)
  // ============================================
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    
    // Check for authorization (optional security)
    const auth = request.headers.get('Authorization');
    const expectedAuth = env.WORKER_AUTH_TOKEN || 'test-token';
    
    // Process queue manually
    if (url.pathname === '/process-queue' && request.method === 'POST') {
      try {
        if (auth !== `Bearer ${expectedAuth}` && env.WORKER_AUTH_TOKEN) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }

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
    if (url.pathname === '/queue-status' && request.method === 'GET') {
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

        const campaigns = await db
          .prepare(`
            SELECT 
              id,
              subject,
              status,
              total_recipients,
              delivered_count,
              opened_count
            FROM newsletter_campaigns
            WHERE status IN ('sending', 'scheduled')
            ORDER BY created_at DESC
            LIMIT 5
          `)
          .all();

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              queue: status.results,
              total: total?.total || 0,
              activeCampaigns: campaigns.results || []
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

    // Health check
    if (url.pathname === '/health') {
      return new Response(
        JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          env: {
            hasDB: !!env.DB,
            hasResend: !!env.RESEND_API_KEY,
            site: env.SITE
          }
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response('Not found', { status: 404 });
  }
};