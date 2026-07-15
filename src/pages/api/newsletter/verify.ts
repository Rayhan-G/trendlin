import type { APIRoute } from 'astro';
import { EmailService } from '@/lib/email-service';

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const db = (locals as any).runtime?.env?.DB;
    
    if (!db) {
      return new Response(
        JSON.stringify({ success: false, message: 'Database not available' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const email = url.searchParams.get('email');
    const token = url.searchParams.get('token');

    console.log('🔍 Verifying:', { email, token: token?.substring(0, 10) + '...' });

    if (!email || !token) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required parameters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ✅ Find subscriber with matching email and token
    const subscriber = await db.prepare(`
      SELECT * FROM subscribers 
      WHERE email = ? AND verification_token = ?
    `).bind(email.toLowerCase().trim(), token).first();

    if (!subscriber) {
      console.log('❌ No subscriber found');
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid verification link' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ✅ If already verified, check if subscribed
    if (subscriber.verified === 1) {
      // If already verified and subscribed, redirect to success
      if (subscriber.subscribed === 1) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: '/verify-success',
          },
        });
      }
      // If verified but not subscribed (shouldn't happen), let them verify again
    }

    // ✅ Update subscriber to verified and subscribed
    await db.prepare(`
      UPDATE subscribers 
      SET verified = 1, 
          verified_at = CURRENT_TIMESTAMP,
          subscribed = 1,
          verification_token = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE email = ? AND verification_token = ?
    `).bind(email.toLowerCase().trim(), token).run();

    console.log('✅ Subscriber verified successfully!');

    // ✅ Send welcome email
    try {
      const apiKey = (locals as any).runtime?.env?.RESEND_API_KEY;
      if (apiKey) {
        const emailService = new EmailService(apiKey);
        const categories = subscriber.categories ? subscriber.categories.split(',') : [];
        await emailService.sendNewsletterWelcome(
          email,
          subscriber.first_name || '',
          categories
        );
        console.log('✅ Welcome email sent!');
      }
    } catch (emailError) {
      console.error('❌ Welcome email error:', emailError);
    }

    return new Response(null, {
      status: 302,
      headers: {
        Location: '/verify-success',
      },
    });
  } catch (error) {
    console.error('❌ Verification error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Something went wrong' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};