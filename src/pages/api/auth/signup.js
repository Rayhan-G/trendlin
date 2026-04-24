// pages/api/auth/signup.js
import bcrypt from 'bcrypt'
import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  const { email, password, emailVerified } = req.body

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' })
  }

  // Validate password strength
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' })
  }
  
  if (!/[A-Z]/.test(password)) {
    return res.status(400).json({ error: 'Password must contain at least one uppercase letter' })
  }
  
  if (!/[a-z]/.test(password)) {
    return res.status(400).json({ error: 'Password must contain at least one lowercase letter' })
  }
  
  if (!/[0-9]/.test(password)) {
    return res.status(400).json({ error: 'Password must contain at least one number' })
  }

  // Check if email is verified
  if (!emailVerified) {
    return res.status(400).json({ error: 'Please verify your email address before creating an account' })
  }

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists' })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        email_verified: true,
        email_verified_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select('id, email')
      .single()

    if (userError) {
      console.error('User creation error:', userError)
      return res.status(500).json({ error: 'Failed to create account' })
    }

    // Create newsletter preferences
    const { error: newsletterError } = await supabase
      .from('newsletter_preferences')
      .insert({
        user_id: user.id,
        is_subscribed: false,
        categories: [],
        delivery_frequency: 'weekly',
        max_posts_per_week: 5,
        post_format: 'digest',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (newsletterError) {
      // Non-critical error, log but continue
      console.error('Newsletter preferences creation error:', newsletterError)
    }

    // Create session
    const sessionToken = crypto.randomBytes(64).toString('hex')
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

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

    // Set secure cookie
    const isProduction = process.env.NODE_ENV === 'production'
    res.setHeader('Set-Cookie', [
      `session_token=${sessionToken}; Path=/; Max-Age=2592000; SameSite=Strict; ${isProduction ? 'Secure;' : ''} HttpOnly`,
      `session_expires=${expiresAt.toISOString()}; Path=/; Max-Age=2592000; SameSite=Strict; ${isProduction ? 'Secure;' : ''}`
    ])

    return res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      message: 'Account created successfully'
    })

  } catch (error) {
    console.error('Signup error:', error)
    return res.status(500).json({ error: 'An internal server error occurred. Please try again.' })
  }
}