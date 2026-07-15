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
          subscribed: false,
          verified: false,
          status: 'not-subscribed',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscribed: subscriber.subscribed === 1,
        verified: subscriber.verified === 1,
        status: subscriber.verified === 1 && subscriber.subscribed === 1 ? 'active' : 
                subscriber.verified === 0 && subscriber.subscribed === 1 ? 'pending' : 'unsubscribed',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Check error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Something went wrong' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};