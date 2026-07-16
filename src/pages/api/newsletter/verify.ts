// ============================================
// API: VERIFY SUBSCRIBER
// PRODUCTION READY - Cloudflare Pages Compatible
// ============================================

import { EmailService } from '../../../lib/email-service';

export async function GET({ url, locals, redirect }) {
  try {
    console.log('📧 Verify API called');
    
    // ✅ USE THE SAME WORKING PATTERN AS YOUR POSTS API
    const { DB } = locals.runtime.env;
    
    if (!DB) {
      console.error('❌ Database not available!');
      return redirect('/verify-failed?reason=database_error');
    }

    const token = url.searchParams.get('token');

    if (!token) {
      console.error('❌ No token provided');
      return redirect('/verify-failed?reason=missing_token');
    }

    console.log('🔍 Verifying token:', token.substring(0, 10) + '...');

    // Find subscriber with token
    const subscriber = await DB
      .prepare('SELECT * FROM newsletter_subscribers WHERE verification_token = ?')
      .bind(token)
      .first();

    if (!subscriber) {
      console.error('❌ Invalid token:', token);
      return redirect('/verify-failed?reason=invalid_token');
    }

    console.log('✅ Found subscriber:', subscriber.email, 'Status:', subscriber.status);

    // Check if already verified
    if (subscriber.status !== 'pending') {
      if (subscriber.status === 'active') {
        console.log('✅ Already verified:', subscriber.email);
        return redirect('/verify-success?already_verified=true');
      }
      console.log('❌ Invalid status:', subscriber.status);
      return redirect('/verify-failed?reason=already_verified');
    }

    // Update subscriber status to active
    await DB
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
    await DB
      .prepare(`
        INSERT OR IGNORE INTO newsletter_list_members (subscriber_id, list_id)
        VALUES (?, (SELECT id FROM newsletter_lists WHERE slug = 'general'))
      `)
      .bind(subscriber.id)
      .run();

    // Log verification event
    await DB
      .prepare(`
        INSERT INTO newsletter_events (subscriber_id, type)
        VALUES (?, 'confirm')
      `)
      .bind(subscriber.id)
      .run();

    // Send welcome email (don't fail verification if this fails)
    try {
      const RESEND_API_KEY = locals.runtime.env.RESEND_API_KEY;
      if (RESEND_API_KEY) {
        const emailService = new EmailService(RESEND_API_KEY);
        await emailService.sendNewsletterWelcome(
          subscriber.email,
          subscriber.first_name || undefined
        );
        console.log('✅ Welcome email sent to:', subscriber.email);
      } else {
        console.warn('⚠️ RESEND_API_KEY not available, skipping welcome email');
      }
    } catch (emailError) {
      console.error('❌ Welcome email failed:', emailError);
      // Don't fail verification if welcome email fails
    }

    console.log('✅ Verification complete for:', subscriber.email);
    return redirect('/verify-success');

  } catch (error) {
    console.error('❌ Verification error:', error);
    return redirect('/verify-failed?reason=server_error');
  }
}