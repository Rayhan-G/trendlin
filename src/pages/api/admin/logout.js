// pages/api/admin/logout.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Clear the cookie
  res.setHeader('Set-Cookie', `admin_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/`);
  
  res.status(200).json({ success: true, message: 'Logged out successfully' });
}