// /src/pages/api/newsletter/resend-verification.ts
import type { APIRoute } from 'astro';
import { getSubscriberByEmail } from '../../../lib/newsletter';

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

    // TODO: Send verification email via Resend
    const baseUrl = process.env.BASE_URL || 'https://trendlin.com';
    const verificationLink = `${baseUrl}/api/newsletter/verify?token=${subscriber.verification_token}`;
    
    console.log(`[NEWSLETTER] Resending verification to ${email}`);
    console.log(`[NEWSLETTER] Verification link: ${verificationLink}`);

    // Here you would actually send the email:
    // await sendVerificationEmail(email, subscriber.verification_token);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Verification email resent successfully'
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error resending verification:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to resend verification' }),
      { status: 500 }
    );
  }
};