// pages/api/auth/user.js
import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No session provided' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired session' })
    }

    return res.status(200).json({
      id: user.id,
      email: user.email,
      createdAt: user.created_at,
      emailConfirmed: user.email_confirmed_at !== null
    })

  } catch (error) {
    console.error('Get user error:', error.message)
    return res.status(500).json({ error: 'Failed to get user information' })
  }
}