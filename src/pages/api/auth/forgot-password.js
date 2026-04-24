import { randomBytes } from 'crypto'

// Create supabase client directly (no import issues)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  try {
    console.log('Looking for user:', email)
    
    // Find user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single()

    if (userError) {
      console.log('User lookup error:', userError.message)
    }

    if (!user) {
      console.log('User not found:', email)
      return res.status(404).json({ 
        error: `No account found with ${email}`
      })
    }

    console.log('User found:', user.id)

    // Generate reset token
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    // Delete old tokens
    const { error: deleteError } = await supabase
      .from('password_resets')
      .delete()
      .eq('user_id', user.id)
      .eq('used', false)

    if (deleteError) {
      console.log('Delete error (may be fine if table is new):', deleteError.message)
    }

    // Save new token - check if table exists
    let insertError
    try {
      const { error } = await supabase
        .from('password_resets')
        .insert({
          user_id: user.id,
          token: token,
          expires_at: expiresAt.toISOString(),
          used: false
        })
      insertError = error
    } catch (err) {
      console.error('Insert exception:', err)
      insertError = err
    }

    if (insertError) {
      console.error('Insert error:', insertError)
      
      // Check if table doesn't exist
      if (insertError.message && insertError.message.includes('relation') && insertError.message.includes('does not exist')) {
        return res.status(500).json({ 
          error: 'Password reset table not set up. Please run the SQL setup in Supabase.',
          details: 'Missing password_resets table'
        })
      }
      
      return res.status(500).json({ error: 'Failed to generate reset link. Please try again.' })
    }

    // Get base URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/reset-password?token=${token}`

    console.log('\n' + '='.repeat(60))
    console.log('🔐 PASSWORD RESET LINK')
    console.log('='.repeat(60))
    console.log(`Email: ${email}`)
    console.log(`Reset Link: ${resetUrl}`)
    console.log('='.repeat(60) + '\n')

    // Return success with the link for development
    return res.status(200).json({
      success: true,
      message: `Reset link generated! Check your terminal/console.`,
      resetUrl: resetUrl
    })

  } catch (error) {
    console.error('Fatal error:', error)
    return res.status(500).json({ 
      error: 'Server error: ' + error.message 
    })
  }
}