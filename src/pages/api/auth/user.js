// ============================================
// UNIFIED USER API - SUPPORTS BOTH AUTH METHODS
// ============================================
// FILE: pages/api/auth/user.js

import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    let userId = null;
    let authMethod = null;

    // ============================================
    // METHOD 1: Bearer Token (Mobile/API)
    // ============================================
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        userId = user.id;
        authMethod = 'bearer';
      }
    }

    // ============================================
    // METHOD 2: Cookie Session (Web App)
    // ============================================
    if (!userId) {
      const sessionToken = req.cookies.session_token;
      
      if (sessionToken) {
        // Check user session
        const { data: session, error: sessionError } = await supabase
          .from('user_sessions')
          .select('user_id, expires_at')
          .eq('token', sessionToken)
          .single();

        if (!sessionError && session && new Date(session.expires_at) > new Date()) {
          userId = session.user_id;
          authMethod = 'cookie';
        }
        
        // Check admin session
        if (!userId) {
          const { data: adminSession, error: adminError } = await supabase
            .from('admin_sessions')
            .select('admin_id, expires_at')
            .eq('token', sessionToken)
            .single();

          if (!adminError && adminSession && new Date(adminSession.expires_at) > new Date()) {
            // Return admin user
            return res.status(200).json({
              id: 'admin',
              email: process.env.ADMIN_EMAIL,
              role: 'admin',
              is_admin: true,
              auth_method: 'cookie'
            });
          }
        }
      }
    }

    // ============================================
    // No valid auth found
    // ============================================
    if (!userId) {
      return res.status(401).json({ 
        error: 'No valid session provided',
        authenticated: false 
      });
    }

    // ============================================
    // Get user details from database
    // ============================================
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, avatar_url, email_verified, subscription_tier, created_at, last_login_at')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ 
        error: 'User not found',
        authenticated: false 
      });
    }

    // Get newsletter preferences
    const { data: newsletter } = await supabase
      .from('newsletter_preferences')
      .select('is_subscribed, categories, delivery_frequency')
      .eq('user_id', userId)
      .maybeSingle();

    // Return unified response
    return res.status(200).json({
      authenticated: true,
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      email_verified: user.email_verified,
      subscription_tier: user.subscription_tier || 'free',
      created_at: user.created_at,
      last_login_at: user.last_login_at,
      auth_method: authMethod,
      newsletter: newsletter || { is_subscribed: false }
    });

  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ 
      error: 'Failed to get user information',
      authenticated: false 
    });
  }
}