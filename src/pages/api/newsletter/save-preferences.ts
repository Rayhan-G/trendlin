// /src/pages/api/newsletter/save-preferences.ts
import type { APIRoute } from 'astro';
import { 
  updateSubscriberPreferences, 
  getSubscriberByEmail,
  getSubscriberByUnsubscribeToken
} from '../../../lib/newsletter';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { email, token, categories, frequency } = await request.json();
    const env = locals.env;

    let subscriber;

    // Find subscriber by token or email
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

    const preferences = {
      categories: categories || [],
      frequency: frequency || 'weekly'
    };

    // Use the unsubscribe token to update
    const result = await updateSubscriberPreferences(
      env, 
      subscriber.unsubscribe_token || '', 
      preferences
    );

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Preferences saved successfully'
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error saving preferences:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to save preferences' }),
      { status: 500 }
    );
  }
};