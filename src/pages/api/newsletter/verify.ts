// ============================================
// API: VERIFY SUBSCRIBER
// Uses your existing EmailService from src/lib/email-service.ts
// RESEND_API_KEY loaded from .env via locals.env
// ============================================

import type { APIRoute } from 'astro';
import { getDB, prepareFirst } from '../../../lib/db';
import { EmailService } from '../../../lib/email-service';

export const GET: APIRoute = async ({ url, locals, redirect }) => {
  try {
    const token = url.searchParams.get('token');
    const env = locals.env;
    const db = getDB(env);

    if (!token) {
      return redirect('/verify-failed?reason=missing_token');
    }

    // Find subscriber with token
    const subscriber = await prepareFirst(
      db,
      'SELECT * FROM newsletter_subscribers WHERE verification_token = ?',
      [token]
    );

    if (!subscriber) {
      return redirect('/verify-failed?reason=invalid_token');
    }

    if (subscriber.status !== 'pending') {
      if (subscriber.status === 'active') {
        return redirect('/verify-success?already_verified=true');
      }
      return redirect('/verify-failed?reason=already_verified');
    }

    // Update subscriber status
    await db
      .prepare(`
        UPDATE newsletter_subscribers 
        SET status = 'active',
            verified_at = CURRENT_TIMESTAMP,
            verification_token = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(subscriber.id)
      .run();

    // Add to default list if not already
    await db
      .prepare(`
        INSERT OR IGNORE INTO newsletter_list_members (subscriber_id, list_id)
        VALUES (?, (SELECT id FROM newsletter_lists WHERE slug = 'general'))
      `)
      .bind(subscriber.id)
      .run();

    // Log event
    await db
      .prepare(`
        INSERT INTO newsletter_events (subscriber_id, type)
        VALUES (?, 'confirm')
      `)
      .bind(subscriber.id)
      .run();

    // Send welcome email using your existing EmailService
    try {
      const emailService = new EmailService(env.RESEND_API_KEY);
      await emailService.sendNewsletterWelcome(
        subscriber.email,
        subscriber.first_name || undefined
      );
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
      // Don't fail the verification if welcome email fails
    }

    return redirect('/verify-success');

  } catch (error: any) {
    console.error('Verification error:', error);
    return redirect('/verify-failed?reason=server_error');
  }
};