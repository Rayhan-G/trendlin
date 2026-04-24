// pages/api/auth/send-verification.js
import { Resend } from 'resend'
import { randomBytes } from 'crypto'
import { supabase } from '@/lib/supabase'

// Initialize Resend (only if API key exists)
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

  // Generate 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const verificationId = randomBytes(32).toString('hex') + Date.now()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  // Store code in Supabase
  const { error: insertError } = await supabase
    .from('verification_codes')
    .insert({
      verification_id: verificationId,
      email: email.toLowerCase(),
      code: code,
      expires_at: expiresAt.toISOString(),
      used: false
    })

  if (insertError) {
    console.error('Failed to store verification code:', insertError)
    return res.status(500).json({ error: 'Failed to send verification code' })
  }

  const isDevelopment = process.env.NODE_ENV === 'development'

  // Development mode - log code to console
  if (isDevelopment || !resend) {
    console.log('\n' + '='.repeat(50))
    console.log(`🔐 VERIFICATION CODE`)
    console.log(`📧 Email: ${email}`)
    console.log(`🔢 Code: ${code}`)
    console.log(`🆔 Verification ID: ${verificationId}`)
    console.log(`⏰ Expires in: 10 minutes`)
    console.log('='.repeat(50) + '\n')

    return res.status(200).json({
      success: true,
      verificationId,
      message: isDevelopment ? 'Verification code sent (check console)' : 'Verification code sent'
    })
  }

  // Production mode - send via Resend
  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
      to: email,
      subject: 'Verify your email address',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { font-size: 48px; }
            .code { background: #f0f0f0; padding: 20px; text-align: center; font-size: 36px; font-weight: bold; letter-spacing: 8px; border-radius: 12px; margin: 20px 0; font-family: monospace; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; border-top: 1px solid #eee; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">📬</div>
              <h2>Verify Your Email Address</h2>
            </div>
            <p>Hello,</p>
            <p>Thank you for signing up! Please use the verification code below to complete your registration:</p>
            <div class="code">${code}</div>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <div class="footer">
              <p>Stay informed, stay ahead.</p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('Resend error:', error)
      await supabase.from('verification_codes').delete().eq('verification_id', verificationId)
      return res.status(500).json({ error: 'Failed to send verification email' })
    }

    return res.status(200).json({
      success: true,
      verificationId,
      message: 'Verification code sent successfully'
    })

  } catch (error) {
    console.error('Email sending error:', error)
    await supabase.from('verification_codes').delete().eq('verification_id', verificationId)
    return res.status(500).json({ error: 'Unable to send verification email. Please try again.' })
  }
}