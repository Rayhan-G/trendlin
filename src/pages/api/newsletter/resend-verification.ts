import type { APIRoute } from 'astro';
import { getSubscriberByEmail } from '@/lib/newsletter';
import { EmailService } from '@/lib/email-service';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = (locals as any)?.runtime?.env?.DB;
    const apiKey = (locals as any)?.runtime?.env?.RESEND_API_KEY || 
                   import.meta.env.RESEND_API_KEY || 
                   process.env.RESEND_API_KEY;

    if (!db) {
      return new Response(
        JSON.stringify({ success: false, message: 'Database not available' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email service not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid email address' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const subscriber = await getSubscriberByEmail(email, db);
    if (!subscriber) {
      return new Response(
        JSON.stringify({ success: false, message: 'No subscription found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (subscriber.verified === 1) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email already verified' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    await db.prepare(`
      UPDATE subscribers 
      SET verification_token = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(token, subscriber.id).run();

    const emailService = new EmailService(apiKey);
    await emailService.sendNewsletterVerification(email, token, subscriber.first_name);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Verification email resent! Please check your inbox.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Resend verification error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Something went wrong' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};