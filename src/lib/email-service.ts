// ============================================
// Email Service using Resend
// PRODUCTION READY - Cloudflare Pages Compatible
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
  technicalAutoReplyTemplate,
  newsletterVerificationTemplate,
  newsletterWelcomeTemplate,
  newsletterDigestTemplate,
  unsubscribeEmailTemplate
} from './email-templates.js';

export class EmailService {
  private resend: any;
  private fromEmail: string;
  private maxRetries: number = 3;

  constructor(apiKey: string) {
    if (!apiKey) {
      console.error('❌ Resend API key is required');
      throw new Error('Resend API key is required');
    }
    console.log('✅ EmailService initialized');
    this.resend = new Resend(apiKey);
    // Use environment variable for from email with fallback
    this.fromEmail = process.env?.FROM_EMAIL || 'contact@trendlin.com';
    console.log(`📧 From Email: ${this.fromEmail}`);
  }

  // ============================================
  // CONTACT EMAIL METHODS
  // ============================================

  async sendContactEmail(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
    phone?: string;
    ip?: string;
    userAgent?: string;
  }) {
    try {
      const { name, email, subject, message, phone, ip, userAgent } = data;
      
      console.log(`📧 Sending contact email from: ${email}`);
      
      const adminResult = await this.resend.emails.send({
        from: `Trendlin <${this.fromEmail}>`,
        to: process.env?.CONTACT_EMAIL || 'contact@trendlin.com',
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

      console.log(`✅ Contact email sent to admin`);

      // Send auto-reply
      let autoReplyHtml = '';
      let autoReplySubject = '';

      if (subject?.includes('Privacy')) {
        autoReplySubject = 'Privacy Inquiry Received - Trendlin';
        autoReplyHtml = privacyAutoReplyTemplate({ name });
      } else if (subject?.includes('Legal')) {
        autoReplySubject = 'Legal Inquiry Received - Trendlin';
        autoReplyHtml = legalAutoReplyTemplate({ name });
      } else if (subject?.includes('Cookie')) {
        autoReplySubject = 'Cookie Policy Question - Trendlin';
        autoReplyHtml = cookieAutoReplyTemplate({ name });
      } else if (subject?.includes('Terms')) {
        autoReplySubject = 'Terms of Service Question - Trendlin';
        autoReplyHtml = termsAutoReplyTemplate({ name });
      } else if (subject?.includes('Partnership')) {
        autoReplySubject = 'Partnership Opportunity - Trendlin';
        autoReplyHtml = partnershipAutoReplyTemplate({ name });
      } else if (subject?.includes('Feedback')) {
        autoReplySubject = 'Feedback Received - Trendlin';
        autoReplyHtml = feedbackAutoReplyTemplate({ name });
      } else if (subject?.includes('Technical')) {
        autoReplySubject = 'Technical Issue Received - Trendlin';
        autoReplyHtml = technicalAutoReplyTemplate({ name });
      } else {
        autoReplySubject = 'Thank You for Contacting Trendlin';
        autoReplyHtml = autoReplyTemplate({ name, subject, message });
      }

      const autoReplyResult = await this.resend.emails.send({
        from: `Trendlin <${this.fromEmail}>`,
        to: email,
        subject: autoReplySubject,
        html: autoReplyHtml
      });

      console.log(`✅ Auto-reply sent to: ${email}`);

      return {
        success: true,
        adminResult,
        autoReplyResult
      };
    } catch (error: any) {
      console.error('❌ Email sending error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendDirectEmailAutoReply(data: {
    to: string;
    from: string;
    subject: string;
    message: string;
  }) {
    try {
      const { to, from, subject, message } = data;
      
      let replySubject = '';
      let replyHtml = '';
      const senderName = from.split('@')[0] || 'User';

      console.log(`📧 Sending direct auto-reply to: ${from}`);

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

      const result = await this.resend.emails.send({
        from: `Trendlin <${to}>`,
        to: [from],
        subject: replySubject,
        html: replyHtml
      });

      console.log(`✅ Direct auto-reply sent to: ${from}`);

      return {
        success: true,
        result
      };
    } catch (error: any) {
      console.error('❌ Auto-reply error:', error);
      throw new Error(`Failed to send auto-reply: ${error.message}`);
    }
  }

  async sendNotification(data: {
    to: string;
    title: string;
    message: string;
    cta?: { text: string; url: string };
  }) {
    try {
      const { to, title, message, cta } = data;
      
      console.log(`📧 Sending notification to: ${to}`);

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

      console.log(`✅ Notification sent to: ${to}`);

      return {
        success: true,
        result
      };
    } catch (error: any) {
      console.error('❌ Notification error:', error);
      throw new Error(`Failed to send notification: ${error.message}`);
    }
  }

  // ============================================
  // NEWSLETTER METHODS
  // ============================================

  /**
   * Send verification email to new subscriber
   */
  async sendNewsletterVerification(email: string, token: string, firstName?: string) {
    try {
      // Use environment variable for site URL
      const siteUrl = process.env?.SITE_URL || process.env?.SITE || 'https://trendlin.com';
      const verificationUrl = `${siteUrl}/api/newsletter/verify?token=${token}`;
      
      console.log(`📧 Sending verification email to: ${email}`);
      console.log(`🔗 Verification URL: ${verificationUrl}`);

      const result = await this.resend.emails.send({
        from: `Trendlin <${this.fromEmail}>`,
        to: email,
        subject: 'Verify Your Email - Trendlin Newsletter',
        html: newsletterVerificationTemplate({
          firstName: firstName || '',
          verificationUrl
        }),
      });

      console.log(`✅ Verification email sent to: ${email}`);
      return { success: true, result };
    } catch (error: any) {
      console.error('❌ Newsletter verification email error:', error);
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }

  /**
   * Send welcome email after verification
   */
  async sendNewsletterWelcome(email: string, firstName?: string, categories?: string[]) {
    try {
      console.log(`📧 Sending welcome email to: ${email}`);

      const result = await this.resend.emails.send({
        from: `Trendlin <${this.fromEmail}>`,
        to: email,
        subject: '🎉 Welcome to Trendlin Newsletter!',
        html: newsletterWelcomeTemplate({
          firstName: firstName || '',
          categories: categories || []
        }),
      });

      console.log(`✅ Welcome email sent to: ${email}`);
      return { success: true, result };
    } catch (error: any) {
      console.error('❌ Welcome email error:', error);
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }
  }

  /**
   * Send unsubscribe confirmation email
   */
  async sendUnsubscribeEmail(email: string, token: string, firstName?: string) {
    try {
      const siteUrl = process.env?.SITE_URL || process.env?.SITE || 'https://trendlin.com';
      const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${token}`;
      
      console.log(`📧 Sending unsubscribe email to: ${email}`);

      const result = await this.resend.emails.send({
        from: `Trendlin <${this.fromEmail}>`,
        to: email,
        subject: 'Unsubscribe from Trendlin Newsletter',
        html: unsubscribeEmailTemplate({
          firstName: firstName || '',
          unsubscribeUrl
        }),
      });

      console.log(`✅ Unsubscribe email sent to: ${email}`);
      return { success: true, result };
    } catch (error: any) {
      console.error('❌ Unsubscribe email error:', error);
      throw new Error(`Failed to send unsubscribe email: ${error.message}`);
    }
  }

  /**
   * Send newsletter digest/campaign email
   */
  async sendNewsletterDigest(data: {
    to: string;
    subject: string;
    title: string;
    subtitle?: string;
    content: string;
    unsubscribeUrl?: string;
  }) {
    try {
      console.log(`📧 Sending digest email to: ${data.to}`);

      const result = await this.resend.emails.send({
        from: `Trendlin <${this.fromEmail}>`,
        to: data.to,
        subject: data.subject,
        html: newsletterDigestTemplate({
          title: data.title,
          subtitle: data.subtitle || 'The latest reviews and insights',
          content: data.content
        }),
      });

      console.log(`✅ Digest email sent to: ${data.to}`);
      return { success: true, result };
    } catch (error: any) {
      console.error('❌ Digest email error:', error);
      throw new Error(`Failed to send digest: ${error.message}`);
    }
  }

  /**
   * Generic send email with retry logic
   */
  async sendEmail(options: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    from?: string;
    replyTo?: string;
  }, retryCount: number = 0): Promise<any> {
    try {
      console.log(`📧 Sending email to: ${options.to}`);

      const result = await this.resend.emails.send({
        from: options.from ? `${'Trendlin'} <${options.from}>` : `Trendlin <${this.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || '',
        replyTo: options.replyTo,
      });

      console.log(`✅ Email sent successfully! ID: ${result.id}`);
      return result;
    } catch (error: any) {
      // Retry logic with exponential backoff
      if (retryCount < this.maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000;
        console.log(`⚠️ Retry ${retryCount + 1} for ${options.to} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.sendEmail(options, retryCount + 1);
      }

      console.error(`❌ Email failed after ${this.maxRetries} retries:`, error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}