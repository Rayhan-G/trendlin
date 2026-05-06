// ============================================
// SEND VERIFICATION EMAIL API - WITH RESEND
// ============================================
// FILE: pages/api/auth/send-verification.js

import crypto from 'crypto';
import { Resend } from 'resend';
import { supabase } from '../../../lib/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Valid email address is required' });
  }

  const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, email, email_verified')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingUser) {
      if (existingUser.email_verified) {
        return res.status(400).json({ error: 'Email already registered and verified' });
      }
      
      // User exists but not verified - resend verification
      const verificationCode = crypto.randomInt(100000, 999999).toString();
      const codeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      
      // Store verification code
      await supabase
        .from('email_verifications')
        .upsert({
          email: normalizedEmail,
          code: verificationCode,
          expires_at: codeExpires.toISOString(),
          verified: false,
          attempts: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      // Send verification email
      await sendVerificationEmail(normalizedEmail, verificationCode);
      
      return res.status(200).json({
        success: true,
        message: 'Verification code sent to your email',
        expiresIn: 900, // 15 minutes in seconds
        requiresVerification: true
      });
    }

    // New user - create pending record and send verification
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const codeExpires = new Date(Date.now() + 15 * 60 * 1000);
    
    // Store verification code
    const { error: storeError } = await supabase
      .from('email_verifications')
      .insert({
        email: normalizedEmail,
        code: verificationCode,
        expires_at: codeExpires.toISOString(),
        verified: false,
        attempts: 0,
        created_at: new Date().toISOString()
      });
    
    if (storeError) {
      console.error('Store error:', storeError);
      return res.status(500).json({ error: 'Failed to process request' });
    }
    
    // Send verification email
    await sendVerificationEmail(normalizedEmail, verificationCode);
    
    return res.status(200).json({
      success: true,
      message: 'Verification code sent to your email',
      expiresIn: 900,
      requiresVerification: true
    });

  } catch (error) {
    console.error('Send verification error:', error);
    return res.status(500).json({ error: 'Failed to send verification code. Please try again.' });
  }
}

// Helper function to send verification email
async function sendVerificationEmail(email, code) {
  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email Address</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            margin: 0;
            background: #f9fafb;
          }
          .container {
            max-width: 560px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 32px;
          }
          .logo {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #3b82f6, #4f46e5);
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
          }
          .logo span {
            font-size: 28px;
          }
          h1 {
            color: #1a1a1a;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
          }
          .subtitle {
            color: #6b7280;
            font-size: 16px;
            margin-bottom: 32px;
          }
          .content {
            background: #ffffff;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            text-align: center;
          }
          .code-container {
            background: #f3f4f6;
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
            text-align: center;
          }
          .verification-code {
            font-size: 36px;
            font-weight: 700;
            letter-spacing: 8px;
            color: #1f2937;
            font-family: monospace;
            background: white;
            padding: 16px 24px;
            border-radius: 12px;
            display: inline-block;
            border: 1px solid #e5e7eb;
          }
          .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            border-radius: 8px;
            margin: 24px 0;
            font-size: 14px;
            text-align: left;
          }
          .footer {
            text-align: center;
            margin-top: 32px;
            font-size: 12px;
            color: #6b7280;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6, #4f46e5);
            color: #ffffff;
            text-decoration: none;
            padding: 12px 28px;
            border-radius: 8px;
            font-weight: 600;
            margin: 16px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <span>📚</span>
            </div>
            <h1>Verify Your Email</h1>
            <p class="subtitle">Thank you for joining Readora!</p>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Please use the verification code below to complete your registration:</p>
            
            <div class="code-container">
              <div class="verification-code">${code}</div>
            </div>
            
            <p>This code will expire in <strong>15 minutes</strong>.</p>
            
            <div class="warning">
              <strong>⚠️ Security Notice</strong><br>
              If you didn't request this verification, please ignore this email.
              Never share this code with anyone.
            </div>
            
            <p style="font-size: 14px; color: #6b7280;">
              Having trouble? Copy this code and paste it in the verification form.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Readora. All rights reserved.</p>
            <p>This email was sent to ${email}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'Readora <noreply@readora.com>',
    to: email,
    subject: 'Verify Your Email Address',
    html: emailHtml,
  });
}