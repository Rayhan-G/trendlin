import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  try {
    // Try all possible locations for D1
    let db = null;
    let source = 'none';
    let debugInfo = {};
    
    // Debug what's available
    debugInfo = {
      localsKeys: Object.keys(locals),
      hasRuntime: !!(locals as any).runtime,
      hasCloudflare: !!(locals as any).cloudflare,
      hasEnv: !!locals.env,
      runtimeKeys: (locals as any).runtime ? Object.keys((locals as any).runtime) : [],
      cloudflareKeys: (locals as any).cloudflare ? Object.keys((locals as any).cloudflare) : [],
      envKeys: locals.env ? Object.keys(locals.env) : [],
    };
    
    // Method 1: locals.env
    if (locals.env?.DB) {
      db = locals.env.DB;
      source = 'locals.env.DB';
    }
    // Method 2: locals.runtime?.env
    else if ((locals as any).runtime?.env?.DB) {
      db = (locals as any).runtime.env.DB;
      source = 'locals.runtime.env.DB';
    }
    // Method 3: locals.cloudflare?.env
    else if ((locals as any).cloudflare?.env?.DB) {
      db = (locals as any).cloudflare.env.DB;
      source = 'locals.cloudflare.env.DB';
    }
    // Method 4: globalThis
    else if ((globalThis as any).DB) {
      db = (globalThis as any).DB;
      source = 'globalThis.DB';
    }
    
    if (!db) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Database not found in any location',
          debug: debugInfo,
          availableMethods: {
            'locals.env.DB': !!locals.env?.DB,
            'locals.runtime.env.DB': !!((locals as any).runtime?.env?.DB),
            'locals.cloudflare.env.DB': !!((locals as any).cloudflare?.env?.DB),
            'globalThis.DB': !!((globalThis as any).DB),
          }
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Test query - get subscriber count
    const countResult = await db.prepare('SELECT COUNT(*) as count FROM subscribers').first();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Database connected successfully!',
        source: source,
        subscriberCount: countResult?.count || 0,
        debug: debugInfo
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};