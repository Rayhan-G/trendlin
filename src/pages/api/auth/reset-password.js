import bcrypt from 'bcrypt'
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  const { token, newPassword } = req.body

  console.log('Reset password request received:', { token: token?.substring(0, 10) + '...', newPassword: '***' })

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required' })
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }

  try {
    // First, find the reset token
    console.log('Looking up token in database...')
    const { data: resetData, error: resetError } = await supabase
      .from('password_resets')
      .select('*')
      .eq('token', token)
      .single()

    if (resetError) {
      console.error('Token lookup error:', resetError)
      return res.status(400).json({ error: 'Invalid reset token' })
    }

    if (!resetData) {
      console.log('No reset record found for token')
      return res.status(400).json({ error: 'Invalid reset token' })
    }

    console.log('Reset data found:', { 
      userId: resetData.user_id, 
      used: resetData.used, 
      expiresAt: resetData.expires_at 
    })

    // Check if token is used
    if (resetData.used) {
      console.log('Token already used')
      return res.status(400).json({ error: 'This reset link has already been used' })
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(resetData.expires_at)
    
    if (expiresAt < now) {
      console.log('Token expired at:', expiresAt, 'Current time:', now)
      return res.status(400).json({ error: 'Reset link has expired. Please request a new one.' })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    console.log('Password hashed successfully')

    // Update user's password
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

    console.log('Password updated successfully for user:', resetData.user_id)

    // Mark token as used
    const { error: updateTokenError } = await supabase
      .from('password_resets')
      .update({ used: true })
      .eq('token', token)

    if (updateTokenError) {
      console.error('Token update error:', updateTokenError)
      // Don't return error here since password was already updated
    }

    // Delete all user sessions to force re-login
    const { error: deleteSessionsError } = await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', resetData.user_id)

    if (deleteSessionsError) {
      console.error('Session deletion error:', deleteSessionsError)
      // Don't return error here since password was already updated
    }

    console.log('Password reset completed successfully')
    return res.status(200).json({ 
      message: 'Password reset successful! Please log in with your new password.' 
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return res.status(500).json({ error: 'An unexpected error occurred. Please try again.' })
  }
}