// ============================================
// CUSTOM WORKER FOR PAGES
// Passes D1 binding to Astro
// ============================================

export default {
  async fetch(request: Request, env: any) {
    console.log('🔧 Worker: Handling request');
    console.log('🔧 Worker: Has DB?', !!env.DB);
    console.log('🔧 Worker: Has prepare?', env.DB && typeof env.DB.prepare === 'function');
    
    try {
      // Import the Astro app
      const { default: app } = await import('./index.astro');
      
      // Pass env to the app
      return app.fetch(request, env);
    } catch (error) {
      console.error('❌ Worker error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Worker error', 
          message: error instanceof Error ? error.message : String(error) 
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  }
};