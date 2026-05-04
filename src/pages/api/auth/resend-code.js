// pages/api/auth/resend-code.js
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

  const normalizedEmail = email.toLowerCase().trim()

  try {
    const { error } = await supabaseAdmin.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
      }
    })

    if (error) {
      if (error.message.includes('rate limit')) {
        return res.status(429).json({ error: 'Too many requests. Please wait before trying again.' })
      }
      throw error
    }

    return res.status(200).json({
      success: true,
      message: 'New verification code sent',
      expiresIn: 300
    })

  } catch (error) {
    console.error('Resend code error:', error.message)
    return res.status(500).json({ error: 'Failed to resend code. Please try again.' })
  }
}