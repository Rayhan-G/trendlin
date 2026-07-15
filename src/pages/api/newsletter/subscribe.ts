import type { APIRoute } from 'astro';
import { createSubscriber, getSubscriberByEmail } from '@/lib/newsletter';
import { EmailService } from '@/lib/email-service';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = (locals as any).runtime?.env?.DB;
    const apiKey = (locals as any).runtime?.env?.RESEND_API_KEY;

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
    const { email, firstName, categories, source } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid email address' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ✅ Check if subscriber exists using new schema
    const existing = await getSubscriberByEmail(email, db);

    if (existing) {
      // ✅ Check status instead of verified/subscribed
      if (existing.status === 'active') {
        return new Response(
          JSON.stringify({ success: false, message: 'Email already subscribed' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (existing.status === 'pending') {
        // ✅ Resend verification - keep status as pending
        const token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        await db.prepare(`
          UPDATE subscribers 
          SET verification_token = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(token, existing.id).run();

        const emailService = new EmailService(apiKey);
        await emailService.sendNewsletterVerification(email, token, firstName);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Verification email resent! Please check your inbox.' 
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (existing.status === 'unsubscribed') {
        // ✅ Reactivate - set to pending
        const token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        await db.prepare(`
          UPDATE subscribers 
          SET status = 'pending',
              verification_token = ?,
              unsubscribed_at = NULL,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(token, existing.id).run();

        // Update preferences if needed
        if (categories && categories.length > 0) {
          const categoriesStr = categories.join(',');
          await db.prepare(`
            UPDATE subscribers SET categories = ? WHERE id = ?
          `).bind(categoriesStr, existing.id).run();
        }

        const emailService = new EmailService(apiKey);
        await emailService.sendNewsletterVerification(email, token, firstName);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Please check your email to verify your subscription.' 
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // ✅ Create new subscriber
    const subscriber = await createSubscriber({
      email,
      firstName,
      categories: categories || ['general'],
      source: source || 'website',
      ipAddress: request.headers.get('cf-connecting-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      referrer: request.headers.get('referer') || undefined,
    }, db);

    // Send verification email
    const emailService = new EmailService(apiKey);
    await emailService.sendNewsletterVerification(email, subscriber.verification_token!, firstName);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Please check your email to verify your subscription.' 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Subscribe error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Something went wrong' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};