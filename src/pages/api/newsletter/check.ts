// /src/pages/api/newsletter/check.ts
import type { APIRoute } from 'astro';
import { getSubscriberByEmail } from '../../../lib/newsletter';

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const email = url.searchParams.get('email');
    const env = locals.env;

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400 }
      );
    }

    const subscriber = await getSubscriberByEmail(env, email);

    if (!subscriber) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          status: 'not_found',
          message: 'Email not found in our system'
        }),
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: subscriber.status,
        message: `Subscriber status: ${subscriber.status}`
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error checking subscriber:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to check subscriber' }),
      { status: 500 }
    );
  }
};