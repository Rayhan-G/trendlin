import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
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

    // ============================================================
    // CHECK FOR ADMIN USER (Database session)
    // ============================================================
    if (isAdminCookie && adminEmail) {
      // Verify admin session in database
      const { data: adminSession, error: adminError } = await supabase
        .from('admin_sessions')
        .select('expires_at')
        .eq('token', sessionToken)
        .single();

      if (!adminError && adminSession && new Date(adminSession.expires_at) > new Date()) {
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
    }

    // ============================================================
    // CHECK FOR REGULAR USER (Database session)
    // ============================================================
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('user_id, expires_at')
      .eq('token', sessionToken)
      .single();

    if (sessionError || !session) {
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

    // ============================================================
    // GET NEWSLETTER PREFERENCES
    // ============================================================
    const { data: newsletter } = await supabase
      .from('newsletter_preferences')
      .select('is_subscribed, categories, delivery_frequency, max_posts_per_week, post_format')
      .eq('user_id', user.id)
      .maybeSingle();

    return res.status(200).json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        is_admin: false,
        role: 'user'
      },
      newsletter: newsletter || { 
        is_subscribed: false, 
        categories: [],
        delivery_frequency: 'weekly',
        max_posts_per_week: 3,
        post_format: 'digest'
      }
    });

  } catch (error) {
    console.error('Me API error:', error);
    return res.status(500).json({ authenticated: false, error: 'Internal server error' });
  }
}