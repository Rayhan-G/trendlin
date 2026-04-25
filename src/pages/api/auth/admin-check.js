import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  // Allow both GET and POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ 
      success: false, 
      error: `Method ${req.method} not allowed` 
    })
  }

  try {
    // Get session token from cookie
    const sessionToken = req.cookies.session_token
    
    if (!sessionToken) {
      return res.status(401).json({ 
        authenticated: false,
        isAdmin: false,
        error: 'No session found'
      })
    }

    // Check if it's an admin session
    const { data: session, error } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('token', sessionToken)
      .single()

    if (error || !session) {
      return res.status(401).json({ 
        authenticated: false,
        isAdmin: false,
        error: 'Invalid session'
      })
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      // Clean up expired session
      await supabase
        .from('admin_sessions')
        .delete()
        .eq('token', sessionToken)
      
      return res.status(401).json({ 
        authenticated: false,
        isAdmin: false,
        error: 'Session expired'
      })
    }

    // Get admin email from env
    const adminEmail = process.env.ADMIN_EMAIL

    return res.status(200).json({
      authenticated: true,
      isAdmin: true,
      user: {
        id: 'admin',
        email: adminEmail,
        is_admin: true
      }
    })

  } catch (error) {
    console.error('Admin check error:', error)
    return res.status(500).json({ 
      authenticated: false,
      isAdmin: false,
      error: 'Internal server error'
    })
  }
}