import type { APIRoute } from 'astro';
import { EmailService } from '@/lib/email-service';

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    console.log('🔍 Verification endpoint called');
    
    // ✅ Get database
    const db = (locals as any).runtime?.env?.DB;
    
    if (!db) {
      console.error('❌ Database not available');
      return new Response(
        JSON.stringify({ success: false, message: 'Database not available' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const email = url.searchParams.get('email');
    const token = url.searchParams.get('token');

    console.log(`📧 Verifying email: ${email}, token: ${token?.substring(0, 10)}...`);

    if (!email || !token) {
      console.log('❌ Missing email or token');
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required parameters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find subscriber with matching email and token
    const subscriber = await db.prepare(`
      SELECT * FROM subscribers 
      WHERE email = ? AND verification_token = ?
    `).bind(email.toLowerCase().trim(), token).first();

    if (!subscriber) {
      console.log('❌ No subscriber found with this token');
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid verification link' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (subscriber.verified === 1) {
      console.log('✅ Email already verified');
      return new Response(
        JSON.stringify({ success: false, message: 'Email already verified' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update subscriber to verified
    console.log('✅ Updating subscriber to verified...');
    await db.prepare(`
      UPDATE subscribers 
      SET verified = 1, 
          verified_at = CURRENT_TIMESTAMP,
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
        
        // Get categories
        const categories = subscriber.categories ? subscriber.categories.split(',') : [];
        
        console.log(`📧 Sending welcome email to ${email}...`);
        await emailService.sendNewsletterWelcome(
          email,
          subscriber.first_name || '',
          categories
        );
        console.log('✅ Welcome email sent!');
      } else {
        console.log('⚠️ No Resend API key found, skipping welcome email');
      }
    } catch (emailError) {
      console.error('❌ Welcome email error:', emailError);
      // Don't fail verification if welcome email fails
    }

    // Redirect to success page
    console.log('🔄 Redirecting to /verify-success');
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