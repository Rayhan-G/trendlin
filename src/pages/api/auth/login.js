// pages/api/auth/login.js
import bcrypt from 'bcrypt'
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { email, password, rememberMe } = req.body

  try {
    const { data: user } = await supabase.from('users').select('id, email, password_hash').eq('email', email.toLowerCase()).single()
    if (!user) return res.status(401).json({ error: 'Invalid email or password' })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' })

    await supabase.from('users').update({ last_login_at: new Date().toISOString() }).eq('id', user.id)

    const sessionToken = crypto.randomBytes(32).toString('hex')
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60
    const expiresAt = new Date(Date.now() + maxAge * 1000)
    await supabase.from('user_sessions').insert({ user_id: user.id, token: sessionToken, expires_at: expiresAt.toISOString() })

    const { data: prefs } = await supabase.from('newsletter_preferences').select('*').eq('user_id', user.id).single()
    res.setHeader('Set-Cookie', `session_token=${sessionToken}; Path=/; Max-Age=${maxAge}; SameSite=Lax; HttpOnly`)
    return res.status(200).json({ success: true, user: { id: user.id, email: user.email }, newsletter: prefs || { is_subscribed: false } })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to login' })
  }
}