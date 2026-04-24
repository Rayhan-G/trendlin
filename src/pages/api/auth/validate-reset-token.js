import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { token } = req.query

  if (!token) {
    return res.status(400).json({ error: 'Token is required' })
  }

  try {
    const { data: resetData, error: resetError } = await supabase
      .from('password_resets')
      .select('user_id, expires_at, used')
      .eq('token', token)
      .single()

    if (resetError || !resetData) {
      return res.status(400).json({ error: 'Invalid token' })
    }

    if (resetData.used) {
      return res.status(400).json({ error: 'Token already used' })
    }

    if (new Date(resetData.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Token expired' })
    }

    return res.status(200).json({ valid: true })
  } catch (error) {
    console.error('Validate token error:', error)
    return res.status(500).json({ error: 'Server error' })
  }
}