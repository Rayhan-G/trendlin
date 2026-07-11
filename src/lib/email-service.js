// ============================================
// Email Service using Resend
// ============================================

import { Resend } from 'resend';
import { 
  contactEmailTemplate, 
  autoReplyTemplate, 
  notificationEmailTemplate,
  privacyAutoReplyTemplate,
  legalAutoReplyTemplate,
  cookieAutoReplyTemplate,
  termsAutoReplyTemplate,
  partnershipAutoReplyTemplate,
  feedbackAutoReplyTemplate,
  technicalAutoReplyTemplate
} from './email-templates.js';

export class EmailService {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Resend API key is required');
    }
    this.resend = new Resend(apiKey);
    // IMPORTANT: Use contact@trendlin.com for professional replies
    this.fromEmail = 'contact@trendlin.com'; // Must be verified in Resend
  }

  // ============================================
  // Send Contact Form Email (with subject-based auto-reply)
  // ============================================
  async sendContactEmail(data) {
    try {
      const { name, email, subject, message, phone, ip, userAgent } = data;
      
      // Send notification to admin
      const adminResult = await this.resend.emails.send({
        from: `Trendlin <${this.fromEmail}>`,
        to: 'contact@trendlin.com',
        subject: `📬 New Contact: ${subject}`,
        html: contactEmailTemplate({
          name,
          email,
          subject,
          message,
          phone: phone || '',
          ip: ip || '',
          userAgent: userAgent || '',
          timestamp: new Date().toLocaleString()
        }),
        replyTo: email,
      });

      // ============================================
      // Send subject-based auto-reply to user
      // ============================================
      let autoReplyHtml = '';
      let autoReplySubject = '';

      // Determine which template to use based on subject
      if (subject.includes('Privacy')) {
        autoReplySubject = 'Privacy Inquiry Received - Trendlin';
        autoReplyHtml = privacyAutoReplyTemplate({ name });
      } else if (subject.includes('Legal')) {
        autoReplySubject = 'Legal Inquiry Received - Trendlin';
        autoReplyHtml = legalAutoReplyTemplate({ name });
      } else if (subject.includes('Cookie')) {
        autoReplySubject = 'Cookie Policy Question - Trendlin';
        autoReplyHtml = cookieAutoReplyTemplate({ name });
      } else if (subject.includes('Terms')) {
        autoReplySubject = 'Terms of Service Question - Trendlin';
        autoReplyHtml = termsAutoReplyTemplate({ name });
      } else if (subject.includes('Partnership')) {
        autoReplySubject = 'Partnership Opportunity - Trendlin';
        autoReplyHtml = partnershipAutoReplyTemplate({ name });
      } else if (subject.includes('Feedback')) {
        autoReplySubject = 'Feedback Received - Trendlin';
        autoReplyHtml = feedbackAutoReplyTemplate({ name });
      } else if (subject.includes('Technical')) {
        autoReplySubject = 'Technical Issue Received - Trendlin';
        autoReplyHtml = technicalAutoReplyTemplate({ name });
      } else {
        // Default General Inquiry
        autoReplySubject = 'Thank You for Contacting Trendlin';
        autoReplyHtml = autoReplyTemplate({ name, subject, message });
      }

      const autoReplyResult = await this.resend.emails.send({
        from: `Trendlin <${this.fromEmail}>`,
        to: email,
        subject: autoReplySubject,
        html: autoReplyHtml
      });

      return {
        success: true,
        adminResult,
        autoReplyResult
      };
    } catch (error) {
      console.error('❌ Email sending error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  // ============================================
  // Send Direct Email Auto-Reply (for privacy@, legal@, etc.)
  // ============================================
  async sendDirectEmailAutoReply(data) {
    try {
      const { to, from, subject, message } = data;
      
      let replySubject = '';
      let replyHtml = '';
      const senderName = from.split('@')[0] || 'User';

      // Determine which team the email is for
      if (to.includes('privacy@trendlin.com')) {
        replySubject = 'Privacy Request Received - Trendlin';
        replyHtml = privacyAutoReplyTemplate({ name: senderName });
      } else if (to.includes('legal@trendlin.com')) {
        replySubject = 'Legal Inquiry Received - Trendlin';
        replyHtml = legalAutoReplyTemplate({ name: senderName });
      } else if (to.includes('contact@trendlin.com')) {
        replySubject = 'Thank You for Contacting Trendlin';
        replyHtml = autoReplyTemplate({ 
          name: senderName, 
          subject: subject || 'General Inquiry',
          message: message || 'We have received your email.'
        });
      } else {
        // Default auto-reply for other addresses
        replySubject = 'Thank You for Contacting Trendlin';
        replyHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Thank You</title>
            <style>
              body { font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; }
              .container { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
              .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
              .header h1 { margin: 0; color: #0f172a; font-size: 24px; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0; font-size: 14px; color: #64748b; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📨 Thank You for Contacting Trendlin</h1>
              </div>
              <p>Hi ${senderName},</p>
              <p>We have received your email and will respond within <strong>24-48 hours</strong>.</p>
              <br>
              <div class="footer">
                <p>— The Trendlin Team</p>
                <p style="font-size: 12px; color: #94a3b8;">This is an automated reply. Please do not reply to this email.</p>
              </div>
            </div>
          </body>
          </html>
        `;
      }

      // Send auto-reply
      const result = await this.resend.emails.send({
        from: `Trendlin <${to}>`,
        to: [from],
        subject: replySubject,
        html: replyHtml
      });

      return {
        success: true,
        result
      };
    } catch (error) {
      console.error('❌ Auto-reply error:', error);
      throw new Error(`Failed to send auto-reply: ${error.message}`);
    }
  }

  // ============================================
  // Send Notification
  // ============================================
  async sendNotification(data) {
    try {
      const { to, title, message, cta } = data;
      
      const result = await this.resend.emails.send({
        from: `Trendlin <${this.fromEmail}>`,
        to: to,
        subject: title,
        html: notificationEmailTemplate({
          title,
          message,
          cta
        }),
      });

      return {
        success: true,
        result
      };
    } catch (error) {
      console.error('❌ Notification error:', error);
      throw new Error(`Failed to send notification: ${error.message}`);
    }
  }

  // ============================================
  // Send Welcome Email
  // ============================================
  async sendWelcomeEmail(email, name) {
    try {
      const result = await this.resend.emails.send({
        from: `Trendlin <${this.fromEmail}>`,
        to: email,
        subject: 'Welcome to Trendlin!',
        html: `
          <h1>Welcome to Trendlin, ${name}!</h1>
          <p>Thank you for joining our community. We're excited to have you!</p>
          <p>Here's what you can expect:</p>
          <ul>
            <li>📰 Latest articles and reviews</li>
            <li>💡 Local insights and tips</li>
            <li>🎉 Exclusive updates</li>
          </ul>
          <p>Start exploring: <a href="https://trendlin.com">Visit Trendlin</a></p>
        `,
      });

      return {
        success: true,
        result
      };
    } catch (error) {
      console.error('❌ Welcome email error:', error);
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }
  }
}