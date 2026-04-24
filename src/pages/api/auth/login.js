import bcrypt from 'bcrypt'
import { supabase } from '../../../lib/supabase'
import { randomBytes } from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  const { email, password, rememberMe } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, password_hash, email_verified')
      .eq('email', email.toLowerCase())
      .single()

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    if (!user.email_verified) {
      return res.status(401).json({ error: 'Email not verified' })
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id)

    const sessionToken = randomBytes(64).toString('hex')
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60
    const expiresAt = new Date(Date.now() + maxAge * 1000)

    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        token: sessionToken,
        expires_at: expiresAt.toISOString(),
        user_agent: req.headers['user-agent'] || null,
        ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
        created_at: new Date().toISOString()
      })

    if (sessionError) {
      console.error('Session creation error:', sessionError)
      return res.status(500).json({ error: 'Failed to create session' })
    }

    const isProduction = process.env.NODE_ENV === 'production'
    res.setHeader('Set-Cookie', [
      `session_token=${sessionToken}; Path=/; Max-Age=${maxAge}; SameSite=Strict; ${isProduction ? 'Secure;' : ''} HttpOnly`,
      `session_expires=${expiresAt.toISOString()}; Path=/; Max-Age=${maxAge}; SameSite=Strict; ${isProduction ? 'Secure;' : ''}`
    ])

    return res.status(200).json({
      success: true,
      user: { id: user.id, email: user.email }
    })

  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'An internal server error occurred' })
  }
}