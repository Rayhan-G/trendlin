import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sessionToken = req.cookies.session_token

  if (!sessionToken) {
    return res.status(200).json({ authenticated: false })
  }

  try {
    // Check if it's an admin session
    const isAdminCookie = req.cookies.is_admin === 'true'
    
    if (isAdminCookie) {
      const { data: adminSession, error: adminError } = await supabase
        .from('admin_sessions')
        .select('expires_at')
        .eq('token', sessionToken)
        .single()
      
      if (!adminError && adminSession && new Date(adminSession.expires_at) > new Date()) {
        return res.status(200).json({
          authenticated: true,
          user: {
            id: 'admin',
            email: process.env.ADMIN_EMAIL,
            is_admin: true
          },
          newsletter: { is_subscribed: false, categories: [] }
        })
      }
    }

    // Regular user session
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('user_id, expires_at')
      .eq('token', sessionToken)
      .single()

    if (sessionError || !session) {
      return res.status(200).json({ authenticated: false })
    }

    if (new Date(session.expires_at) < new Date()) {
      await supabase.from('user_sessions').delete().eq('token', sessionToken)
      return res.status(200).json({ authenticated: false })
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', session.user_id)
      .single()

    if (userError || !user) {
      return res.status(200).json({ authenticated: false })
    }

    const { data: newsletter } = await supabase
      .from('newsletter_preferences')
      .select('is_subscribed, categories')
      .eq('user_id', user.id)
      .maybeSingle()

    return res.status(200).json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        is_admin: false
      },
      newsletter: newsletter || { is_subscribed: false, categories: [] }
    })

  } catch (error) {
    console.error('Auth check error:', error)
    return res.status(200).json({ authenticated: false })
  }
}