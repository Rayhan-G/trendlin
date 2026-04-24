import bcrypt from 'bcrypt'
import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  const { token, newPassword } = req.body

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required' })
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }

  try {
    const { data: resetData, error: resetError } = await supabase
      .from('password_resets')
      .select('user_id, expires_at, used')
      .eq('token', token)
      .single()

    if (resetError || !resetData) {
      return res.status(400).json({ error: 'Invalid or expired reset token' })
    }

    if (resetData.used) {
      return res.status(400).json({ error: 'This reset link has already been used' })
    }

    if (new Date(resetData.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Reset link has expired' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password_hash: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', resetData.user_id)

    if (updateError) {
      console.error('Password update error:', updateError)
      return res.status(500).json({ error: 'Failed to update password' })
    }

    await supabase
      .from('password_resets')
      .update({ used: true })
      .eq('token', token)

    await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', resetData.user_id)

    return res.status(200).json({ 
      message: 'Password reset successful! Please log in with your new password.' 
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return res.status(500).json({ error: 'An unexpected error occurred' })
  }
}