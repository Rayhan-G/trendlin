// pages/api/auth/verify-code.js
import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  const { email, code } = req.body

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and verification code are required' })
  }

  if (typeof email !== 'string' || typeof code !== 'string') {
    return res.status(400).json({ error: 'Invalid input format' })
  }

  const normalizedEmail = email.toLowerCase().trim()

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token: code,
      type: 'email'
    })

    if (error) {
      if (error.message.includes('OTP expired')) {
        return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' })
      }
      if (error.message.includes('Invalid token')) {
        return res.status(400).json({ error: 'Invalid verification code. Please check and try again.' })
      }
      throw error
    }

    return res.status(200).json({
      success: true,
      session: data.session,
      user: {
        id: data.user.id,
        email: data.user.email,
        createdAt: data.user.created_at
      }
    })

  } catch (error) {
    console.error('Verify code error:', error.message)
    return res.status(500).json({ error: 'Failed to verify code. Please try again.' })
  }
}