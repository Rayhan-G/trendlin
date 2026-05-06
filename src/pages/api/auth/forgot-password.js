// ============================================
// FORGOT PASSWORD API - WITH RESEND
// ============================================
// FILE: pages/api/auth/forgot-password.js

import crypto from 'crypto';
import { Resend } from 'resend';
import { supabase } from '../../../lib/supabase';

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('email', email.toLowerCase())
      .single();

    // Always return success even if user doesn't exist (security best practice)
    if (userError || !user) {
      return res.status(200).json({ 
        message: 'If an account exists with this email, you will receive reset instructions.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing unused tokens for this user
    await supabase
      .from('password_resets')
      .delete()
      .eq('user_id', user.id)
      .eq('used', false);

    // Store new reset token
    const { error: tokenError } = await supabase
      .from('password_resets')
      .insert({
        user_id: user.id,
        token: resetToken,
        expires_at: resetExpires.toISOString(),
        used: false,
        created_at: new Date().toISOString()
      });

    if (tokenError) {
      console.error('Token storage error:', tokenError);
      return res.status(500).json({ error: 'Failed to process request' });
    }

    // Construct reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    
    // Email HTML template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1a1a1a; }
            .container { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 32px; }
            .logo { width: 48px; height: 48px; background: linear-gradient(135deg, #3b82f6, #4f46e5); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; }
            .logo span { font-size: 28px; }
            h1 { color: #1a1a1a; font-size: 28px; font-weight: 700; margin-bottom: 16px; }
            .content { background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
            .button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #4f46e5); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; margin: 24px 0; }
            .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #6b7280; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 24px 0; font-size: 14px; }
          </style>
        </head>
        <body style="margin: 0; background: #f9fafb;">
          <div class="container">
            <div class="header">
              <div class="logo">
                <span>📚</span>
              </div>
              <h1>Reset Your Password</h1>
            </div>
            <div class="content">
              <p>Hello${user.full_name ? ` ${user.full_name}` : ''},</p>
              <p>We received a request to reset the password for your account. Click the button below to create a new password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <div class="warning">
                <strong>⚠️ This link will expire in 1 hour</strong><br>
                If you didn't request this, you can safely ignore this email.
              </div>
              <p style="font-size: 14px; color: #6b7280;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="font-size: 12px; word-break: break-all; background: #f3f4f6; padding: 12px; border-radius: 8px;">${resetUrl}</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Readora. All rights reserved.</p>
              <p>This email was sent to ${email}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Readora <noreply@readora.com>',
      to: email,
      subject: 'Reset Your Password',
      html: emailHtml,
    });

    if (emailError) {
      console.error('Resend email error:', emailError);
      // Don't return error to user - they get success message anyway
      console.log(`Reset URL (fallback): ${resetUrl}`);
    } else {
      console.log(`Reset email sent to ${email}:`, emailData?.id);
    }

    return res.status(200).json({ 
      message: 'If an account exists with this email, you will receive reset instructions.' 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}