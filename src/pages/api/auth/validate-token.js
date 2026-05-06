// ============================================
// VALIDATE RESET TOKEN API
// ============================================
// FILE: pages/api/auth/validate-token.js

import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed. Use GET.' 
    });
  }

  const { token } = req.query;

  // Validate token presence
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ 
      success: false,
      error: 'Reset token is required' 
    });
  }

  // Validate token format (64 character hex string)
  const tokenRegex = /^[a-f0-9]{64}$/i;
  if (!tokenRegex.test(token)) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid token format' 
    });
  }

  try {
    // Query the password_resets table
    const { data: resetData, error: resetError } = await supabase
      .from('password_resets')
      .select('user_id, expires_at, used, created_at')
      .eq('token', token)
      .single();

    // Handle token not found
    if (resetError) {
      console.error('Token lookup error:', resetError);
      
      if (resetError.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false,
          error: 'Invalid or expired reset link',
          code: 'TOKEN_NOT_FOUND'
        });
      }
      
      return res.status(500).json({ 
        success: false,
        error: 'Database error. Please try again.',
        code: 'DB_ERROR'
      });
    }

    // Check if token exists
    if (!resetData) {
      return res.status(404).json({ 
        success: false,
        error: 'Invalid or expired reset link',
        code: 'TOKEN_NOT_FOUND'
      });
    }

    // Check if token has already been used
    if (resetData.used) {
      return res.status(400).json({ 
        success: false,
        error: 'This reset link has already been used. Please request a new one.',
        code: 'TOKEN_USED'
      });
    }

    // Check if token has expired
    const expiresAt = new Date(resetData.expires_at);
    const now = new Date();
    
    if (expiresAt < now) {
      return res.status(400).json({ 
        success: false,
        error: 'This reset link has expired. Please request a new one.',
        code: 'TOKEN_EXPIRED',
        expiresAt: resetData.expires_at
      });
    }

    // Calculate time remaining
    const timeRemaining = Math.max(0, expiresAt.getTime() - now.getTime());
    const minutesRemaining = Math.floor(timeRemaining / (1000 * 60));
    const secondsRemaining = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    // Token is valid
    return res.status(200).json({ 
      success: true,
      valid: true,
      message: 'Token is valid',
      expiresAt: resetData.expires_at,
      timeRemaining: {
        minutes: minutesRemaining,
        seconds: secondsRemaining,
        totalMs: timeRemaining
      },
      createdAt: resetData.created_at
    });

  } catch (error) {
    console.error('Validate token error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error. Please try again later.',
      code: 'SERVER_ERROR'
    });
  }
}