import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const db = (locals as any).runtime?.env?.DB;
    
    if (!db) {
      console.error('❌ Database not available in locals');
      return new Response(
        JSON.stringify({ success: false, message: 'Database not available' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const email = url.searchParams.get('email');
    const token = url.searchParams.get('token');

    console.log('🔍 Verifying unsubscribe link:', { email, token: token?.substring(0, 10) + '...' });

    if (!email || !token) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required parameters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ✅ Find subscriber
    const subscriber = await db.prepare(`
      SELECT * FROM subscribers WHERE email = ? AND verification_token = ?
    `).bind(email.toLowerCase().trim(), token).first();

    if (!subscriber) {
      console.log('❌ Subscriber not found');
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid unsubscribe link' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (subscriber.subscribed === 0) {
      console.log('⚠️ Already unsubscribed');
      return new Response(
        JSON.stringify({ success: false, message: 'You are already unsubscribed' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Unsubscribe link verified for:', email);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          email: subscriber.email,
          firstName: subscriber.first_name || '',
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Verify unsubscribe error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Something went wrong' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};