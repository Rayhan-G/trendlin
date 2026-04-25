import bcrypt from 'bcrypt'
import crypto from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password, rememberMe = false } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const adminEmail = process.env.ADMIN_EMAIL
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

  if (!adminEmail || !adminPasswordHash) {
    console.error('Admin credentials not configured')
    return res.status(500).json({ error: 'Admin not configured' })
  }

  if (email.toLowerCase() === adminEmail.toLowerCase()) {
    const isValid = await bcrypt.compare(password, adminPasswordHash)
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const sessionToken = crypto.randomBytes(64).toString('hex')
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60

    const isProduction = process.env.NODE_ENV === 'production'
    res.setHeader('Set-Cookie', [
      `session_token=${sessionToken}; Path=/; Max-Age=${maxAge}; SameSite=Strict; ${isProduction ? 'Secure;' : ''} HttpOnly`,
      `is_admin=true; Path=/; Max-Age=${maxAge}; SameSite=Strict`,
      `user_email=${encodeURIComponent(adminEmail)}; Path=/; Max-Age=${maxAge}; SameSite=Strict`
    ])

    return res.status(200).json({
      success: true,
      user: {
        id: 'admin',
        email: adminEmail,
        is_admin: true,
        role: 'admin'
      },
      isAdmin: true
    })
  }

  return res.status(401).json({ error: 'Invalid credentials' })
}