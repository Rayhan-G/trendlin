import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const apiKey = (locals as any)?.runtime?.env?.RESEND_API_KEY || 
                   import.meta.env.RESEND_API_KEY || 
                   process.env.RESEND_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No Resend API key found',
          debug: {
            hasLocals: !!locals,
            hasRuntime: !!(locals as any)?.runtime,
            hasEnv: !!(locals as any)?.runtime?.env,
            envKeys: (locals as any)?.runtime?.env ? Object.keys((locals as any).runtime.env) : [],
          }
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const resend = new Resend(apiKey);
    
    const result = await resend.emails.send({
      from: 'Trendlin <contact@trendlin.com>',
      to: 'your-email@example.com', // ⚠️ CHANGE THIS TO YOUR EMAIL
      subject: 'Test Email from Trendlin',
      html: '<h1>✅ Test Successful!</h1><p>Your Resend API is working.</p>',
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Test email sent! Check your inbox.',
        result,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Test email error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};