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

    if (userError || !user) {
      // For security, still return success even if user doesn't exist
      return res.status(200).json({ 
        message: 'If an account exists with this email, you will receive reset instructions.' 
      })
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour expiry

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
      return res.status(500).json({ error: 'Failed to process request' })
    }

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

    const isDevelopment = process.env.NODE_ENV === 'development'

    if (isDevelopment || !resend) {
      console.log('\n' + '='.repeat(50))
      console.log(`🔐 PASSWORD RESET LINK`)
      console.log(`📧 Email: ${email}`)
      console.log(`🔗 Reset URL: ${resetUrl}`)
      console.log(`⏰ Expires in: 1 hour`)
      console.log('='.repeat(50) + '\n')

      return res.status(200).json({
        message: isDevelopment 
          ? 'Password reset link sent (check console)' 
          : 'If an account exists with this email, you will receive reset instructions.'
      })
    }

    // Send email
    const { error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
      to: email,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>You requested to reset your password. Click the button below to proceed:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #9333EA; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="background: #f0f0f0; padding: 10px; word-break: break-all;">${resetUrl}</p>
          <p>This link expires in <strong>1 hour</strong>.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr />
          <p style="font-size: 12px; color: #666;">Stay informed, stay ahead.</p>
        </div>
      `
    })

    if (emailError) {
      console.error('Resend error:', emailError)
      return res.status(500).json({ error: 'Failed to send reset email' })
    }

    return res.status(200).json({
      message: 'If an account exists with this email, you will receive reset instructions.'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return res.status(500).json({ error: 'An unexpected error occurred' })
  }
}