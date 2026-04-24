// pages/api/auth/signup.js
import bcrypt from 'bcrypt'
import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body

  // Validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' })
  }
  
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Valid email address required' })
  }

  try {
    // Check if user exists
    const { data: existing } = await supabase
      .from('users')
      .select('email')
      .eq('email', email.toLowerCase())
      .maybeSingle()
    
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10)

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({ 
        email: email.toLowerCase(), 
        password_hash,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (userError) throw userError

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
      console.error('Newsletter creation error:', newsletterError)
      // Non-critical, continue
    }

    // Create session
    const sessionToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    
    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert({ 
        user_id: user.id, 
        token: sessionToken, 
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      })
    
    if (sessionError) throw sessionError

    // Set cookie
    res.setHeader('Set-Cookie', `session_token=${sessionToken}; Path=/; Max-Age=2592000; SameSite=Lax; HttpOnly; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`)
    
    return res.status(201).json({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email 
      } 
    })
    
  } catch (error) {
    console.error('Signup error:', error)
    return res.status(500).json({ error: 'Failed to create account' })
  }
}