// ============================================
// Email Service using Resend
// ============================================

import { Resend } from 'resend';
import { contactEmailTemplate, autoReplyTemplate, notificationEmailTemplate } from './email-templates.js';

export class EmailService {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Resend API key is required');
    }
    this.resend = new Resend(apiKey);
    this.fromEmail = 'noreply@trendlin.com'; // Must be verified in Resend
  }

  async sendContactEmail(data) {
    try {
      const { name, email, subject, message, phone, ip, userAgent } = data;
      
      // Send notification to admin
      const adminResult = await this.resend.emails.send({
        from: this.fromEmail,
        to: 'contact@trendlin.com', // Your admin email
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

      // Send auto-reply to user
      const autoReplyResult = await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Thank You for Contacting Trendlin',
        html: autoReplyTemplate({
          name,
          subject,
          message
        }),
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

  async sendNotification(data) {
    try {
      const { to, title, message, cta } = data;
      
      const result = await this.resend.emails.send({
        from: this.fromEmail,
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

  async sendWelcomeEmail(email, name) {
    try {
      const result = await this.resend.emails.send({
        from: this.fromEmail,
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