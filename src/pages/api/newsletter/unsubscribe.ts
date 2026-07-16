// ============================================
// API: UNSUBSCRIBE FROM NEWSLETTER
// Uses your existing EmailService from src/lib/email-service.ts
// RESEND_API_KEY loaded from .env via locals.env
// ============================================

import type { APIRoute } from 'astro';
import { getDB, prepareFirst } from '../../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { email, token, reason, feedback } = await request.json();
    const env = locals.env;
    const db = getDB(env);

    // Find subscriber by email or token
    let subscriber = null;

    if (token) {
      subscriber = await prepareFirst(
        db,
        'SELECT * FROM newsletter_subscribers WHERE unsubscribe_token = ?',
        [token]
      );
    } else if (email) {
      subscriber = await prepareFirst(
        db,
        'SELECT * FROM newsletter_subscribers WHERE email = ?',
        [email.toLowerCase().trim()]
      );
    }

    if (!subscriber) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Subscriber not found' 
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (subscriber.status === 'unsubscribed') {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Already unsubscribed' 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update subscriber status
    await db
      .prepare(`
        UPDATE newsletter_subscribers 
        SET status = 'unsubscribed',
            unsubscribed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(subscriber.id)
      .run();

    // Update list memberships
    await db
      .prepare(`
        UPDATE newsletter_list_members 
        SET subscribed = 0,
            updated_at = CURRENT_TIMESTAMP
        WHERE subscriber_id = ?
      `)
      .bind(subscriber.id)
      .run();

    // Log event
    await db
      .prepare(`
        INSERT INTO newsletter_events (subscriber_id, type, metadata)
        VALUES (?, 'unsubscribe', ?)
      `)
      .bind(
        subscriber.id,
        JSON.stringify({ reason, feedback })
      )
      .run();

    // Save feedback if provided
    if (reason || feedback) {
      await db
        .prepare(`
          INSERT INTO unsubscribe_feedback (subscriber_id, reason, feedback)
          VALUES (?, ?, ?)
        `)
        .bind(subscriber.id, reason || null, feedback || null)
        .run();
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully unsubscribed',
        data: {
          email: subscriber.email,
          unsubscribedAt: new Date().toISOString()
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Unsubscribe error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to unsubscribe' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};