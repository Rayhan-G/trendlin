export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Clear all auth cookies
    res.setHeader('Set-Cookie', [
      `session_token=; Path=/; Max-Age=0; SameSite=Strict; ${isProduction ? 'Secure;' : ''} HttpOnly`,
      `is_admin=; Path=/; Max-Age=0; SameSite=Strict; ${isProduction ? 'Secure;' : ''}`,
      `admin_email=; Path=/; Max-Age=0; SameSite=Strict; ${isProduction ? 'Secure;' : ''}`
    ]);

    return res.status(200).json({ success: true, message: 'Logged out successfully' });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}