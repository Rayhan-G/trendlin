import bcrypt from 'bcrypt'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { token, newPassword } = req.body

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and password required' })
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }

  try {
    // Find token
    const { data: reset, error: findError } = await supabase
      .from('password_resets')
      .select('*')
      .eq('token', token)
      .single()

    if (findError || !reset || reset.used || new Date(reset.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired token' })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update user
    await supabase.from('users').update({ password_hash: hashedPassword }).eq('id', reset.user_id)

    // Mark token as used
    await supabase.from('password_resets').update({ used: true }).eq('token', token)

    // Clear all sessions
    await supabase.from('user_sessions').delete().eq('user_id', reset.user_id)

    return res.status(200).json({ success: true, message: 'Password reset successful' })

  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}