// /src/workers/send-newsletter.ts
interface Env {
  DB: D1Database;
  RESEND_API_KEY: string;
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    // Process queue
    const queue = new NewsletterQueue(env);
    let processed = 0;
    
    do {
      const batch = await queue.processBatch();
      processed += batch;
    } while (processed < 500); // Process up to 500 per run
    
    console.log(`Processed ${processed} emails`);
    
    // Run automations
    const automation = new AutomationEngine(env);
    await automation.handleInactiveUsers();
  },

  async fetch(request: Request, env: Env) {
    // Manual trigger endpoints
    const url = new URL(request.url);
    
    if (url.pathname === '/api/workers/process-queue') {
      const queue = new NewsletterQueue(env);
      const processed = await queue.processBatch();
      return new Response(JSON.stringify({ processed }), { status: 200 });
    }
    
    if (url.pathname === '/api/workers/run-automations') {
      const automation = new AutomationEngine(env);
      await automation.handleInactiveUsers();
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }
    
    return new Response('Not found', { status: 404 });
  }
};