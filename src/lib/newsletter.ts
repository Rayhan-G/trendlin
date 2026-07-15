// /src/lib/newsletter.ts
import { Resend } from 'resend';
import { generateToken as genToken } from './auth';

export async function generateToken(): Promise<string> {
  return genToken(32);
}

export async function sendVerificationEmail(email: string, token: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const baseUrl = process.env.BASE_URL || 'https://trendlin.com';

  try {
    await resend.emails.send({
      from: 'Trendlin <newsletter@trendlin.com>',
      to: email,
      subject: 'Verify Your Subscription to Trendlin',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .button { 
                display: inline-block; 
                padding: 12px 24px; 
                background-color: #3b82f6; 
                color: white; 
                text-decoration: none; 
                border-radius: 4px; 
              }
              .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Verify Your Email</h1>
              <p>Thanks for subscribing to Trendlin! Please click the button below to verify your email address.</p>
              <p>
                <a href="${baseUrl}/api/newsletter/verify?token=${token}" class="button">
                  Verify Subscription
                </a>
              </p>
              <p>Or copy this link into your browser:</p>
              <p>${baseUrl}/api/newsletter/verify?token=${token}</p>
              <p>If you didn't subscribe to Trendlin, you can ignore this email.</p>
              <div class="footer">
                <p>&copy; 2024 Trendlin. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}

export async function sendNewsletterEmail(
  to: string,
  subject: string,
  html: string,
  campaignId: number,
  subscriberId: number
) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const result = await resend.emails.send({
      from: 'Trendlin <newsletter@trendlin.com>',
      to,
      subject,
      html,
      headers: {
        'X-Campaign-ID': campaignId.toString(),
        'X-Subscriber-ID': subscriberId.toString(),
      },
    });

    return result;
  } catch (error) {
    console.error('Error sending newsletter email:', error);
    throw error;
  }
}