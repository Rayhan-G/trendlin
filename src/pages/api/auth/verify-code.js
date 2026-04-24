// pages/api/auth/verify-code.js
// In production, use a database instead of Map
const verificationStore = new Map()

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, code, verificationId } = req.body

  if (!email || !code || !verificationId) {
    return res.status(400).json({ error: 'Email, code, and verification ID are required' })
  }

  const storedData = verificationStore.get(verificationId)

  if (!storedData) {
    return res.status(400).json({ error: 'Invalid or expired verification code. Please request a new one.' })
  }

  if (storedData.email !== email.toLowerCase()) {
    return res.status(400).json({ error: 'Email mismatch' })
  }

  if (storedData.expiresAt < Date.now()) {
    verificationStore.delete(verificationId)
    return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' })
  }

  if (storedData.code !== code) {
    return res.status(400).json({ error: 'Invalid verification code. Please try again.' })
  }

  // Code is valid - delete it so it can't be reused
  verificationStore.delete(verificationId)
  
  return res.status(200).json({ 
    success: true, 
    message: 'Email verified successfully' 
  })
}