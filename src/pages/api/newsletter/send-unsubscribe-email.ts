import type { APIRoute } from 'astro';
import { EmailService } from '@/lib/email-service';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // ✅ Get database
    const db = (locals as any).runtime?.env?.DB;
    
    if (!db) {
      console.error('❌ Database not available');
      return new Response(
        JSON.stringify({ success: false, message: 'Database not available' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ✅ Get Resend API Key
    const apiKey = (locals as any).runtime?.env?.RESEND_API_KEY;
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

    // Check if subscriber exists
    const subscriber = await db.prepare(
      'SELECT * FROM subscribers WHERE email = ? AND subscribed = 1'
    ).bind(email.toLowerCase().trim()).first();

    if (!subscriber) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email not found or already unsubscribed' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate a new token for unsubscribe
    const token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    
    // Update token in database
    await db.prepare(`
      UPDATE subscribers 
      SET verification_token = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE email = ?
    `).bind(token, email.toLowerCase().trim()).run();

    // ✅ Send unsubscribe email - SAME as verification
    const emailService = new EmailService(apiKey);
    await emailService.sendUnsubscribeEmail(email, token, subscriber.first_name);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Unsubscribe link sent to your email. Please check your inbox.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Send unsubscribe email error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Something went wrong' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};