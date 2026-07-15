// /src/pages/api/newsletter/get-subscriber.ts
import type { APIRoute } from 'astro';
import { getSubscriberByUnsubscribeToken } from '../../../lib/newsletter';

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const token = url.searchParams.get('token');
    const env = locals.env;

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400 }
      );
    }

    const subscriber = await getSubscriberByUnsubscribeToken(env, token);

    if (!subscriber) {
      return new Response(
        JSON.stringify({ error: 'Subscriber not found' }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscriber: {
          id: subscriber.id,
          email: subscriber.email,
          first_name: subscriber.first_name,
          last_name: subscriber.last_name,
          preferences: subscriber.preferences ? JSON.parse(subscriber.preferences) : null,
          status: subscriber.status
        }
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching subscriber:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch subscriber' }),
      { status: 500 }
    );
  }
};