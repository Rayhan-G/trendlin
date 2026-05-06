// ============================================
// NEWSLETTER EMAIL UPDATE - ENTERPRISE GRADE
// ============================================
// FILE: pages/api/newsletter/update-email.js

import { supabase } from '../../../lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Security headers
  setSecurityHeaders(res);

  // Only allow PUT requests
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // ============================================
    // 1. AUTHENTICATION - Check user session
    // ============================================
    const sessionToken = req.cookies.session_token;
    
    if (!sessionToken) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required',
        code: 'NO_SESSION'
      });
    }

    // Get user from session
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('user_id, expires_at')
      .eq('token', sessionToken)
      .single();

    if (sessionError || !session) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid or expired session',
        code: 'INVALID_SESSION'
      });
    }

    // Check session expiration
    if (new Date(session.expires_at) < new Date()) {
      await supabase.from('user_sessions').delete().eq('token', sessionToken);
      return res.status(401).json({ 
        success: false, 
        error: 'Session expired',
        code: 'SESSION_EXPIRED'
      });
    }

    // ============================================
    // 2. VALIDATE REQUEST BODY
    // ============================================
    const { email, verificationCode, verificationId } = req.body;

    // Validate required fields
    if (!email || !verificationCode || !verificationId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email, verification code, and verification ID are required',
        code: 'MISSING_FIELDS'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please enter a valid email address',
        code: 'INVALID_EMAIL'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ============================================
    // 3. VERIFY THE CODE
    // ============================================
    const { data: verification, error: verifyError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('verification_id', verificationId)
      .eq('email', normalizedEmail)
      .eq('code', verificationCode)
      .eq('used', false)
      .single();

    if (verifyError || !verification) {
      // Increment failed attempts
      await incrementFailedAttempts(verificationId);
      
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid verification code',
        code: 'INVALID_CODE'
      });
    }

    // Check if code is expired
    if (new Date(verification.expires_at) < new Date()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Verification code has expired. Please request a new one.',
        code: 'CODE_EXPIRED'
      });
    }

    // ============================================
    // 4. GET CURRENT USER DATA
    // ============================================
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', session.user_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // ============================================
    // 5. UPDATE NEWSLETTER PREFERENCES
    // ============================================
    const { data: existingPrefs, error: prefError } = await supabase
      .from('newsletter_preferences')
      .select('*')
      .eq('user_id', session.user_id)
      .maybeSingle();

    let updateError;
    
    if (!existingPrefs) {
      // Create new preferences
      const { error: insertError } = await supabase
        .from('newsletter_preferences')
        .insert({
          user_id: session.user_id,
          newsletter_email: normalizedEmail,
          is_subscribed: true,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        });
      updateError = insertError;
    } else {
      // Update existing preferences
      const { error: updateErr } = await supabase
        .from('newsletter_preferences')
        .update({ 
          newsletter_email: normalizedEmail,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user_id);
      updateError = updateErr;
    }

    if (updateError) {
      console.error('Error updating newsletter email:', updateError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to update newsletter email',
        code: 'DB_UPDATE_ERROR'
      });
    }

    // ============================================
    // 6. MARK VERIFICATION CODE AS USED
    // ============================================
    await supabase
      .from('verification_codes')
      .update({ 
        used: true, 
        used_at: new Date().toISOString(),
        used_by_user_id: session.user_id
      })
      .eq('verification_id', verificationId);

    // ============================================
    // 7. SEND CONFIRMATION EMAIL
    // ============================================
    await sendConfirmationEmail(normalizedEmail, user.full_name);

    // ============================================
    // 8. LOG THE CHANGE
    // ============================================
    await logEmailChange(session.user_id, user.email, normalizedEmail);

    // ============================================
    // 9. RETURN SUCCESS RESPONSE
    // ============================================
    return res.status(200).json({ 
      success: true, 
      message: 'Newsletter email updated successfully!',
      data: {
        email: normalizedEmail,
        updated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Newsletter email update error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
}

async function incrementFailedAttempts(verificationId) {
  try {
    await supabase
      .from('verification_codes')
      .update({ 
        attempts: supabase.raw('COALESCE(attempts, 0) + 1')
      })
      .eq('verification_id', verificationId);
  } catch (error) {
    console.error('Failed to increment attempts:', error);
  }
}

async function sendConfirmationEmail(email, name) {
  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Newsletter Email Updated</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1a1a1a; }
          .container { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
          .content { background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); text-align: center; }
          .checkmark { width: 64px; height: 64px; background: #10b981; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px; }
          .checkmark span { font-size: 32px; color: white; }
        </style>
      </head>
      <body style="margin: 0; background: #f9fafb;">
        <div class="container">
          <div class="content">
            <div class="checkmark"><span>✓</span></div>
            <h2>Newsletter Email Updated</h2>
            <p>Hello${name ? ` ${name}` : ''},</p>
            <p>Your newsletter subscription email has been successfully updated to:</p>
            <p style="font-size: 18px; font-weight: 600; color: #1f2937;">${email}</p>
            <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
              You can change this anytime in your account settings.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Readora <noreply@readora.com>',
      to: email,
      subject: 'Newsletter Email Updated',
      html: emailHtml,
    });
  } catch (error) {
    console.error('Confirmation email error:', error);
    // Don't throw - email update was successful
  }
}

async function logEmailChange(userId, oldEmail, newEmail) {
  try {
    await supabase.from('user_activity_logs').insert({
      user_id: userId,
      action: 'newsletter_email_update',
      metadata: {
        old_email: oldEmail,
        new_email: newEmail,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Activity logging error:', error);
  }
}