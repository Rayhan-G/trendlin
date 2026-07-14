// src/pages/api/newsletter/unsubscribe.ts
import type { APIRoute } from 'astro';
import { unsubscribeSubscriber } from '@/lib/newsletter';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, token, reason, feedback } = body;

    if (!email || !token) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await unsubscribeSubscriber({ email, token, reason, feedback });

    if (!result) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid unsubscribe link' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'You have been successfully unsubscribed. We\'ll miss you! 😢',
        data: {
          email: result.email,
          unsubscribedAt: result.unsubscribed_at,
        },
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