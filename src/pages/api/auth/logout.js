import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  const sessionToken = req.cookies.session_token

  if (sessionToken) {
    await supabase
      .from('user_sessions')
      .delete()
      .eq('token', sessionToken)
  }

  res.setHeader('Set-Cookie', [
    'session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly',
    'session_expires=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
  ])

  return res.status(200).json({ success: true })
}