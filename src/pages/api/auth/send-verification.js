// pages/api/auth/send-verification.js (you already have this)
import { randomBytes } from 'crypto'
import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email address is required' })
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const verificationId = randomBytes(32).toString('hex') + Date.now()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  try {
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
      console.error('Insert error:', insertError)
      return res.status(500).json({ error: 'Failed to store verification code' })
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('\n🔐 VERIFICATION CODE:')
      console.log(`📧 Email: ${email}`)
      console.log(`🔢 Code: ${code}`)
      console.log(`🆔 ID: ${verificationId}\n`)
    }

    return res.status(200).json({
      success: true,
      verificationId,
      message: process.env.NODE_ENV === 'development' ? 'Check console for code' : 'Verification code sent'
    })

  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: 'An unexpected error occurred' })
  }
}