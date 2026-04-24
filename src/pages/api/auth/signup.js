// pages/api/auth/signup.js
import bcrypt from 'bcrypt'
import { supabase } from '@/lib/supabase'
import { randomBytes } from 'crypto'

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
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (checkError) {
      console.error('Error checking existing user:', checkError)
      return res.status(500).json({ error: 'Database error. Please try again.' })
    }

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
      console.error('User creation error details:', {
        message: userError.message,
        details: userError.details,
        hint: userError.hint,
        code: userError.code
      })
      
      if (userError.code === '23505') {
        return res.status(409).json({ error: 'An account with this email already exists' })
      }
      if (userError.code === '42P01') {
        return res.status(500).json({ error: 'Database table not found. Please contact support.' })
      }
      return res.status(500).json({ error: `Failed to create account: ${userError.message}` })
    }

    if (!user) {
      return res.status(500).json({ error: 'Failed to create user account' })
    }

    // Create newsletter preferences (non-critical, continue even if fails)
    try {
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
        console.error('Newsletter preferences creation error (non-critical):', newsletterError)
        // Don't return error - account still works without newsletter preferences
      }
    } catch (newsletterErr) {
      console.error('Newsletter preferences exception:', newsletterErr)
    }

    // Create session
    const sessionToken = randomBytes(64).toString('hex')
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
      // User is created but session failed - they can still log in manually
      // Don't return error, just log it
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
    console.error('Signup unexpected error:', error)
    return res.status(500).json({ 
      error: 'An internal server error occurred. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}