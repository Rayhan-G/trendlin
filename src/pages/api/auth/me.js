import { supabase } from '../../../lib/supabase';

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
    const userRole = req.cookies.user_role;

    // No session token
    if (!sessionToken) {
      return res.status(200).json({ authenticated: false });
    }

    // ============================================================
    // CHECK FOR ADMIN USER (Cookie-based)
    // ============================================================
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

    // ============================================================
    // CHECK FOR REGULAR USER (Database session)
    // ============================================================
    // Check if session exists in user_sessions table
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('user_id, expires_at')
      .eq('token', sessionToken)
      .single();

    if (sessionError || !session) {
      // Not a valid user session
      return res.status(200).json({ authenticated: false });
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      // Clean up expired session
      await supabase.from('user_sessions').delete().eq('token', sessionToken);
      return res.status(200).json({ authenticated: false });
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', session.user_id)
      .single();

    if (userError || !user) {
      return res.status(200).json({ authenticated: false });
    }

    // Return regular user
    return res.status(200).json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        is_admin: false,
        role: 'user'
      }
    });

  } catch (error) {
    console.error('Me API error:', error);
    return res.status(500).json({ authenticated: false, error: 'Internal server error' });
  }
}