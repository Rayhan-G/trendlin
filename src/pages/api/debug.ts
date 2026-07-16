// ============================================
// DEBUG ENDPOINT - Check Environment
// ============================================

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  // Get env from all possible locations
  const env1 = locals?.env || {};
  const env2 = locals?.runtime?.env || {};
  const env3 = locals || {};
  
  // Merge all to see what's available
  const allEnv = { ...env3, ...env1, ...env2 };
  
  return new Response(
    JSON.stringify({
      success: true,
      debug: {
        hasLocals: !!locals,
        hasEnv: !!locals?.env,
        hasRuntime: !!locals?.runtime,
        hasRuntimeEnv: !!locals?.runtime?.env,
        hasDB: !!allEnv.DB,
        dbType: allEnv.DB ? typeof allEnv.DB : 'undefined',
        hasPrepare: allEnv.DB && typeof allEnv.DB.prepare === 'function',
        hasResendKey: !!allEnv.RESEND_API_KEY,
        resendKeyPrefix: allEnv.RESEND_API_KEY ? allEnv.RESEND_API_KEY.substring(0, 6) : 'none',
        allEnvKeys: Object.keys(allEnv),
        localsKeys: Object.keys(locals || {}),
        runtimeKeys: Object.keys(locals?.runtime || {}),
        runtimeEnvKeys: Object.keys(locals?.runtime?.env || {})
      }
    }),
    { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
};