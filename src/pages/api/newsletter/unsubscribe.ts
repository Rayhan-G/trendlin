// /src/pages/api/newsletter/unsubscribe.ts
import type { APIRoute } from 'astro';
import { createD1Client } from '../../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { email, token } = await request.json();
    const db = createD1Client(locals.env.DB);

    let subscriber;

    if (token) {
      // Find by unsubscribe token
      subscriber = await db.prepare(`
        SELECT id, email FROM newsletter_subscribers 
        WHERE unsubscribe_token = ?
      `).bind(token).first();
    } else if (email) {
      // Find by email
      subscriber = await db.prepare(`
        SELECT id, email FROM newsletter_subscribers 
        WHERE email = ?
      `).bind(email).first();
    }

    if (!subscriber) {
      return new Response(
        JSON.stringify({ error: 'Subscriber not found' }),
        { status: 404 }
      );
    }

    // Update status
    await db.prepare(`
      UPDATE newsletter_subscribers 
      SET status = 'unsubscribed', 
          unsubscribed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(subscriber.id).run();

    // Log event
    await db.prepare(`
      INSERT INTO newsletter_events (subscriber_id, type)
      VALUES (?, 'unsubscribe')
    `).bind(subscriber.id).run();

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