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
      console.log('Password reset attempted for non-existent email:', email)
      return res.status(404).json({ 
        error: 'No account found with this email address',
        exists: false
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

    // Get the correct base URL
    // For development: use the request's origin or localhost
    // For production: use environment variable
    let baseUrl
    
    if (process.env.NODE_ENV === 'development') {
      // In development, use the request's origin or fallback to localhost
      baseUrl = req.headers.origin || 'http://localhost:3000'
    } else {
      // In production, use environment variable
      baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL
    }
    
    // Remove trailing slash if present
    baseUrl = baseUrl.replace(/\/$/, '')
    
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

    console.log('Reset URL generated:', resetUrl)
    console.log('Environment:', process.env.NODE_ENV)
    console.log('Base URL used:', baseUrl)

    const isDevelopment = process.env.NODE_ENV === 'development'

    if (isDevelopment || !resend) {
      // Log the reset link in development
      console.log('\n' + '='.repeat(60))
      console.log('🔐 PASSWORD RESET REQUEST')
      console.log('='.repeat(60))
      console.log(`✅ Account found for: ${email}`)
      console.log(`📧 Email: ${email}`)
      console.log(`🔗 Reset Link: ${resetUrl}`)
      console.log(`⏰ Expires: ${expiresAt.toLocaleString()}`)
      console.log('='.repeat(60) + '\n')

      return res.status(200).json({ 
        success: true,
        message: 'Reset link sent! Check your terminal console for the link.',
        exists: true,
        resetLink: resetUrl // Send the link back to the frontend in development
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
          <p>We received a request to reset the password for <strong>${email}</strong>.</p>
          <p>Click the button below to create a new password:</p>
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
      success: true,
      message: 'Password reset instructions have been sent to your email address.',
      exists: true
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return res.status(500).json({ error: 'An unexpected error occurred. Please try again.' })
  }
}