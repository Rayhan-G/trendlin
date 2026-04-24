// pages/api/auth/me.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  const sessionToken = req.cookies.session_token
  
  // Return early if no session token
  if (!sessionToken) {
    return res.status(200).json({ authenticated: false })
  }

  try {
    // Get session with user data in one query using Supabase relations
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select(`
        *,
        user:users(
          id,
          email,
          created_at,
          last_login_at
        )
      `)
      .eq('token', sessionToken)
      .single()

    // Handle invalid session
    if (sessionError || !session || !session.user) {
      // Clear invalid cookie
      res.setHeader('Set-Cookie', 'session_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict')
      return res.status(200).json({ authenticated: false })
    }

    // Check if session expired
    if (new Date(session.expires_at) < new Date()) {
      // Delete expired session
      await supabase
        .from('user_sessions')
        .delete()
        .eq('token', sessionToken)
      
      // Clear cookie
      res.setHeader('Set-Cookie', 'session_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict')
      return res.status(200).json({ authenticated: false })
    }

    // Get newsletter preferences (optional - don't fail if not found)
    let newsletter = { is_subscribed: false, categories: [], delivery_frequency: 'weekly' }
    
    try {
      const { data: prefs, error: prefsError } = await supabase
        .from('newsletter_preferences')
        .select('is_subscribed, categories, delivery_frequency, max_posts_per_week, post_format')
        .eq('user_id', session.user_id)
        .maybeSingle() // Use maybeSingle to avoid error when no record found
      
      if (!prefsError && prefs) {
        newsletter = prefs
      }
    } catch (prefError) {
      console.error('Newsletter fetch error:', prefError)
      // Continue without newsletter preferences
    }

    // Return authenticated user data
    return res.status(200).json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        created_at: session.user.created_at,
        last_login_at: session.user.last_login_at
      },
      newsletter
    })

  } catch (error) {
    console.error('Auth check error:', error)
    return res.status(500).json({ 
      authenticated: false, 
      error: 'Internal server error' 
    })
  }
}