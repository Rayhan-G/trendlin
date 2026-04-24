import { randomBytes } from 'crypto'
import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email address is required' })
  }

  try {
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single()

    if (userError || !user) {
      console.log('User not found:', email)
      return res.status(200).json({ 
        message: 'If an account exists with this email, you will receive reset instructions.',
        success: true 
      })
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    // Delete existing unused tokens
    await supabase
      .from('password_resets')
      .delete()
      .eq('user_id', user.id)
      .eq('used', false)

    // Store new token
    const { error: insertError } = await supabase
      .from('password_resets')
      .insert({
        user_id: user.id,
        token: resetToken,
        expires_at: expiresAt.toISOString(),
        used: false
      })

    if (insertError) {
      console.error('Token storage error:', insertError)
      return res.status(500).json({ error: 'Failed to process request' })
    }

    // Build reset URL
    const baseUrl = process.env.NEXTAUTH_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

    if (process.env.NODE_ENV === 'development') {
      console.log('\n🔐 PASSWORD RESET LINK:')
      console.log(`📧 Email: ${email}`)
      console.log(`🔗 URL: ${resetUrl}\n`)
      
      return res.status(200).json({ 
        message: 'Reset link generated! Check your terminal.',
        success: true,
        resetLink: resetUrl
      })
    }

    return res.status(200).json({ 
      message: 'If an account exists with this email, you will receive reset instructions.',
      success: true 
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return res.status(500).json({ error: 'An unexpected error occurred' })
  }
}