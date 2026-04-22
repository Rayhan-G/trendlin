// pages/api/auth/magic-link.js
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    // Check if subscriber exists and is verified
    const { data: subscriber, error } = await supabase
      .from('newsletter_subscribers')
      .select('email, status')
      .eq('email', email.toLowerCase())
      .eq('status', 'verified')
      .single();

    if (error || !subscriber) {
      return res.status(404).json({ error: 'No active subscription found for this email' });
    }

    // Generate secure token (32 bytes hex)
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await supabase
      .from('newsletter_subscribers')
      .update({
        auth_token: token,
        auth_token_expires_at: expiresAt.toISOString(),
      })
      .eq('email', email.toLowerCase());

    // Send magic link email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
    const magicLink = `${baseUrl}/newsletter/manage?token=${token}&email=${encodeURIComponent(email)}`;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: [email],
      subject: 'Manage Your Subscription',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: system-ui; max-width: 500px; margin: 0 auto; padding: 40px; text-align: center;">
          <div style="background: linear-gradient(135deg, #0f172a, #1e1b4b); padding: 40px; border-radius: 24px; color: white;">
            <div style="font-size: 48px; margin-bottom: 16px;">🔐</div>
            <h1 style="margin: 0 0 16px;">Manage Your Subscription</h1>
            <p style="margin: 0 0 24px; opacity: 0.8;">Click the button below to access your preferences.</p>
            <a href="${magicLink}" style="display: inline-block; background: #06b6d4; color: white; padding: 14px 32px; border-radius: 40px; text-decoration: none; font-weight: 600; margin: 0 0 24px;">
              Manage Subscription →
            </a>
            <p style="font-size: 12px; opacity: 0.5; margin: 0;">This link expires in 15 minutes.</p>
          </div>
        </body>
        </html>
      `,
    });

    return res.status(200).json({ success: true, message: 'Magic link sent!' });
  } catch (error) {
    console.error('Magic link error:', error);
    return res.status(500).json({ error: 'Failed to send magic link' });
  }
}