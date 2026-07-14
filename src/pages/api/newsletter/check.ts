import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    // ✅ CORRECT: Access D1 from locals.env
    const db = locals.env?.DB;
    
    if (!db) {
      console.error('❌ D1 Database not available');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Database not available' 
        }),
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

    // Check if subscriber exists
    const existing = await db.prepare(
      'SELECT verified, subscribed FROM subscribers WHERE email = ?'
    ).bind(email.toLowerCase().trim()).first();

    if (existing) {
      if (existing.verified === 1 && existing.subscribed === 1) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            subscribed: true,
            verified: true,
            message: 'You are already subscribed to our newsletter!'
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (existing.verified === 0) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            subscribed: false,
            verified: false,
            message: 'Please verify your email. Check your inbox for the verification link.'
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (existing.subscribed === 0) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            subscribed: false,
            verified: existing.verified === 1,
            message: 'You were previously unsubscribed. Subscribe again to receive our newsletter.'
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        subscribed: false,
        message: 'Not subscribed'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Check subscription error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Something went wrong' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};