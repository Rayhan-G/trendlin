// /src/pages/api/newsletter/subscribe.ts
import type { APIRoute } from 'astro';
import { createD1Client } from '../../../lib/db';
import { generateToken, sendVerificationEmail } from '../../../lib/newsletter';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { email } = await request.json();
    const db = createD1Client(locals.env.DB);

    // Validate email
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400 }
      );
    }

    // Check if subscriber exists
    const existing = await db.prepare(
      'SELECT id, status FROM newsletter_subscribers WHERE email = ?'
    ).bind(email).first();

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
        // Resend verification
        const token = await generateToken();
        await sendVerificationEmail(email, token);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Verification email resent! Please check your inbox.' 
          }),
          { status: 200 }
        );
      }
    }

    // Generate tokens
    const verificationToken = await generateToken();
    const unsubscribeToken = await generateToken();

    // Insert subscriber
    await db.prepare(`
      INSERT INTO newsletter_subscribers (
        email, 
        status, 
        verification_token, 
        unsubscribe_token,
        source,
        ip_address,
        user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      email,
      'pending',
      verificationToken,
      unsubscribeToken,
      'website',
      request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for'),
      request.headers.get('user-agent')
    ).run();

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

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