// pages/api/auth/me.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  const sessionToken = req.cookies.session_token
  if (!sessionToken) return res.status(200).json({ authenticated: false })

  try {
    const { data: session } = await supabase.from('user_sessions').select('*, user:users(id, email, created_at)').eq('token', sessionToken).single()
    if (!session || new Date(session.expires_at) < new Date()) {
      res.setHeader('Set-Cookie', 'session_token=; Path=/; Max-Age=0')
      return res.status(200).json({ authenticated: false })
    }

    const { data: prefs } = await supabase.from('newsletter_preferences').select('*').eq('user_id', session.user_id).single()
    return res.status(200).json({ authenticated: true, user: session.user, newsletter: prefs || { is_subscribed: false } })
  } catch (error) {
    return res.status(500).json({ error: 'Server error' })
  }
}