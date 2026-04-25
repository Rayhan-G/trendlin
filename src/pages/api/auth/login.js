import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { supabase } from '../../../lib/supabase';

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
    // ============================================================
    // FIRST: CHECK FOR ADMIN LOGIN
    // ============================================================
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (adminEmail && adminPasswordHash && email.toLowerCase() === adminEmail.toLowerCase()) {
      const isValid = await bcrypt.compare(password, adminPasswordHash);
      
      if (isValid) {
        // Admin login success
        const sessionToken = crypto.randomBytes(64).toString('hex');
        const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
        const isProduction = process.env.NODE_ENV === 'production';
        
        // Set admin cookies
        res.setHeader('Set-Cookie', [
          `session_token=${sessionToken}; Path=/; Max-Age=${maxAge}; SameSite=Strict; ${isProduction ? 'Secure;' : ''} HttpOnly`,
          `is_admin=true; Path=/; Max-Age=${maxAge}; SameSite=Strict`,
          `admin_email=${encodeURIComponent(adminEmail)}; Path=/; Max-Age=${maxAge}; SameSite=Strict`,
          `user_role=admin; Path=/; Max-Age=${maxAge}; SameSite=Strict`
        ]);

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
      }
    }

    // ============================================================
    // SECOND: CHECK FOR REGULAR USER LOGIN
    // ============================================================
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, password_hash, email_verified')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(401).json({ 
        success: false, 
        error: 'Please verify your email address before logging in. Check your inbox for the verification link.' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Update last login time
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    // Create user session
    const sessionToken = crypto.randomBytes(64).toString('hex');
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
    const expiresAt = new Date(Date.now() + maxAge * 1000).toISOString();

    // Store session in user_sessions table
    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        token: sessionToken,
        expires_at: expiresAt,
        user_agent: req.headers['user-agent'] || null,
        ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress || null
      });

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return res.status(500).json({ success: false, error: 'Failed to create session' });
    }

    const isProduction = process.env.NODE_ENV === 'production';
    
    // Set regular user cookies
    res.setHeader('Set-Cookie', [
      `session_token=${sessionToken}; Path=/; Max-Age=${maxAge}; SameSite=Strict; ${isProduction ? 'Secure;' : ''} HttpOnly`,
      `user_role=user; Path=/; Max-Age=${maxAge}; SameSite=Strict`,
      `user_email=${encodeURIComponent(user.email)}; Path=/; Max-Age=${maxAge}; SameSite=Strict`,
      `user_id=${user.id}; Path=/; Max-Age=${maxAge}; SameSite=Strict`
    ]);

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        is_admin: false,
        role: 'user'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error. Please try again later.' });
  }
}