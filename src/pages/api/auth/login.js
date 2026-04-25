import bcrypt from 'bcrypt'
import { supabase } from '../../../lib/supabase'
import crypto from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  const { email, password, rememberMe = false } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const adminEmail = process.env.ADMIN_EMAIL
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

  if (!adminEmail || !adminPasswordHash) {
    console.error('Admin credentials not configured')
    return res.status(500).json({ error: 'Authentication service error' })
  }

  try {
    // Check if it's admin login
    if (email.toLowerCase() === adminEmail.toLowerCase()) {
      const isValid = await bcrypt.compare(password, adminPasswordHash)
      
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid email or password' })
      }

      // Generate session token
      const sessionToken = crypto.randomBytes(64).toString('hex')
      const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60
      const expiresAt = new Date(Date.now() + maxAge * 1000)

      // Store admin session
      const { error: sessionError } = await supabase
        .from('admin_sessions')
        .insert({
          token: sessionToken,
          expires_at: expiresAt.toISOString(),
          user_agent: req.headers['user-agent'] || null,
          ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress || null
        })

      if (sessionError) {
        console.error('Session creation error:', sessionError)
        return res.status(500).json({ error: 'Failed to create session' })
      }

      // Set cookies
      const isProduction = process.env.NODE_ENV === 'production'
      res.setHeader('Set-Cookie', [
        `session_token=${sessionToken}; Path=/; Max-Age=${maxAge}; SameSite=Strict; ${isProduction ? 'Secure;' : ''} HttpOnly`,
        `is_admin=true; Path=/; Max-Age=${maxAge}; SameSite=Strict`,
        `session_expires=${expiresAt.toISOString()}; Path=/; Max-Age=${maxAge}; SameSite=Strict`
      ])

      // Return success with admin data
      return res.status(200).json({
        success: true,
        user: {
          id: 'admin',
          email: adminEmail,
          is_admin: true
        },
        isAdmin: true
      })
    }

    // If not admin, return error (or handle regular users if you have them)
    return res.status(401).json({ error: 'Invalid email or password' })

  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}