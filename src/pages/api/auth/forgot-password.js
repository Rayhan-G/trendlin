// pages/api/auth/forgot-password.js
import { Resend } from 'resend'
import { randomBytes } from 'crypto'
import { supabase } from '@/lib/supabase'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email address is required' })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' })
  }

  try {
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single()

    // Don't reveal if user exists or not (security best practice)
    if (userError || !user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account exists, you will receive a password reset email.'
      })
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store token in database
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        token: resetToken,
        expires_at: expiresAt.toISOString(),
        used: false
      })

    if (tokenError) {
      console.error('Token creation error:', tokenError)
      return res.status(500).json({ error: 'Failed to process request' })
    }

    // Generate reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || getBaseUrl(req)}/reset-password?token=${resetToken}`

    const isDevelopment = process.env.NODE_ENV === 'development'

    // Development mode - log reset link
    if (isDevelopment || !resend) {
      console.log('\n' + '='.repeat(50))
      console.log(`🔐 PASSWORD RESET LINK`)
      console.log(`📧 Email: ${email}`)
      console.log(`🔗 Reset URL: ${resetUrl}`)
      console.log(`⏰ Expires in: 1 hour`)
      console.log('='.repeat(50) + '\n')

      return res.status(200).json({
        success: true,
        resetToken, // Only include in development
        message: 'Password reset link sent (check console)'
      })
    }

    // Production - send email via Resend
    const { error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
      to: email,
      subject: 'Reset Your Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { font-size: 48px; }
            .button { background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; border-top: 1px solid #eee; margin-top: 30px; }
            .warning { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🔐</div>
              <h2>Reset Your Password</h2>
            </div>
            <p>Hello,</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${resetUrl}</p>
            <div class="warning">
              <strong>⚠️ This link will expire in 1 hour.</strong><br>
              If you didn't request this, please ignore this email.
            </div>
            <div class="footer">
              <p>Stay informed, stay ahead.</p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    if (emailError) {
      console.error('Resend error:', emailError)
      await supabase.from('password_reset_tokens').delete().eq('token', resetToken)
      return res.status(500).json({ error: 'Failed to send reset email' })
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return res.status(500).json({ error: 'An internal server error occurred' })
  }
}

function getBaseUrl(req) {
  const protocol = req.headers['x-forwarded-proto'] || 'http'
  const host = req.headers['host']
  return `${protocol}://${host}`
}