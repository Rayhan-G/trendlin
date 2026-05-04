// pages/api/auth/send-verification.js
import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  const { email } = req.body

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Valid email address is required' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' })
  }

  const normalizedEmail = email.toLowerCase().trim()

  try {
    const { data: existingUser, error: fetchError } = await supabaseAdmin.auth.admin.getUserByEmail(normalizedEmail)

    if (fetchError && fetchError.message !== 'User not found') {
      throw fetchError
    }

    if (existingUser?.user) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    const { data, error } = await supabaseAdmin.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
      }
    })

    if (error) throw error

    return res.status(200).json({
      success: true,
      message: 'Verification code sent to your email',
      expiresIn: 300
    })

  } catch (error) {
    console.error('Send verification error:', error.message)
    return res.status(500).json({ error: 'Failed to send verification code. Please try again.' })
  }
}