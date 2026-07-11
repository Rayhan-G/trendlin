// ============================================
// API: Email Auto-Reply for Direct Emails
// ============================================

import { Resend } from 'resend';
import { privacyAutoReplyTemplate, legalAutoReplyTemplate, autoReplyTemplate } from '../../lib/email-templates.js';

export async function POST({ request, locals }) {
  try {
    const { RESEND_API_KEY } = locals.runtime.env;
    
    if (!RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not configured');
      return new Response(JSON.stringify({
        success: false,
        error: 'Resend API key not configured'
      }), { status: 500 });
    }

    const data = await request.json();
    const { to, from, subject, message, name } = data;

    console.log('📧 Auto-reply request:', { to, from, subject });

    // Validate
    if (!to || !from) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Recipient and sender are required'
      }), { status: 400 });
    }

    // Initialize Resend
    const resend = new Resend(RESEND_API_KEY);

    // Determine which auto-reply to send
    let replySubject = '';
    let replyHtml = '';
    const senderName = name || from.split('@')[0] || 'User';

    if (to.includes('privacy@trendlin.com')) {
      replySubject = 'Privacy Request Received - Trendlin';
      replyHtml = privacyAutoReplyTemplate({ name: senderName });
    } else if (to.includes('legal@trendlin.com')) {
      replySubject = 'Legal Inquiry Received - Trendlin';
      replyHtml = legalAutoReplyTemplate({ name: senderName });
    } else {
      replySubject = 'Thank You for Contacting Trendlin';
      replyHtml = autoReplyTemplate({ 
        name: senderName, 
        subject: subject || 'General Inquiry',
        message: message || 'We have received your email.'
      });
    }

    // Send auto-reply
    const result = await resend.emails.send({
      from: `Trendlin <${to}>`,
      to: [from],
      subject: replySubject,
      html: replyHtml,
      text: replyHtml.replace(/<[^>]*>/g, '')
    });

    console.log('✅ Auto-reply sent:', { to, from });

    return new Response(JSON.stringify({
      success: true,
      message: 'Auto-reply sent successfully',
      result
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Auto-reply error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to send auto-reply'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}