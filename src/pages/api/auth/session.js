// ============================================
// GET SESSION - SIMPLE AUTH CHECK
// ============================================
// FILE: src/pages/api/auth/session.js

import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sessionToken = req.cookies.session_token;
    
    if (!sessionToken) {
      return res.status(200).json({ userId: null, authenticated: false });
    }

    // Check user session
    const { data: session, error } = await supabase
      .from('user_sessions')
      .select('user_id, expires_at')
      .eq('token', sessionToken)
      .single();

    if (error || !session) {
      return res.status(200).json({ userId: null, authenticated: false });
    }

    // Check expiration
    if (new Date(session.expires_at) < new Date()) {
      await supabase.from('user_sessions').delete().eq('token', sessionToken);
      return res.status(200).json({ userId: null, authenticated: false });
    }

    return res.status(200).json({
      userId: session.user_id,
      authenticated: true
    });

  } catch (error) {
    console.error('Session error:', error);
    return res.status(500).json({ error: 'Internal error' });
  }
}