export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { password } = req.body
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    console.error('ADMIN_PASSWORD not set in environment variables')
    return res.status(500).json({ success: false, error: 'Server configuration error' })
  }

  if (password === adminPassword) {
    return res.status(200).json({ success: true })
  } else {
    return res.status(200).json({ success: false })
  }
}