// In production, use a database instead of Map
const verificationStore = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, code, verificationId } = req.body;

  if (!email || !code || !verificationId) {
    return res.status(400).json({ error: 'Email, code, and verification ID are required' });
  }

  const storedData = verificationStore.get(verificationId);

  if (!storedData) {
    return res.status(400).json({ error: 'Invalid or expired verification code' });
  }

  if (storedData.email !== email) {
    return res.status(400).json({ error: 'Email mismatch' });
  }

  if (storedData.expiresAt < Date.now()) {
    verificationStore.delete(verificationId);
    return res.status(400).json({ error: 'Verification code has expired' });
  }

  if (storedData.code !== code) {
    return res.status(400).json({ error: 'Invalid verification code' });
  }

  // Code is valid
  verificationStore.delete(verificationId);
  
  return res.status(200).json({ 
    success: true, 
    message: 'Email verified successfully' 
  });
}