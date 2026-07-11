// ============================================
// API: Contact Form
// ============================================

import { EmailService } from '../../../lib/email-service.js';

export async function POST({ request, locals }) {
  try {
    const { RESEND_API_KEY } = locals.runtime.env;
    
    if (!RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not configured');
      return new Response(JSON.stringify({
        success: false,
        error: 'Email service not configured'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await request.json();
    const { name, email, subject, message, phone } = data;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Name, email, subject, and message are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid email address'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get IP and user agent
    const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'Unknown';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Initialize email service
    const emailService = new EmailService(RESEND_API_KEY);

    // Send emails
    const result = await emailService.sendContactEmail({
      name,
      email,
      subject,
      message,
      phone: phone || '',
      ip,
      userAgent
    });

    console.log('✅ Contact email sent:', { name, email, subject });

    return new Response(JSON.stringify({
      success: true,
      message: 'Email sent successfully',
      result
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Contact API error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to send email'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}