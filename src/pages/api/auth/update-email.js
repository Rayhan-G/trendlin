// pages/api/newsletter/update-email.js
import { supabase } from '@/lib/supabase'

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

  // Update newsletter email only - NOT the user account email
  const { error: updateError } = await supabase
    .from('newsletter_preferences')
    .update({ 
      newsletter_email: email.toLowerCase(),
      updated_at: new Date().toISOString()
    })
    .eq('user_id', session.user_id)

  if (updateError) {
    console.error('Error updating newsletter email:', updateError)
    return res.status(500).json({ error: 'Failed to update newsletter email' })
  }

  // Mark verification code as used
  await supabase
    .from('verification_codes')
    .update({ used: true })
    .eq('verification_id', verificationId)

  return res.status(200).json({ 
    success: true, 
    message: 'Newsletter email updated successfully!' 
  })
}