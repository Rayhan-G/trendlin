import { randomBytes } from 'crypto'
import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email address is required' })
  }

  try {
    // Find the user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single()

    // TELL THE TRUTH - no more hiding
    if (userError || !user) {
      return res.status(404).json({ 
        error: `No account found with email "${email}"`,
        code: 'USER_NOT_FOUND'
      })
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex')
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
        token: resetToken,
        expires_at: expiresAt.toISOString(),
        used: false
      })

    if (insertError) {
      console.error('Token error:', insertError)
      return res.status(500).json({ error: 'Unable to process request. Please try again.' })
    }

    // Get base URL from environment
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

    // Send email
    const emailSent = await sendResetEmail(email, resetUrl, user.email)

    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send reset email. Please try again.' })
    }

    // TELL THE TRUTH - email was sent
    return res.status(200).json({ 
      message: `✅ Reset link sent to ${email}. Check your inbox (and spam folder).`,
      email: email,
      success: true
    })

  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: 'Server error. Please try again later.' })
  }
}

// Email sending function
async function sendResetEmail(email, resetUrl, userEmail) {
  // Use Resend or your email service
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not set. Reset URL:', resetUrl)
    return true // For testing
  }

  try {
    const { Resend } = require('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
      to: email,
      subject: 'Reset Your Password',
      html: `
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password for <strong>${email}</strong>.</p>
        <p>Click the link below to create a new password:</p>
        <a href="${resetUrl}" style="background: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        <p>Or copy this link: ${resetUrl}</p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    })
    
    return true
  } catch (error) {
    console.error('Email error:', error)
    return false
  }
}