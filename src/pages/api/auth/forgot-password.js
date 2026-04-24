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
    await supabase.from('password_resets').delete().eq('user_id', user.id).eq('used', false)

    // Save token
    const { error: insertError } = await supabase.from('password_resets').insert({
      user_id: user.id,
      token,
      expires_at: expiresAt.toISOString(),
      used: false,
    })

    if (insertError) {
      throw new Error('Failed to save token')
    }

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

    // Send email
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: email,
      subject: 'Reset your password',
      html: `
        <h1>Reset Your Password</h1>
        <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, ignore this email.</p>
      `,
    })

    return res.status(200).json({ 
      success: true, 
      message: 'Reset link sent to your email' 
    })

  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}