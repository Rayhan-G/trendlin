import { randomBytes } from 'crypto'
import { supabase } from '../../../lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  try {
    // Find user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single()

    if (userError || !user) {
      return res.status(404).json({ 
        error: `No account found with ${email}`
      })
    }

    // Generate reset token
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    // Delete old tokens
    await supabase
      .from('password_resets')
      .delete()
      .eq('user_id', user.id)
      .eq('used', false)

    // Save new token
    const { error: insertError } = await supabase
      .from('password_resets')
      .insert({
        user_id: user.id,
        token: token,
        expires_at: expiresAt.toISOString(),
        used: false
      })

    if (insertError) {
      console.error('Insert error:', insertError)
      throw new Error('Failed to save token')
    }

    // Get base URL
    const baseUrl = process.env.NEXTAUTH_URL || `https://${process.env.VERCEL_URL}` || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/reset-password?token=${token}`

    console.log('Reset URL:', resetUrl)

    // Send email using Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: 'Reset Your Password',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Reset Your Password</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { font-size: 12px; color: #666; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Reset Your Password</h2>
              <p>We received a request to reset your password for <strong>${email}</strong>.</p>
              <p>Click the button below to create a new password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="background: #f4f4f4; padding: 10px; word-break: break-all;">${resetUrl}</p>
              <p>This link will expire in <strong>1 hour</strong>.</p>
              <p>If you didn't request this, please ignore this email.</p>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} YourApp. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `
    })

    if (emailError) {
      console.error('Email error:', emailError)
      return res.status(500).json({ error: 'Failed to send reset email. Please try again.' })
    }

    console.log('Email sent:', emailData)

    return res.status(200).json({
      success: true,
      message: `✅ Reset link sent to ${email}. Check your inbox (and spam folder).`
    })

  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}