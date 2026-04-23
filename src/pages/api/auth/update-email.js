// src/pages/api/auth/update-email.js
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

  const { email } = req.body

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' })
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

  const { error: updateError } = await supabase
    .from('users')
    .update({ email: email.toLowerCase() })
    .eq('id', session.user_id)

  if (updateError) {
    return res.status(500).json({ error: 'Failed to update email' })
  }

  return res.status(200).json({ success: true })
}