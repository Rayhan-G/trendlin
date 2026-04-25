export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const sessionToken = req.cookies.session_token;
    const isAdminCookie = req.cookies.is_admin === 'true';
    const adminEmail = req.cookies.admin_email ? decodeURIComponent(req.cookies.admin_email) : null;

    // No session token
    if (!sessionToken) {
      return res.status(200).json({ authenticated: false });
    }

    // Check if admin
    if (isAdminCookie && adminEmail) {
      return res.status(200).json({
        authenticated: true,
        user: {
          id: 'admin',
          email: adminEmail,
          is_admin: true,
          role: 'admin'
        }
      });
    }

    // Not authenticated
    return res.status(200).json({ authenticated: false });

  } catch (error) {
    console.error('Me API error:', error);
    return res.status(500).json({ authenticated: false, error: 'Internal server error' });
  }
}