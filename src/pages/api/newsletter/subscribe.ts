// ============================================
// API: SUBSCRIBE TO NEWSLETTER
// ============================================

import type { APIRoute } from 'astro';
import { getDB, prepareFirst } from '../../../lib/db';
import { EmailService } from '../../../lib/email-service';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    console.log('📧 Subscribe API called');
    
    // Get env from locals.runtime.env (matching admin pattern)
    const env = locals?.runtime?.env || locals?.env || {};
    console.log('🔍 env keys:', Object.keys(env));
    
    const { email, firstName, lastName } = await request.json();

    // Check database
    let db;
    try {
      db = getDB(env);
      console.log('✅ Database connection successful');
    } catch (dbError: any) {
      console.error('❌ Database error:', dbError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Database not available: ' + dbError.message 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check Resend API key
    if (!env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY missing');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email service not configured' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate email
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email address' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check existing subscriber
    const existing = await prepareFirst(
      db,
      'SELECT * FROM newsletter_subscribers WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (existing) {
      if (existing.status === 'active') {
        return new Response(
          JSON.stringify({ success: false, error: 'Already subscribed' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (existing.status === 'pending') {
        const emailService = new EmailService(env.RESEND_API_KEY);
        await emailService.sendNewsletterVerification(
          email, 
          existing.verification_token, 
          firstName
        );
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Verification email resent. Please check your inbox.' 
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create new subscriber
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

    // Send verification email
    const emailService = new EmailService(env.RESEND_API_KEY);
    await emailService.sendNewsletterVerification(email, verificationToken, firstName);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Please check your email to verify your subscription.'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Subscribe error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to subscribe' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};