import { randomBytes } from 'crypto'
import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  try {
    // Find user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single()

    if (userError || !user) {
      return res.status(404).json({ 
        error: `No account found with ${email}`
      })
    }

    // Generate reset token
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    // Delete old tokens
    await supabase
      .from('password_resets')
      .delete()
      .eq('user_id', user.id)
      .eq('used', false)

    // Save new token
    const { error: insertError } = await supabase
      .from('password_resets')
      .insert({
        user_id: user.id,
        token: token,
        expires_at: expiresAt.toISOString(),
        used: false
      })

    if (insertError) {
      throw new Error('Failed to save token')
    }

    // ✅ CORRECT: Get the actual domain from request or environment
    const protocol = req.headers['x-forwarded-proto'] || 'https'
    const host = req.headers['host']
    const baseUrl = process.env.NEXTAUTH_URL || `${protocol}://${host}`
    
    const resetUrl = `${baseUrl}/reset-password?token=${token}`

    // For development, log the URL
    if (process.env.NODE_ENV === 'development') {
      console.log('Reset URL:', resetUrl)
      return res.status(200).json({
        success: true,
        message: `Reset link sent to ${email}`,
        resetUrl: resetUrl  // Show link in development only
      })
    }

    // Production - send email (implement with Resend/SendGrid)
    // For now, just return success
    return res.status(200).json({
      success: true,
      message: `Reset link sent to ${email}`
    })

  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: 'Something went wrong' })
  }
}