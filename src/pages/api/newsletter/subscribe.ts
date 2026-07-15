import type { APIRoute } from 'astro';
import { EmailService } from '@/lib/email-service';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = (locals as any).runtime?.env?.DB;
    
    if (!db) {
      console.error('❌ Database not available in locals');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Database not available' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = (locals as any).runtime?.env?.RESEND_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email service not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { email, firstName, categories } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid email address' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'Please select at least one category' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate verification token
    const token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);

    // Check if subscriber exists
    let existing = await db.prepare(
      'SELECT * FROM subscribers WHERE email = ?'
    ).bind(email.toLowerCase().trim()).first();

    if (existing) {
      // ✅ If already subscribed and verified
      if (existing.verified === 1 && existing.subscribed === 1) {
        return new Response(
          JSON.stringify({ success: false, message: 'Email already subscribed' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // ✅ If exists but not verified - RESEND VERIFICATION
      if (existing.verified === 0) {
        await db.prepare(`
          UPDATE subscribers 
          SET verification_token = ?,
              categories = ?,
              first_name = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE email = ?
        `).bind(token, categories.join(','), firstName || '', email.toLowerCase().trim()).run();

        // Update preferences
        await db.prepare(`
          DELETE FROM newsletter_preferences WHERE subscriber_id = ?
        `).bind(existing.id).run();

        const placeholders = categories.map(() => '(?, ?, 1)').join(', ');
        const values = categories.flatMap(cat => [existing.id, cat]);
        
        await db.prepare(`
          INSERT INTO newsletter_preferences (subscriber_id, category, subscribed)
          VALUES ${placeholders}
        `).bind(...values).run();

        // ✅ Send verification email (same as new subscription)
        const emailService = new EmailService(apiKey);
        await emailService.sendNewsletterVerification(email, token, firstName || existing.first_name);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Verification email sent! Please check your inbox.',
            requiresVerification: true
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // ✅ If unsubscribed, reactivate and send verification
      if (existing.subscribed === 0) {
        await db.prepare(`
          UPDATE subscribers 
          SET subscribed = 1,
              verification_token = ?,
              categories = ?,
              first_name = ?,
              unsubscribed_at = NULL,
              updated_at = CURRENT_TIMESTAMP
          WHERE email = ?
        `).bind(token, categories.join(','), firstName || '', email.toLowerCase().trim()).run();

        // Update preferences
        await db.prepare(`
          DELETE FROM newsletter_preferences WHERE subscriber_id = ?
        `).bind(existing.id).run();

        const placeholders = categories.map(() => '(?, ?, 1)').join(', ');
        const values = categories.flatMap(cat => [existing.id, cat]);
        
        await db.prepare(`
          INSERT INTO newsletter_preferences (subscriber_id, category, subscribed)
          VALUES ${placeholders}
        `).bind(...values).run();

        // ✅ Send verification email
        const emailService = new EmailService(apiKey);
        await emailService.sendNewsletterVerification(email, token, firstName || existing.first_name);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Verification email sent! Please check your inbox.',
            requiresVerification: true
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // ✅ NEW SUBSCRIBER - Create and send verification
    const result = await db.prepare(`
      INSERT INTO subscribers (
        email, 
        first_name, 
        categories, 
        verification_token, 
        verified, 
        subscribed
      )
      VALUES (?, ?, ?, ?, 0, 1)
      RETURNING id
    `).bind(
      email.toLowerCase().trim(), 
      firstName || '', 
      categories.join(','), 
      token
    ).first();

    if (!result) {
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to create subscriber' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create preferences
    if (result && categories.length > 0) {
      const placeholders = categories.map(() => '(?, ?, 1)').join(', ');
      const values = categories.flatMap(cat => [result.id, cat]);
      
      await db.prepare(`
        INSERT INTO newsletter_preferences (subscriber_id, category, subscribed)
        VALUES ${placeholders}
      `).bind(...values).run();
    }

    // ✅ Send verification email
    try {
      const emailService = new EmailService(apiKey);
      await emailService.sendNewsletterVerification(email, token, firstName);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Please check your email to verify your subscription.',
        requiresVerification: true
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Subscribe error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Something went wrong. Please try again.' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};