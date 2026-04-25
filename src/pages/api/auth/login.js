import bcrypt from 'bcrypt';
import crypto from 'crypto';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { email, password, rememberMe = false } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email format' });
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminEmail || !adminPasswordHash) {
      console.error('Admin credentials not configured');
      return res.status(500).json({ success: false, error: 'Authentication service error' });
    }

    // Check admin credentials
    if (email.toLowerCase() !== adminEmail.toLowerCase()) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, adminPasswordHash);
    
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Generate session token
    const sessionToken = crypto.randomBytes(64).toString('hex');
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 24 hours
    const expiresAt = Date.now() + (maxAge * 1000);

    // Set secure cookies
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = [
      `session_token=${sessionToken}`,
      `Path=/`,
      `Max-Age=${maxAge}`,
      `SameSite=Strict`,
      isProduction ? 'Secure' : '',
      'HttpOnly'
    ].filter(Boolean).join('; ');

    const adminCookieOptions = [
      `is_admin=true`,
      `Path=/`,
      `Max-Age=${maxAge}`,
      `SameSite=Strict`,
      isProduction ? 'Secure' : ''
    ].filter(Boolean).join('; ');

    const emailCookieOptions = [
      `admin_email=${encodeURIComponent(adminEmail)}`,
      `Path=/`,
      `Max-Age=${maxAge}`,
      `SameSite=Strict`,
      isProduction ? 'Secure' : ''
    ].filter(Boolean).join('; ');

    res.setHeader('Set-Cookie', [cookieOptions, adminCookieOptions, emailCookieOptions]);

    // Return success response
    return res.status(200).json({
      success: true,
      user: {
        id: 'admin',
        email: adminEmail,
        is_admin: true,
        role: 'admin'
      },
      isAdmin: true
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}