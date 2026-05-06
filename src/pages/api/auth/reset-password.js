// ============================================
// RESET PASSWORD API - WITH RESEND
// ============================================
// FILE: pages/api/auth/reset-password.js

import bcrypt from 'bcrypt';
import { Resend } from 'resend';
import { supabase } from '../../../lib/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }

  // Validate password strength
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  
  if (!/[A-Z]/.test(newPassword)) {
    return res.status(400).json({ error: 'Password must contain at least one uppercase letter' });
  }
  
  if (!/[0-9]/.test(newPassword)) {
    return res.status(400).json({ error: 'Password must contain at least one number' });
  }

  try {
    // Find valid reset token
    const { data: resetRecord, error: tokenError } = await supabase
      .from('password_resets')
      .select('user_id, expires_at, used')
      .eq('token', token)
      .single();

    if (tokenError || !resetRecord) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    if (resetRecord.used) {
      return res.status(400).json({ error: 'This reset link has already been used' });
    }

    if (new Date(resetRecord.expires_at) < new Date()) {
      return res.status(400).json({ error: 'This reset link has expired' });
    }

    // Get user email for confirmation email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('id', resetRecord.user_id)
      .single();

    if (userError || !user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user's password
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', resetRecord.user_id);

    if (updateError) {
      console.error('Password update error:', updateError);
      return res.status(500).json({ error: 'Failed to update password' });
    }

    // Mark token as used
    await supabase
      .from('password_resets')
      .update({ used: true, used_at: new Date().toISOString() })
      .eq('token', token);

    // Delete all existing sessions for this user (force re-login)
    await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', resetRecord.user_id);

    // Send password changed confirmation email via Resend
    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Password Changed Successfully</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1a1a1a; }
            .container { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
            .content { background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); text-align: center; }
            .checkmark { width: 64px; height: 64px; background: #10b981; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px; }
            .checkmark span { font-size: 32px; }
          </style>
        </head>
        <body style="margin: 0; background: #f9fafb;">
          <div class="container">
            <div class="content">
              <div class="checkmark"><span>✓</span></div>
              <h2>Password Changed Successfully</h2>
              <p>Your password has been reset. You can now log in with your new password.</p>
              <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
                If you didn't make this change, please contact support immediately.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Readora <noreply@readora.com>',
      to: user.email,
      subject: 'Password Changed Successfully',
      html: confirmationHtml,
    }).catch(err => console.error('Confirmation email error:', err));

    return res.status(200).json({ 
      message: 'Password reset successful. Please log in with your new password.' 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}