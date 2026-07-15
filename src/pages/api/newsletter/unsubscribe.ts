// /src/pages/api/newsletter/unsubscribe.ts
import type { APIRoute } from 'astro';
import { unsubscribeSubscriber } from '../../../lib/newsletter';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { email, token } = await request.json();
    const env = locals.env;

    const result = await unsubscribeSubscriber(env, token, email);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'You have been unsubscribed successfully.' 
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to unsubscribe' }),
      { status: 500 }
    );
  }
};