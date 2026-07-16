// ============================================
// API: SUBSCRIBE TO NEWSLETTER
// ============================================

import type { APIRoute } from 'astro';
import { getDB, prepareFirst } from '../../../lib/db';
import { EmailService } from '../../../lib/email-service';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { email, firstName, lastName, categories } = await request.json();
    const env = locals.env;
    const db = getDB(env);

    console.log('🔍 Subscribe API called with:', { email, firstName, categories });

    // Validate email
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email address' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if RESEND_API_KEY exists
    if (!env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is missing from environment!');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email service is not configured. Please try again later.' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if already subscribed
    const existing = await prepareFirst(
      db,
      'SELECT * FROM newsletter_subscribers WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (existing) {
      if (existing.status === 'active') {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Already subscribed' 
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (existing.status === 'pending') {
        // Resend verification
        console.log('📧 Resending verification for pending subscriber:', email);
        try {
          const emailService = new EmailService(env.RESEND_API_KEY);
          await emailService.sendNewsletterVerification(
            email, 
            existing.verification_token, 
            firstName
          );
          console.log('✅ Verification email resent successfully!');
        } catch (emailError: any) {
          console.error('❌ Failed to resend verification:', emailError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to send verification email. Please try again.' 
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Verification email resent. Please check your inbox.' 
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (existing.status === 'unsubscribed') {
        // Re-subscribe
        const newToken = Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15);
        await db
          .prepare(`
            UPDATE newsletter_subscribers 
            SET status = 'pending',
                verification_token = ?,
                unsubscribed_at = NULL,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `)
          .bind(newToken, existing.id)
          .run();

        console.log('📧 Sending verification for re-subscribe:', email);
        try {
          const emailService = new EmailService(env.RESEND_API_KEY);
          await emailService.sendNewsletterVerification(email, newToken, firstName);
          console.log('✅ Verification email sent successfully!');
        } catch (emailError: any) {
          console.error('❌ Failed to send verification:', emailError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to send verification email. Please try again.' 
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Welcome back! Please verify your email.' 
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create new subscriber
    console.log('📝 Creating new subscriber:', email);
    const verificationToken = Math.random().toString(36).substring(2, 15) + 
                            Math.random().toString(36).substring(2, 15);
    const unsubscribeToken = Math.random().toString(36).substring(2, 15) + 
                            Math.random().toString(36).substring(2, 15);

    const result = await db
      .prepare(`
        INSERT INTO newsletter_subscribers (
          email, first_name, last_name, status,
          verification_token, unsubscribe_token, source,
          ip_address, user_agent
        ) VALUES (?, ?, ?, 'pending', ?, ?, 'website', ?, ?)
      `)
      .bind(
        email.toLowerCase().trim(),
        firstName || '',
        lastName || '',
        verificationToken,
        unsubscribeToken,
        request.headers.get('cf-connecting-ip') || '',
        request.headers.get('user-agent') || ''
      )
      .run();

    const subscriberId = result.meta.last_row_id;

    // Add to default list
    await db
      .prepare(`
        INSERT OR IGNORE INTO newsletter_list_members (subscriber_id, list_id)
        VALUES (?, (SELECT id FROM newsletter_lists WHERE slug = 'general'))
      `)
      .bind(subscriberId)
      .run();

    // Log event
    await db
      .prepare(`
        INSERT INTO newsletter_events (subscriber_id, type)
        VALUES (?, 'subscribe')
      `)
      .bind(subscriberId)
      .run();

    // Send verification email
    console.log('📧 Sending verification email to:', email);
    console.log('🔑 Verification token:', verificationToken);
    
    try {
      const emailService = new EmailService(env.RESEND_API_KEY);
      await emailService.sendNewsletterVerification(email, verificationToken, firstName);
      console.log('✅ Verification email sent successfully!');
    } catch (emailError: any) {
      console.error('❌ Failed to send verification email:', emailError);
      console.error('❌ Error details:', {
        message: emailError.message,
        stack: emailError.stack
      });
      
      // Still return success but with warning
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Account created but verification email failed. Please try resending.',
          warning: true,
          data: {
            email: email,
            status: 'pending'
          }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Please check your email to verify your subscription.',
        data: {
          email: email,
          status: 'pending'
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Subscribe error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to subscribe' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};