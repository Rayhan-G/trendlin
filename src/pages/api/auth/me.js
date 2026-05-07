// pages/api/auth/me.js
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const sessionToken = req.cookies.session_token;
    
    if (!sessionToken) {
      return res.status(200).json({ 
        authenticated: false,
        reason: 'NO_SESSION_TOKEN'
      });
    }

    // ============================================================
    // CHECK ADMIN SESSION (6 HOUR EXPIRY)
    // ============================================================
    const isAdminCookie = req.cookies.is_admin === 'true';
    const adminEmail = req.cookies.admin_email 
      ? decodeURIComponent(req.cookies.admin_email) 
      : null;

    if (isAdminCookie && adminEmail) {
      const { data: adminSession, error: adminError } = await supabase
        .from('admin_sessions')
        .select('expires_at, created_at')
        .eq('token', sessionToken)
        .single();

      if (!adminError && adminSession) {
        const isValid = new Date(adminSession.expires_at) > new Date();
        
        if (isValid) {
          return res.status(200).json({
            authenticated: true,
            user: {
              id: 'admin',
              email: adminEmail,
              is_admin: true,
              role: 'admin'
            },
            session: {
              expires_at: adminSession.expires_at,
              created_at: adminSession.created_at
            }
          });
        } else {
          // Admin session expired - clean up
          await supabase.from('admin_sessions').delete().eq('token', sessionToken);
          return res.status(200).json({ 
            authenticated: false,
            reason: 'SESSION_EXPIRED'
          });
        }
      }
    }

    // ============================================================
    // CHECK REGULAR USER SESSION (3 DAY EXPIRY)
    // ============================================================
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('user_id, expires_at, created_at')
      .eq('token', sessionToken)
      .single();

    if (sessionError || !session) {
      return res.status(200).json({ 
        authenticated: false,
        reason: 'INVALID_SESSION'
      });
    }

    // Check session expiration (3 days)
    if (new Date(session.expires_at) < new Date()) {
      // Clean up expired session
      await supabase
        .from('user_sessions')
        .delete()
        .eq('token', sessionToken);
      
      return res.status(200).json({ 
        authenticated: false,
        reason: 'SESSION_EXPIRED'
      });
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, avatar_url, email_verified, subscription_tier, created_at')
      .eq('id', session.user_id)
      .single();

    if (userError || !user) {
      return res.status(200).json({ 
        authenticated: false,
        reason: 'USER_NOT_FOUND'
      });
    }

    // Get newsletter preferences
    const { data: newsletter } = await supabase
      .from('newsletter_preferences')
      .select('is_subscribed, categories, delivery_frequency, max_posts_per_week, post_format')
      .eq('user_id', user.id)
      .maybeSingle();

    // Update last activity
    await supabase
      .from('user_sessions')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('token', sessionToken);

    return res.status(200).json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        email_verified: user.email_verified,
        subscription_tier: user.subscription_tier || 'free',
        is_admin: false,
        role: 'user',
        joined_at: user.created_at
      },
      newsletter: newsletter || { 
        is_subscribed: false, 
        categories: [],
        delivery_frequency: 'weekly',
        max_posts_per_week: 5,
        post_format: 'digest'
      },
      session: {
        expires_at: session.expires_at,
        created_at: session.created_at
      }
    });

  } catch (error) {
    console.error('Me API error:', error);
    return res.status(500).json({ 
      authenticated: false, 
      error: 'Internal server error',
      reason: 'SERVER_ERROR'
    });
  }
}