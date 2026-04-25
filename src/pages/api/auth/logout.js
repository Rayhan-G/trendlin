import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  const sessionToken = req.cookies.session_token

  if (sessionToken) {
    // Delete from admin_sessions
    await supabase.from('admin_sessions').delete().eq('token', sessionToken)
  }

  // Clear cookies
  const isProduction = process.env.NODE_ENV === 'production'
  res.setHeader('Set-Cookie', [
    `session_token=; Path=/; Max-Age=0; SameSite=Strict; ${isProduction ? 'Secure;' : ''} HttpOnly`,
    `is_admin=; Path=/; Max-Age=0; SameSite=Strict`,
    `session_expires=; Path=/; Max-Age=0; SameSite=Strict`
  ])

  return res.status(200).json({ success: true })
}