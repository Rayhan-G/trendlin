// ============================================
// ENTERPRISE-GRADE SESSION MANAGEMENT
// BILLION-DOLLAR AUTH SYSTEM
// ============================================
// FILE: pages/api/auth/check-admin.js

import { supabase } from '../../../lib/supabase';
import crypto from 'crypto';

// Security constants
const SESSION_REFRESH_THRESHOLD = 7 * 24 * 60 * 60 * 1000; // 7 days before expiration
const MAX_SESSIONS_PER_USER = 10;
const TOKEN_VERSION = 'v2';

export default async function handler(req, res) {
  // Security headers for all responses
  setSecurityHeaders(res);

  if (req.method !== 'GET' && req.method !== 'POST') {
    return methodNotAllowed(res);
  }

  try {
    // Extract and validate session token
    const sessionToken = extractSessionToken(req);
    if (!sessionToken) {
      return unauthenticatedResponse(res, 'No session token provided');
    }

    // Validate token format
    if (!isValidSessionToken(sessionToken)) {
      return unauthenticatedResponse(res, 'Invalid token format');
    }

    // Check both admin and user sessions
    const sessionData = await validateSession(sessionToken, req);
    
    if (!sessionData.valid) {
      return unauthenticatedResponse(res, sessionData.reason);
    }

    // Auto-refresh session if needed
    if (sessionData.needsRefresh) {
      await refreshSession(sessionToken, sessionData.session, res);
    }

    // Log successful authentication
    await logAuthenticationEvent(sessionData.user.id, sessionData.user.isAdmin ? 'admin' : 'user', req);

    // Return enriched response
    return authenticatedResponse(res, sessionData);

  } catch (error) {
    console.error('Session check error:', error);
    await logSecurityEvent('session_check_failed', { error: error.message }, req);
    return serverErrorResponse(res);
  }
}

// ============================================
// SECURITY HEADERS
// ============================================

function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
}

// ============================================
// TOKEN VALIDATION
// ============================================

function extractSessionToken(req) {
  // Check cookies first
  let token = req.cookies.session_token;
  
  // Then check Authorization header (Bearer token)
  if (!token && req.headers.authorization) {
    const match = req.headers.authorization.match(/^Bearer\s+(.+)$/i);
    if (match) token = match[1];
  }
  
  // Check query param (for WebSocket/SSE)
  if (!token && req.query.token) token = req.query.token;
  
  return token;
}

function isValidSessionToken(token) {
  // Session tokens should be 64-character hex strings
  const hexRegex = /^[a-f0-9]{64}$/i;
  return hexRegex.test(token);
}

// ============================================
// SESSION VALIDATION
// ============================================

async function validateSession(token, req) {
  // Check admin session first (higher priority)
  const adminSession = await checkAdminSession(token);
  if (adminSession.valid) return adminSession;
  
  // Check user session
  const userSession = await checkUserSession(token, req);
  if (userSession.valid) return userSession;
  
  return { valid: false, reason: 'INVALID_SESSION' };
}

async function checkAdminSession(token) {
  const { data: session, error } = await supabase
    .from('admin_sessions')
    .select(`
      *,
      admin:admin_id (
        id,
        email,
        role,
        permissions
      )
    `)
    .eq('token', token)
    .single();

  if (error || !session) {
    return { valid: false };
  }

  // Check expiration
  const expiresAt = new Date(session.expires_at);
  const now = new Date();
  const timeUntilExpiry = expiresAt.getTime() - now.getTime();

  if (expiresAt < now) {
    // Clean up expired session
    await supabase.from('admin_sessions').delete().eq('token', token);
    return { valid: false, reason: 'SESSION_EXPIRED' };
  }

  // Check if session needs refresh
  const needsRefresh = timeUntilExpiry < SESSION_REFRESH_THRESHOLD;

  // Update last activity
  await supabase
    .from('admin_sessions')
    .update({ 
      last_activity_at: new Date().toISOString(),
      last_ip: session.last_ip,
      last_user_agent: session.last_user_agent
    })
    .eq('token', token);

  return {
    valid: true,
    isAdmin: true,
    session,
    needsRefresh,
    user: {
      id: session.admin_id,
      email: session.admin?.email || process.env.ADMIN_EMAIL,
      role: session.admin?.role || 'admin',
      permissions: session.admin?.permissions || ['*'],
      isAdmin: true
    }
  };
}

async function checkUserSession(token, req) {
  const { data: session, error } = await supabase
    .from('user_sessions')
    .select(`
      *,
      user:users (
        id,
        email,
        full_name,
        avatar_url,
        email_verified,
        subscription_tier,
        role,
        preferences
      )
    `)
    .eq('token', token)
    .single();

  if (error || !session) {
    return { valid: false };
  }

  // Check expiration
  const expiresAt = new Date(session.expires_at);
  const now = new Date();
  const timeUntilExpiry = expiresAt.getTime() - now.getTime();

  if (expiresAt < now) {
    await supabase.from('user_sessions').delete().eq('token', token);
    return { valid: false, reason: 'SESSION_EXPIRED' };
  }

  // Security: Check for IP change (optional, high security)
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (session.last_ip && session.last_ip !== clientIp && process.env.NODE_ENV === 'production') {
    // Log suspicious activity but don't invalidate (might be mobile IP change)
    await logSecurityEvent('ip_change_detected', {
      user_id: session.user_id,
      old_ip: session.last_ip,
      new_ip: clientIp
    }, req);
  }

  // Check if session needs refresh
  const needsRefresh = timeUntilExpiry < SESSION_REFRESH_THRESHOLD;

  // Update last activity and IP
  await supabase
    .from('user_sessions')
    .update({ 
      last_activity_at: new Date().toISOString(),
      last_ip: clientIp,
      last_user_agent: req.headers['user-agent']
    })
    .eq('token', token);

  // Check if email is verified
  const emailVerified = session.user?.email_verified || false;
  if (!emailVerified) {
    return {
      valid: true,
      isAdmin: false,
      session,
      needsRefresh,
      user: {
        ...session.user,
        email_verified: false,
        requiresVerification: true
      }
    };
  }

  return {
    valid: true,
    isAdmin: false,
    session,
    needsRefresh,
    user: {
      id: session.user.id,
      email: session.user.email,
      full_name: session.user.full_name,
      avatar_url: session.user.avatar_url,
      email_verified: true,
      subscription_tier: session.user.subscription_tier || 'free',
      role: session.user.role || 'user',
      preferences: session.user.preferences || {}
    }
  };
}

// ============================================
// SESSION REFRESH (SILENT RENEWAL)
// ============================================

async function refreshSession(token, currentSession, res) {
  const newExpiresAt = new Date();
  newExpiresAt.setDate(newExpiresAt.getDate() + 30); // 30 days

  const isAdmin = !!currentSession.admin_id;
  const table = isAdmin ? 'admin_sessions' : 'user_sessions';

  // Generate new token for additional security (optional)
  const newToken = crypto.randomBytes(64).toString('hex');
  
  // Create new session
  const { data: newSession, error } = await supabase
    .from(table)
    .insert({
      user_id: currentSession.user_id || currentSession.admin_id,
      token: newToken,
      expires_at: newExpiresAt.toISOString(),
      user_agent: currentSession.user_agent,
      ip_address: currentSession.ip_address,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (!error && newSession) {
    // Delete old session
    await supabase.from(table).delete().eq('token', token);
    
    // Set new cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.setHeader('Set-Cookie', [
      `session_token=${newToken}; Path=/; Max-Age=2592000; SameSite=Strict; ${isProduction ? 'Secure;' : ''} HttpOnly`,
      `session_refreshed=true; Path=/; Max-Age=3600; SameSite=Strict`
    ]);
  }
}

// ============================================
// LOGGING & ANALYTICS
// ============================================

async function logAuthenticationEvent(userId, type, req) {
  try {
    await supabase.from('auth_logs').insert({
      user_id: userId,
      event_type: 'session_check',
      auth_type: type,
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Non-critical, don't block auth
    console.error('Auth logging failed:', error.message);
  }
}

async function logSecurityEvent(eventType, metadata, req) {
  try {
    await supabase.from('security_events').insert({
      event_type: eventType,
      metadata,
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Security logging failed:', error.message);
  }
}

// ============================================
// RESPONSE HELPERS
// ============================================

function methodNotAllowed(res) {
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({
    success: false,
    error: 'Method not allowed',
    code: 'METHOD_NOT_ALLOWED'
  });
}

function unauthenticatedResponse(res, reason) {
  return res.status(200).json({
    authenticated: false,
    isAdmin: false,
    code: 'UNAUTHENTICATED',
    reason,
    timestamp: new Date().toISOString()
  });
}

function authenticatedResponse(res, sessionData) {
  const response = {
    authenticated: true,
    isAdmin: sessionData.isAdmin,
    user: sessionData.user,
    session: {
      expires_at: sessionData.session.expires_at,
      created_at: sessionData.session.created_at,
      needsRefresh: sessionData.needsRefresh || false
    },
    permissions: sessionData.isAdmin ? ['*'] : getUserPermissions(sessionData.user),
    features: getFeatureFlags(sessionData.user),
    timestamp: new Date().toISOString()
  };

  // Add MFA requirement if needed
  if (sessionData.user?.requiresMFA) {
    response.requiresMFA = true;
  }

  return res.status(200).json(response);
}

function serverErrorResponse(res) {
  return res.status(500).json({
    authenticated: false,
    isAdmin: false,
    code: 'SERVER_ERROR',
    message: 'An internal error occurred. Please try again.',
    timestamp: new Date().toISOString()
  });
}

// ============================================
// PERMISSIONS & FEATURES
// ============================================

function getUserPermissions(user) {
  // Return permissions based on subscription tier
  const basePermissions = ['read:content', 'write:bookmarks'];
  
  if (user.subscription_tier === 'premium') {
    return [...basePermissions, 'read:premium', 'export:data', 'ai:assistant'];
  }
  
  if (user.subscription_tier === 'enterprise') {
    return [...basePermissions, 'read:premium', 'export:data', 'ai:assistant', 'admin:team', 'audit:logs'];
  }
  
  return basePermissions;
}

function getFeatureFlags(user) {
  // Feature flags based on user attributes
  return {
    darkMode: true,
    bookmarks: true,
    collections: true,
    aiRecommendations: user.subscription_tier !== 'free',
    advancedAnalytics: ['premium', 'enterprise'].includes(user.subscription_tier),
    teamSharing: user.subscription_tier === 'enterprise',
    apiAccess: user.subscription_tier !== 'free'
  };
}