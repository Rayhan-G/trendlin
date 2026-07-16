// ============================================
// TEST EMAIL ENDPOINT
// ============================================

import { EmailService } from '../../lib/email-service';

export async function GET({ locals }) {
  try {
    console.log('📧 Test email API called');
    
    const RESEND_API_KEY = locals.runtime.env.RESEND_API_KEY;
    
    if (!RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not found');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'RESEND_API_KEY not found in environment' 
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ RESEND_API_KEY found');

    const emailService = new EmailService(RESEND_API_KEY);
    
    // Send test email to YOUR email
    const result = await emailService.sendEmail({
      to: 'rayhangazi21111@gmail.com', // CHANGE THIS to your email
      subject: '🧪 Test Email from Trendlin',
      html: `
        <h1>✅ Test Email</h1>
        <p>If you see this, Resend is working!</p>
        <p>Sent at: ${new Date().toISOString()}</p>
        <p>From: contact@trendlin.com</p>
      `
    });

    console.log('✅ Test email sent!', result);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Test email sent! Check your inbox.',
        result: result
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('❌ Test email error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        stack: error.stack
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}