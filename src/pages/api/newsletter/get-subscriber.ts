import type { APIRoute } from 'astro';
import { getSubscriberByEmail } from '@/lib/newsletter';

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const db = (locals as any)?.runtime?.env?.DB;

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

    const subscriber = await getSubscriberByEmail(email, db);

    if (!subscriber) {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            status: 'not-subscribed',
            verified: false,
            subscribed: false,
            categories: [],
            token: '',
            firstName: '',
            email: email,
          }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get preferences
    const preferences = await db.prepare(`
      SELECT category FROM newsletter_preferences 
      WHERE subscriber_id = ? AND subscribed = 1
    `).bind(subscriber.id).all();

    const categories = preferences.results.map((r: any) => r.category);

    // Determine status
    let status = 'not-subscribed';
    if (subscriber.verified === 1 && subscriber.subscribed === 1) {
      status = 'subscribed';
    } else if (subscriber.verified === 0 && subscriber.subscribed === 1) {
      status = 'pending';
    } else if (subscriber.subscribed === 0) {
      status = 'unsubscribed';
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          status,
          verified: subscriber.verified === 1,
          subscribed: subscriber.subscribed === 1,
          categories: categories.length > 0 ? categories : (subscriber.categories ? subscriber.categories.split(',') : []),
          token: subscriber.verification_token || '',
          firstName: subscriber.first_name || '',
          email: subscriber.email,
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Get subscriber error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Something went wrong' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};