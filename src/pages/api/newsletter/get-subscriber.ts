import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const db = (locals as any).runtime?.env?.DB;
    
    if (!db) {
      return new Response(
        JSON.stringify({ success: false, message: 'Database not available' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const email = url.searchParams.get('email');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid email address' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const subscriber = await db.prepare(`
      SELECT * FROM subscribers WHERE email = ?
    `).bind(email.toLowerCase().trim()).first();

    if (!subscriber) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: { 
            subscribed: false, 
            verified: false,
            categories: '',
            token: ''
          } 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate token if none exists
    let token = subscriber.verification_token;
    if (!token) {
      token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
      await db.prepare(`
        UPDATE subscribers SET verification_token = ? WHERE id = ?
      `).bind(token, subscriber.id).run();
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          email: subscriber.email,
          firstName: subscriber.first_name,
          subscribed: subscriber.subscribed === 1,
          verified: subscriber.verified === 1,
          categories: subscriber.categories || '',
          token: token,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Get subscriber error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Something went wrong' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};