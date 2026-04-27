// pages/api/auth/update-email.js
import { supabase } from '@/lib/supabase'
import { randomBytes } from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sessionToken = req.cookies.session_token
  if (!sessionToken) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  const { data: session } = await supabase
    .from('user_sessions')
    .select('user_id')
    .eq('token', sessionToken)
    .single()

  if (!session) {
    return res.status(401).json({ error: 'Invalid session' })
  }

  const { email, verificationCode, verificationId } = req.body

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' })
  }

  if (!verificationCode || !verificationId) {
    return res.status(400).json({ error: 'Verification required. Please verify your new email first.' })
  }

  // Verify the code
  const { data: verification, error: verifyError } = await supabase
    .from('verification_codes')
    .select('*')
    .eq('verification_id', verificationId)
    .eq('email', email.toLowerCase())
    .eq('code', verificationCode)
    .eq('used', false)
    .single()

  if (verifyError || !verification) {
    return res.status(400).json({ error: 'Invalid or expired verification code' })
  }

  // Check if code expired
  if (new Date(verification.expires_at) < new Date()) {
    return res.status(400).json({ error: 'Verification code has expired' })
  }

  // Check if email already exists
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase())
    .neq('id', session.user_id)
    .maybeSingle()

  if (existing) {
    return res.status(409).json({ error: 'Email already in use' })
  }

  // Update user's email
  const { error: updateError } = await supabase
    .from('users')
    .update({ email: email.toLowerCase() })
    .eq('id', session.user_id)

  if (updateError) {
    return res.status(500).json({ error: 'Failed to update email' })
  }

  // Mark verification code as used
  await supabase
    .from('verification_codes')
    .update({ used: true })
    .eq('verification_id', verificationId)

  return res.status(200).json({ success: true, message: 'Email updated successfully!' })
}