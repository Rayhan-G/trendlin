// pages/api/auth/verify-code.js
const verificationStore = new Map()

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  const { email, code, verificationId } = req.body

  if (!email || !code || !verificationId) {
    return res.status(400).json({ error: 'Email, verification code, and verification ID are required' })
  }

  const storedData = verificationStore.get(verificationId)

  if (!storedData) {
    return res.status(400).json({ error: 'Invalid or expired verification code. Please request a new one.' })
  }

  if (storedData.email !== email.toLowerCase()) {
    return res.status(400).json({ error: 'Email address mismatch' })
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