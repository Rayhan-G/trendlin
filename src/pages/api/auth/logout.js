// pages/api/auth/logout.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  const sessionToken = req.cookies.session_token
  if (sessionToken) await supabase.from('user_sessions').delete().eq('token', sessionToken)
  res.setHeader('Set-Cookie', 'session_token=; Path=/; Max-Age=0')
  return res.status(200).json({ success: true })
}