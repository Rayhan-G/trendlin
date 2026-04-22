// pages/api/send-welcome-email.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, categories, unsubscribeToken } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  const unsubscribeLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/api/unsubscribe?token=${unsubscribeToken}`;
  const manageLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/newsletter/manage`;

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: [email],
      subject: 'Welcome to Our Newsletter! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 40px; border-radius: 24px; color: white;">
            <div style="text-align: center; font-size: 48px; margin-bottom: 16px;">📬</div>
            <h1 style="margin: 0 0 16px; text-align: center;">Welcome aboard!</h1>
            <p style="margin: 0 0 8px;">You're now subscribed to:</p>
            <div style="background: rgba(255,255,255,0.1); padding: 16px; border-radius: 16px; margin: 16px 0;">
              ${categories?.map(cat => `• ${cat}`).join('<br>') || '• All categories'}
            </div>
            <p style="margin: 16px 0 0; opacity: 0.7; font-size: 14px;">
              You'll receive updates based on your preferences. The first newsletter will arrive soon.
            </p>
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
              <a href="${unsubscribeLink}" style="color: rgba(255,255,255,0.5); font-size: 12px; text-decoration: none;">Unsubscribe</a>
              <span style="color: rgba(255,255,255,0.3); margin: 0 12px;">•</span>
              <a href="${manageLink}?email=${encodeURIComponent(email)}" style="color: rgba(255,255,255,0.5); font-size: 12px; text-decoration: none;">Manage preferences</a>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Welcome email error:', error);
    return res.status(500).json({ error: 'Failed to send welcome email' });
  }
}