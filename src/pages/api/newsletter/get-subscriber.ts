// /src/pages/api/newsletter/get-subscriber.ts
import type { APIRoute } from 'astro';
import { getSubscriberByEmail, getSubscriberByUnsubscribeToken } from '../../../lib/newsletter';

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const email = url.searchParams.get('email');
    const token = url.searchParams.get('token');
    const env = locals.env;

    let subscriber = null;

    if (token) {
      subscriber = await getSubscriberByUnsubscribeToken(env, token);
    } else if (email) {
      subscriber = await getSubscriberByEmail(env, email);
    }

    if (!subscriber) {
      return new Response(
        JSON.stringify({ error: 'Subscriber not found' }),
        { status: 404 }
      );
    }

    // Parse preferences
    let preferences = {};
    let categories: string[] = [];
    let frequency = 'weekly';
    
    try {
      preferences = subscriber.preferences ? JSON.parse(subscriber.preferences) : {};
      categories = preferences.categories || [];
      frequency = preferences.frequency || 'weekly';
    } catch (e) {
      // Use defaults
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: subscriber.id,
          email: subscriber.email,
          firstName: subscriber.first_name,
          lastName: subscriber.last_name,
          status: subscriber.status,
          token: subscriber.unsubscribe_token,
          categories: categories,
          frequency: frequency,
          createdAt: subscriber.created_at,
          verifiedAt: subscriber.verified_at
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