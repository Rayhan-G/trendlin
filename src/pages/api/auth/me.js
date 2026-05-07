// src/pages/api/auth/me.js
import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  const sessionToken = req.cookies.session_token
  
  if (!sessionToken) {
    return res.status(200).json({ authenticated: false })
  }

  // Check user session
  const { data: session } = await supabase
    .from('user_sessions')
    .select('user_id')
    .eq('token', sessionToken)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!session) {
    return res.status(200).json({ authenticated: false })
  }

  // Get user
  const { data: user } = await supabase
    .from('users')
    .select('id, email')
    .eq('id', session.user_id)
    .single()

  return res.status(200).json({
    authenticated: true,
    user: { id: user.id, email: user.email }
  })
}