// pages/api/auth/logout.js
import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  const { error } = await supabase.auth.signOut()

  if (error) {
    return res.status(500).json({ error: 'Failed to sign out' })
  }

  return res.status(200).json({ success: true, message: 'Signed out successfully' })
}