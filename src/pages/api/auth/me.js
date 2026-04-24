// pages/api/auth/me.js
import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  const sessionToken = req.cookies.session_token

  if (!sessionToken) {
    return res.status(200).json({ authenticated: false })
  }

  try {
    // Get session from database
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('user_id, expires_at')
      .eq('token', sessionToken)
      .single()

    if (sessionError || !session) {
      return res.status(200).json({ authenticated: false })
    }

    // Check if session has expired
    if (new Date(session.expires_at) < new Date()) {
      // Delete expired session
      await supabase.from('user_sessions').delete().eq('token', sessionToken)
      return res.status(200).json({ authenticated: false })
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', session.user_id)
      .single()

    if (userError || !user) {
      return res.status(200).json({ authenticated: false })
    }

    // ✅ ADD THIS: Get newsletter preferences
    const { data: newsletter } = await supabase
      .from('newsletter_preferences')
      .select('is_subscribed, categories, max_posts_per_week, delivery_frequency')
      .eq('user_id', user.id)
      .maybeSingle()

    return res.status(200).json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email
      },
      // ✅ ADD THIS: Include newsletter data
      newsletter: newsletter || { 
        is_subscribed: false, 
        categories: [],
        max_posts_per_week: 0,
        delivery_frequency: 'weekly'
      }
    })

  } catch (error) {
    console.error('Auth check error:', error)
    return res.status(200).json({ authenticated: false })
  }
}