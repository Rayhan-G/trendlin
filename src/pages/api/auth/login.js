// pages/api/auth/login.js
import bcrypt from 'bcrypt'
import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password, rememberMe } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' })
  }

  try {
    // Get user with one query
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, password_hash')
      .eq('email', email.toLowerCase())
      .single()

    if (userError || !user) {
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
    
    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert({ 
        user_id: user.id, 
        token: sessionToken, 
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      })
    
    if (sessionError) throw sessionError

    // Get newsletter preferences in same pattern as me.js
    const { data: prefs } = await supabase
      .from('newsletter_preferences')
      .select('is_subscribed, categories, delivery_frequency')
      .eq('user_id', user.id)
      .maybeSingle()

    // Set cookie
    res.setHeader('Set-Cookie', `session_token=${sessionToken}; Path=/; Max-Age=${maxAge}; SameSite=Lax; HttpOnly; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`)
    
    return res.status(200).json({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email 
      },
      newsletter: prefs || { is_subscribed: false, categories: [], delivery_frequency: 'weekly' }
    })
    
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Failed to login' })
  }
}