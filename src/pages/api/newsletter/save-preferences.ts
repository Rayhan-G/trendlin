import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = (locals as any).runtime?.env?.DB;
    
    if (!db) {
      return new Response(
        JSON.stringify({ success: false, message: 'Database not available' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { email, token, categories } = body;

    if (!email || !token) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find subscriber
    const subscriber = await db.prepare(`
      SELECT * FROM subscribers WHERE email = ? AND verification_token = ?
    `).bind(email.toLowerCase().trim(), token).first();

    if (!subscriber) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid request' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update categories in subscribers table
    await db.prepare(`
      UPDATE subscribers 
      SET categories = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(categories.join(','), subscriber.id).run();

    // Update newsletter_preferences
    await db.prepare(`
      DELETE FROM newsletter_preferences WHERE subscriber_id = ?
    `).bind(subscriber.id).run();

    if (categories.length > 0) {
      const placeholders = categories.map(() => '(?, ?, 1)').join(', ');
      const values = categories.flatMap(cat => [subscriber.id, cat]);
      
      await db.prepare(`
        INSERT INTO newsletter_preferences (subscriber_id, category, subscribed)
        VALUES ${placeholders}
      `).bind(...values).run();
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Preferences updated successfully!',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Save preferences error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Something went wrong' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};