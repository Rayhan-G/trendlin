import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { password } = req.body

  if (!password) {
    return res.status(400).json({ success: false, error: 'Password required' })
  }

  // Get password from environment
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    console.error('ADMIN_PASSWORD not set')
    return res.status(500).json({ success: false, error: 'Server configuration error' })
  }

  // For production, use bcrypt to compare hashed passwords
  // For now, direct comparison (use bcrypt in production)
  if (password === adminPassword) {
    // Generate a session token
    const sessionToken = Buffer.from(`${Date.now()}-${password}`).toString('base64')
    
    return res.status(200).json({ 
      success: true, 
      token: sessionToken,
      expiresIn: parseInt(process.env.ADMIN_SESSION_HOURS || '24') * 60 * 60 * 1000
    })
  } else {
    // Add delay to prevent brute force
    await new Promise(resolve => setTimeout(resolve, 1000))
    return res.status(401).json({ success: false, error: 'Invalid credentials' })
  }
}