// /src/workers/newsletter-worker.ts
import { NewsletterQueue } from '../lib/newsletter/queue';

interface Env {
  DB: D1Database;
  RESEND_API_KEY: string;
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    // Process queue every 30 seconds
    const queue = new NewsletterQueue(env);
    
    try {
      // Process scheduled campaigns
      await processScheduledCampaigns(env);
      
      // Process queue
      let processed = 0;
      let batchProcessed = 0;
      
      do {
        batchProcessed = await queue.processBatch();
        processed += batchProcessed;
      } while (batchProcessed > 0 && processed < 1000); // Max 1000 per run
      
      console.log(`Processed ${processed} emails in this run`);
      
    } catch (error) {
      console.error('Worker error:', error);
    }
  },

  async fetch(request: Request, env: Env) {
    // Manual trigger for testing
    const url = new URL(request.url);
    if (url.pathname === '/api/workers/process-queue' && request.method === 'POST') {
      const queue = new NewsletterQueue(env);
      const processed = await queue.processBatch();
      return new Response(JSON.stringify({ processed }), { status: 200 });
    }
    
    return new Response('Not found', { status: 404 });
  }
};

async function processScheduledCampaigns(env: Env) {
  const db = createD1Client(env.DB);
  
  // Find campaigns that are scheduled and due
  const campaigns = await db.prepare(`
    SELECT id FROM newsletter_campaigns 
    WHERE status = 'scheduled' 
      AND scheduled_at <= CURRENT_TIMESTAMP
  `).all();

  for (const campaign of campaigns.results) {
    // Update status
    await db.prepare(`
      UPDATE newsletter_campaigns 
      SET status = 'sending'
      WHERE id = ?
    `).bind(campaign.id).run();

    // Enqueue campaign
    const queue = new NewsletterQueue(env);
    await queue.enqueueCampaign(campaign.id);
  }
}

// Database helper
function createD1Client(db: D1Database) {
  return {
    prepare: (sql: string) => db.prepare(sql),
  };
}