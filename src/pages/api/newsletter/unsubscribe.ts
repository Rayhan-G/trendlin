import type { APIRoute } from 'astro';
import { unsubscribeSubscriber } from '@/lib/newsletter';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = (locals as any)?.runtime?.env?.DB;

    if (!db) {
      return new Response(
        JSON.stringify({ success: false, message: 'Database not available' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { token, reason, feedback } = body;

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing unsubscribe token' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const subscriber = await unsubscribeSubscriber(token, reason, feedback, db);

    if (!subscriber) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid unsubscribe token' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'You have been unsubscribed successfully.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Something went wrong' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};