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
    // Check admin session in database
    const { data: adminSession, error: adminError } = await supabase
      .from('admin_sessions')
      .select('expires_at')
      .eq('token', sessionToken)
      .single()

    // If found and not expired, return admin user
    if (!adminError && adminSession) {
      if (new Date(adminSession.expires_at) > new Date()) {
        return res.status(200).json({
          authenticated: true,
          user: {
            id: 'admin',
            email: process.env.ADMIN_EMAIL,
            is_admin: true,
            role: 'admin'
          }
        })
      } else {
        // Session expired, delete it
        await supabase.from('admin_sessions').delete().eq('token', sessionToken)
      }
    }

    return res.status(200).json({ authenticated: false })

  } catch (error) {
    console.error('Auth check error:', error)
    return res.status(200).json({ authenticated: false })
  }
}