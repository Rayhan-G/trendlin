import { randomBytes } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

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
      return res.status(404).json({ error: 'No account found with this email' })
    }

    // Generate token
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    // Delete old tokens
    await supabase
      .from('password_resets')
      .delete()
      .eq('user_id', user.id)
      .eq('used', false)

    // Save token
    const { error: insertError } = await supabase
      .from('password_resets')
      .insert({
        user_id: user.id,
        token: token,
        expires_at: expiresAt.toISOString(),
        used: false
      })

    if (insertError) {
      throw new Error('Failed to save token')
    }

    // ✅ FIXED: Get the correct URL (no undefined)
    const baseUrl = process.env.NEXTAUTH_URL || 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
                    process.env.NEXT_PUBLIC_APP_URL ||
                    `https://${req.headers.host}`

    const resetUrl = `${baseUrl}/reset-password?token=${token}`

    console.log('Reset URL generated:', resetUrl) // Check your Vercel logs

    // Send email
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <h2>Reset Your Password</h2>
        <p>Click here to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link expires in 1 hour.</p>
      `
    })

    return res.status(200).json({
      success: true,
      message: `Reset link sent to ${email}`
    })

  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}