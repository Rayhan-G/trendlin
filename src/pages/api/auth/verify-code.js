// pages/api/auth/verify-code.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  const { email, code, verificationId } = req.body

  if (!email || !code || !verificationId) {
    return res.status(400).json({ error: 'Email, verification code, and verification ID are required' })
  }

  try {
    // Get verification code from Supabase
    const { data: record, error: fetchError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('verification_id', verificationId)
      .eq('email', email.toLowerCase())
      .eq('used', false)
      .single()

    if (fetchError || !record) {
      return res.status(400).json({ error: 'Invalid or expired verification code. Please request a new one.' })
    }

    // Check if expired
    if (new Date(record.expires_at) < new Date()) {
      // Mark as expired
      await supabase.from('verification_codes').update({ used: true }).eq('verification_id', verificationId)
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' })
    }

    // Check if code matches
    if (record.code !== code) {
      return res.status(400).json({ error: 'Invalid verification code. Please try again.' })
    }

    // Mark code as used
    await supabase
      .from('verification_codes')
      .update({ used: true })
      .eq('verification_id', verificationId)

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    })

  } catch (error) {
    console.error('Verification error:', error)
    return res.status(500).json({ error: 'An internal server error occurred. Please try again.' })
  }
}