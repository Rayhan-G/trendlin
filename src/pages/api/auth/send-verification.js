// pages/api/auth/send-verification.js
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

  const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' })
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const verificationId = randomBytes(32).toString('hex') + Date.now()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  try {
    // Test Supabase connection first
    console.log('Testing Supabase connection...')
    const { data: testData, error: testError } = await supabase
      .from('verification_codes')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('Supabase connection test failed:', testError)
      return res.status(500).json({ error: 'Database connection error. Please try again.' })
    }
    
    console.log('Supabase connected. Inserting verification code...')

    // Store code in Supabase
    const { data: insertData, error: insertError } = await supabase
      .from('verification_codes')
      .insert({
        verification_id: verificationId,
        email: email.toLowerCase(),
        code: code,
        expires_at: expiresAt.toISOString(),
        used: false
      })
      .select()

    if (insertError) {
      console.error('Insert error details:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      })
      
      // Return specific error message
      if (insertError.code === '42P01') {
        return res.status(500).json({ error: 'Table "verification_codes" does not exist. Please create it in Supabase.' })
      }
      if (insertError.code === '42501') {
        return res.status(500).json({ error: 'Permission denied. Please check RLS policies.' })
      }
      return res.status(500).json({ error: `Failed to store verification code: ${insertError.message}` })
    }

    console.log('Verification code stored successfully:', { verificationId, email, code })

    const isDevelopment = process.env.NODE_ENV === 'development'

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

    // Send email via Resend
    const { error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
      to: email,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email Address</h2>
          <p>Thank you for signing up! Please use the verification code below:</p>
          <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; margin: 20px 0;">
            ${code}
          </div>
          <p>This code expires in <strong>10 minutes</strong>.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr />
          <p style="font-size: 12px; color: #666;">Stay informed, stay ahead.</p>
        </div>
      `
    })

    if (emailError) {
      console.error('Resend error:', emailError)
      await supabase.from('verification_codes').delete().eq('verification_id', verificationId)
      return res.status(500).json({ error: 'Failed to send verification email' })
    }

    return res.status(200).json({
      success: true,
      verificationId,
      message: 'Verification code sent successfully'
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return res.status(500).json({ error: 'An unexpected error occurred. Please try again.' })
  }
}