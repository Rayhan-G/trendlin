import type { APIRoute } from 'astro';
import { EmailService } from '@/lib/email-service';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // ✅ Get database from locals
    const db = (locals as any).runtime?.env?.DB;
    
    if (!db) {
      console.error('❌ Database not available');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Database not available. Please try again.' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ✅ Get Resend API Key from locals (Cloudflare Pages environment)
    const apiKey = (locals as any).runtime?.env?.RESEND_API_KEY;
    
    if (!apiKey) {
      console.error('❌ Resend API key not found in locals');
      console.log('Available env keys:', (locals as any).runtime?.env ? Object.keys((locals as any).runtime.env) : []);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Email service not configured. Please try again later.' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Resend API key found, initializing email service...');

    // ✅ Initialize email service with API key
    const emailService = new EmailService(apiKey);

    const body = await request.json();
    const { email, firstName, categories } = body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid email address' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate categories
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'Please select at least one category' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate verification token
    const token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);

    // Check if subscriber exists
    let existing = null;
    try {
      const result = await db.prepare(
        'SELECT * FROM subscribers WHERE email = ?'
      ).bind(email.toLowerCase().trim()).first();
      existing = result;
    } catch (dbError) {
      console.error('Database query error:', dbError);
      return new Response(
        JSON.stringify({ success: false, message: 'Database error. Please try again.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (existing) {
      if (existing.verified === 1 && existing.subscribed === 1) {
        return new Response(
          JSON.stringify({ success: false, message: 'Email already subscribed' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      if (existing.verified === 0) {
        try {
          // Update subscriber
          await db.prepare(`
            UPDATE subscribers 
            SET verification_token = ?,
                categories = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE email = ?
          `).bind(token, categories.join(','), email.toLowerCase().trim()).run();

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
          console.log(`📧 Sending verification email to ${email}...`);
          await emailService.sendNewsletterVerification(email, token, firstName || existing.first_name);
          console.log(`✅ Verification email sent to ${email}`);

          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Verification email sent! Please check your inbox.' 
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        } catch (updateError) {
          console.error('Update error:', updateError);
          return new Response(
            JSON.stringify({ success: false, message: 'Failed to update subscription. Please try again.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Create new subscriber
    let result;
    try {
      result = await db.prepare(`
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
    } catch (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to create subscription. Please try again.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!result) {
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to create subscriber' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create preferences
    if (result && categories.length > 0) {
      try {
        const placeholders = categories.map(() => '(?, ?, 1)').join(', ');
        const values = categories.flatMap(cat => [result.id, cat]);
        
        await db.prepare(`
          INSERT INTO newsletter_preferences (subscriber_id, category, subscribed)
          VALUES ${placeholders}
        `).bind(...values).run();
      } catch (prefError) {
        console.error('Preferences error:', prefError);
        // Don't fail the subscription if preferences fail
      }
    }

    // ✅ Send verification email
    try {
      console.log(`📧 Sending verification email to ${email}...`);
      await emailService.sendNewsletterVerification(email, token, firstName);
      console.log(`✅ Verification email sent to ${email}`);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the subscription if email fails
      // The user can request a new verification email later
    }

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
        message: error instanceof Error ? error.message : 'Something went wrong. Please try again.' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};