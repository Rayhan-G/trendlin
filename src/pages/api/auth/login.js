// pages/api/auth/login.js
import bcrypt from 'bcrypt'
import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password, rememberMe } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' })
  }

  try {
    // Get user
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash')
      .eq('email', email.toLowerCase())
      .single()

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id)

    // Create session
    const sessionToken = crypto.randomBytes(32).toString('hex')
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60
    const expiresAt = new Date(Date.now() + maxAge * 1000)

    await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        token: sessionToken,
        expires_at: expiresAt.toISOString(),
      })

    // Get newsletter preferences
    const { data: prefs } = await supabase
      .from('newsletter_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Set cookie
    res.setHeader('Set-Cookie', `session_token=${sessionToken}; Path=/; Max-Age=${maxAge}; SameSite=Lax; HttpOnly`)

    return res.status(200).json({
      success: true,
      user: { id: user.id, email: user.email },
      newsletter: prefs || { is_subscribed: false },
    })

  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Failed to login' })
  }
}