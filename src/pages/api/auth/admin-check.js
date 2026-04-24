import bcrypt from 'bcrypt'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body

  const adminEmail = process.env.ADMIN_EMAIL
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

  if (!adminEmail || !adminPasswordHash) {
    return res.status(500).json({ error: 'Admin not configured' })
  }

  // Check if email matches admin email
  if (email !== adminEmail) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  // Verify password
  const isValid = await bcrypt.compare(password, adminPasswordHash)
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  // Set admin session cookie
  const adminToken = crypto.randomBytes(64).toString('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  // Store in database or just set cookie
  res.setHeader('Set-Cookie', `admin_token=${adminToken}; Path=/; Max-Age=86400; SameSite=Strict; HttpOnly`)

  return res.status(200).json({ 
    success: true, 
    isAdmin: true,
    redirectTo: '/admin/dashboard'
  })
}