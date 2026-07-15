// /src/pages/api/newsletter/resend-verification.ts
import type { APIRoute } from 'astro';
import { getSubscriberByEmail } from '../../../lib/newsletter';
import { EmailService } from '../../../lib/email-service';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { email } = await request.json();
    const env = locals.env;

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400 }
      );
    }

    const subscriber = await getSubscriberByEmail(env, email);

    if (!subscriber) {
      return new Response(
        JSON.stringify({ error: 'Subscriber not found' }),
        { status: 404 }
      );
    }

    if (subscriber.status === 'active') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Subscriber is already verified' 
        }),
        { status: 400 }
      );
    }

    if (!subscriber.verification_token) {
      return new Response(
        JSON.stringify({ error: 'No verification token found' }),
        { status: 400 }
      );
    }

    // Initialize EmailService
    const apiKey = process.env.RESEND_API_KEY || locals.env?.RESEND_API_KEY;
    if (!apiKey) {
      console.error('❌ RESEND_API_KEY not set');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500 }
      );
    }
    
    const emailService = new EmailService(apiKey);

    // Send verification email using your EmailService
    await emailService.sendNewsletterVerification(
      email, 
      subscriber.verification_token,
      subscriber.first_name || undefined
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Verification email resent successfully'
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Error resending verification:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to resend verification' }),
      { status: 500 }
    );
  }
};