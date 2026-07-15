import type { APIRoute } from 'astro';
import { updateSubscriberPreferences } from '@/lib/newsletter';
import type { PreferencesRequest } from '@/types/newsletter';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = (locals as any)?.runtime?.env?.DB;

    if (!db) {
      return new Response(
        JSON.stringify({ success: false, message: 'Database not available' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body: PreferencesRequest = await request.json();
    const { email, token, categories } = body;

    if (!email || !token) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const subscriber = await db.prepare(`
      SELECT * FROM subscribers WHERE email = ? AND verification_token = ?
    `).bind(email.toLowerCase().trim(), token).first();

    if (!subscriber) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid request' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await updateSubscriberPreferences(subscriber.id, categories, db);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Preferences updated successfully!',
        data: {
          email: subscriber.email,
          categories: categories,
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Save preferences error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Something went wrong' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};