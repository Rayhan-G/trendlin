// ============================================
// API: RESEND VERIFICATION EMAIL
// ============================================

import type { APIRoute } from 'astro';
import { getDB, prepareFirst } from '../../../lib/db';
import { EmailService } from '../../../lib/email-service';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { email } = await request.json();
    const env = locals.env;
    const db = getDB(env);

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const subscriber = await prepareFirst(
      db,
      'SELECT * FROM newsletter_subscribers WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (!subscriber) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Subscriber not found' 
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (subscriber.status === 'active') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Already verified' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (subscriber.status !== 'pending') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Cannot resend verification for this status' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Resend verification email
    const emailService = new EmailService(env.RESEND_API_KEY);
    await emailService.sendNewsletterVerification(
      subscriber.email,
      subscriber.verification_token,
      subscriber.first_name || undefined
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Verification email resent successfully'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Resend verification error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to resend verification' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};