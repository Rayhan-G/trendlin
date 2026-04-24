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

  try {
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single()

    // For security, always return success even if user doesn't exist
    if (userError || !user) {
      console.log('User not found:', email)
      return res.status(200).json({ 
        message: 'If an account exists with this email, you will receive reset instructions.' 
      })
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour expiry

    // Delete any existing unused tokens for this user
    await supabase
      .from('password_resets')
      .delete()
      .eq('user_id', user.id)
      .eq('used', false)

    // Store token in database
    const { error: tokenError } = await supabase
      .from('password_resets')
      .insert({
        user_id: user.id,
        token: resetToken,
        expires_at: expiresAt.toISOString(),
        used: false
      })

    if (tokenError) {
      console.error('Token storage error:', tokenError)
      return res.status(500).json({ error: 'Failed to process request. Please try again.' })
    }

    // Create reset URL
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

    const isDevelopment = process.env.NODE_ENV === 'development'

    if (isDevelopment || !resend) {
      // Log the reset link in development
      console.log('\n' + '='.repeat(60))
      console.log('🔐 PASSWORD RESET REQUEST')
      console.log('='.repeat(60))
      console.log(`📧 Email: ${email}`)
      console.log(`🔗 Reset Link: ${resetUrl}`)
      console.log(`⏰ Expires: ${expiresAt.toLocaleString()}`)
      console.log('='.repeat(60) + '\n')

      return res.status(200).json({ 
        message: isDevelopment 
          ? 'Reset link sent! Check your terminal/console for the link.' 
          : 'If an account exists with this email, you will receive reset instructions.'
      })
    }

    // Send email via Resend
    const { error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
      to: email,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Reset Your Password</h2>
          <p>You requested to reset your password. Click the button below to proceed:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #06b6d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="background: #f4f4f4; padding: 10px; word-break: break-all; border-radius: 5px;">
            ${resetUrl}
          </p>
          <p>This link expires in <strong>1 hour</strong>.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">Stay informed, stay ahead.</p>
        </div>
      `
    })

    if (emailError) {
      console.error('Resend error:', emailError)
      return res.status(500).json({ error: 'Failed to send reset email. Please try again.' })
    }

    return res.status(200).json({ 
      message: 'If an account exists with this email, you will receive reset instructions.'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return res.status(500).json({ error: 'An unexpected error occurred. Please try again.' })
  }
}