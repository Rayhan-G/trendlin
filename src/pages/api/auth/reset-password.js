// pages/api/auth/reset-password.js
import bcrypt from 'bcrypt'
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  const { token, newPassword } = req.body

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required' })
  }

  // Validate password strength
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' })
  }
  
  if (!/[A-Z]/.test(newPassword)) {
    return res.status(400).json({ error: 'Password must contain at least one uppercase letter' })
  }
  
  if (!/[a-z]/.test(newPassword)) {
    return res.status(400).json({ error: 'Password must contain at least one lowercase letter' })
  }
  
  if (!/[0-9]/.test(newPassword)) {
    return res.status(400).json({ error: 'Password must contain at least one number' })
  }

  try {
    // Get reset token from database
    const { data: resetRecord, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('*, users(*)')
      .eq('token', token)
      .eq('used', false)
      .single()

    if (tokenError || !resetRecord) {
      return res.status(400).json({ error: 'Invalid or expired reset token' })
    }

    // Check if token has expired
    if (new Date(resetRecord.expires_at) < new Date()) {
      // Mark as expired
      await supabase
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('token', token)
      
      return res.status(400).json({ error: 'Reset token has expired. Please request a new one.' })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update user's password
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password_hash: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', resetRecord.user_id)

    if (updateError) {
      console.error('Password update error:', updateError)
      return res.status(500).json({ error: 'Failed to update password' })
    }

    // Mark token as used
    await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('token', token)

    // Delete all existing sessions for this user (force logout from all devices)
    await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', resetRecord.user_id)

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. Please login with your new password.'
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return res.status(500).json({ error: 'An internal server error occurred' })
  }
}