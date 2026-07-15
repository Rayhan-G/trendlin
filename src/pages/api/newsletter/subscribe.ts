// /src/pages/api/newsletter/subscribe.ts
import type { APIRoute } from 'astro';
import { createSubscriber, getSubscriberByEmail } from '../../../lib/newsletter';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { email } = await request.json();
    const env = locals.env;

    // Validate email
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400 }
      );
    }

    // Check if subscriber exists
    const existing = await getSubscriberByEmail(env, email);

    if (existing) {
      if (existing.status === 'active') {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'You are already subscribed!' 
          }),
          { status: 200 }
        );
      }
      
      if (existing.status === 'pending') {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Please verify your email first. Check your inbox!' 
          }),
          { status: 200 }
        );
      }
    }

    // Create subscriber
    const result = await createSubscriber(env, {
      email,
      source: 'website',
      ip_address: request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for'),
      user_agent: request.headers.get('user-agent')
    });

    // TODO: Send verification email via Resend
    console.log(`[NEWSLETTER] Verification token for ${email}: ${result.verificationToken}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Please check your email to verify your subscription!' 
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Subscribe error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to subscribe' }),
      { status: 500 }
    );
  }
};