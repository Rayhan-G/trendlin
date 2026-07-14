// src/pages/api/newsletter/verify-unsubscribe.ts
import type { APIRoute } from 'astro';
import { getSubscriberByEmailAndToken } from '@/lib/newsletter';

export const GET: APIRoute = async ({ url }) => {
  try {
    const email = url.searchParams.get('email');
    const token = url.searchParams.get('token');

    if (!email || !token) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required parameters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const subscriber = await getSubscriberByEmailAndToken(email, token);

    if (!subscriber) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid unsubscribe link' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (subscriber.subscribed === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'You are already unsubscribed' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          email: subscriber.email,
          firstName: subscriber.firstName,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Verify unsubscribe error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Something went wrong' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};