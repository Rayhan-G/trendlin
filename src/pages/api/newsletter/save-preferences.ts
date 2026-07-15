// /src/pages/api/newsletter/save-preferences.ts
import type { APIRoute } from 'astro';
import { updateSubscriberPreferences } from '../../../lib/newsletter';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { token, preferences, first_name, last_name } = await request.json();
    const env = locals.env;

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400 }
      );
    }

    // Update preferences
    const result = await updateSubscriberPreferences(env, token, preferences);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 404 }
      );
    }

    // Update name if provided
    if (first_name || last_name) {
      const db = env.DB;
      const updates: string[] = [];
      const params: any[] = [];

      if (first_name) {
        updates.push('first_name = ?');
        params.push(first_name);
      }

      if (last_name) {
        updates.push('last_name = ?');
        params.push(last_name);
      }

      if (updates.length > 0) {
        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(result.subscriber.id);

        await db
          .prepare(`UPDATE newsletter_subscribers SET ${updates.join(', ')} WHERE id = ?`)
          .bind(...params)
          .run();
      }
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