// /src/pages/api/newsletter/verify.ts
import type { APIRoute } from 'astro';
import { createD1Client } from '../../../lib/db';

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const token = url.searchParams.get('token');
    const db = createD1Client(locals.env.DB);

    if (!token) {
      return new Response('Invalid verification token', { status: 400 });
    }

    // Find subscriber with token
    const subscriber = await db.prepare(`
      SELECT id, email, status 
      FROM newsletter_subscribers 
      WHERE verification_token = ? AND status = 'pending'
    `).bind(token).first();

    if (!subscriber) {
      // Redirect to verification failed page
      return new Response(null, {
        status: 302,
        headers: { Location: '/verify-failed' }
      });
    }

    // Update status to active
    await db.prepare(`
      UPDATE newsletter_subscribers 
      SET status = 'active', 
          verified_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(subscriber.id).run();

    // Add to default list (General)
    const defaultList = await db.prepare(
      'SELECT id FROM newsletter_lists WHERE slug = ?'
    ).bind('general').first();

    if (defaultList) {
      await db.prepare(`
        INSERT OR IGNORE INTO newsletter_list_members (subscriber_id, list_id)
        VALUES (?, ?)
      `).bind(subscriber.id, defaultList.id).run();
    }

    // Log event
    await db.prepare(`
      INSERT INTO newsletter_events (subscriber_id, type)
      VALUES (?, 'subscribe')
    `).bind(subscriber.id).run();

    // Redirect to success
    return new Response(null, {
      status: 302,
      headers: { Location: '/verify-success' }
    });

  } catch (error) {
    console.error('Verification error:', error);
    return new Response('Verification failed', { status: 500 });
  }
};