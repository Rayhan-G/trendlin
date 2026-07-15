// /src/pages/api/newsletter/verify.ts
import type { APIRoute } from 'astro';
import { verifySubscriber } from '../../../lib/newsletter';

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const token = url.searchParams.get('token');
    const env = locals.env;

    if (!token) {
      return new Response('Invalid verification token', { status: 400 });
    }

    const result = await verifySubscriber(env, token);

    if (!result.success) {
      // Redirect to failed page
      return new Response(null, {
        status: 302,
        headers: { Location: '/verify-failed' }
      });
    }

    // Redirect to success page
    return new Response(null, {
      status: 302,
      headers: { Location: '/verify-success' }
    });

  } catch (error) {
    console.error('Verification error:', error);
    return new Response('Verification failed', { status: 500 });
  }
};