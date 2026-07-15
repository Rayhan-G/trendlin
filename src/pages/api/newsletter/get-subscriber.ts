import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const db = (locals as any).runtime?.env?.DB;
    
    if (!db) {
      console.error('❌ Database not available in locals');
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

    // ✅ Get subscriber from database
    const subscriber = await db.prepare(`
      SELECT * FROM subscribers WHERE email = ?
    `).bind(email.toLowerCase().trim()).first();

    // ✅ Case 1: No subscriber found - NOT SUBSCRIBED
    if (!subscriber) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: { 
            status: 'not-subscribed',
            subscribed: false, 
            verified: false,
            categories: [],
            token: '',
            firstName: ''
          } 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ✅ Case 2: Subscriber exists but unsubscribed
    if (subscriber.subscribed === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: { 
            status: 'unsubscribed',
            subscribed: false, 
            verified: subscriber.verified === 1,
            categories: [],
            token: subscriber.verification_token || '',
            firstName: subscriber.first_name || '',
            email: subscriber.email,
            unsubscribedAt: subscriber.unsubscribed_at
          } 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ✅ Case 3: Subscriber exists and is subscribed
    // Get preferences from newsletter_preferences table
    const preferences = await db.prepare(`
      SELECT category FROM newsletter_preferences 
      WHERE subscriber_id = ? AND subscribed = 1
    `).bind(subscriber.id).all();

    const categories = preferences.results.map((r: any) => r.category);

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
          status: 'subscribed',
          subscribed: true,
          verified: subscriber.verified === 1,
          categories: categories.length > 0 ? categories : (subscriber.categories ? subscriber.categories.split(',') : []),
          token: token,
          firstName: subscriber.first_name || '',
          email: subscriber.email,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Get subscriber error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Something went wrong' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};