import type { APIRoute } from 'astro';
import { getSubscriberByEmail } from '@/lib/newsletter';

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

    const subscriber = await getSubscriberByEmail(email, db);

    if (!subscriber) {
      return new Response(
        JSON.stringify({
          success: true,
          subscribed: false,
          status: 'not-subscribed',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ✅ Return status directly
    return new Response(
      JSON.stringify({
        success: true,
        subscribed: subscriber.status === 'active',
        status: subscriber.status,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Check subscription error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Something went wrong' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};