// pages/api/auth/signup.js
import bcrypt from 'bcrypt'
import { supabase } from '@/lib/supabase'
import crypto from 'crypto'  // ✅ ADDED - Import crypto for randomBytes

export default async function handler(req, res) {
  // 1. Method check
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body

  // 2. Validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' })
  }
  
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }
  
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address required' })
  }

  try {
    // 3. Check if user already exists
    const { data: existing } = await supabase
      .from('users')
      .select('email')
      .eq('email', email.toLowerCase())
      .maybeSingle()
    
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    // 4. Hash password
    const password_hash = await bcrypt.hash(password, 10)

    // 5. Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({ 
        email: email.toLowerCase(), 
        password_hash,
        created_at: new Date().toISOString()  // ✅ ADDED - Timestamp
      })
      .select()
      .single()
    
    if (userError) throw userError

    // 6. Create newsletter preferences (with default values)
    const { error: newsletterError } = await supabase
      .from('newsletter_preferences')
      .insert({ 
        user_id: user.id, 
        is_subscribed: false, 
        categories: [],
        delivery_frequency: 'weekly',  // ✅ ADDED - Default value
        max_posts_per_week: 5,         // ✅ ADDED - Default value
        post_format: 'digest',         // ✅ ADDED - Default value
        created_at: new Date().toISOString(),  // ✅ ADDED - Timestamp
        updated_at: new Date().toISOString()   // ✅ ADDED - Timestamp
      })
    
    if (newsletterError) {
      console.error('Newsletter creation error:', newsletterError)
      // Don't throw - user still created successfully
    }

    // 7. Create session
    const sessionToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    
    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert({ 
        user_id: user.id, 
        token: sessionToken, 
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()  // ✅ ADDED - Timestamp
      })
    
    if (sessionError) throw sessionError

    // 8. Set cookie and return response
    res.setHeader('Set-Cookie', `session_token=${sessionToken}; Path=/; Max-Age=2592000; SameSite=Lax; HttpOnly`)
    
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