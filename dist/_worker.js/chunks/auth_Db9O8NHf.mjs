globalThis.process ??= {}; globalThis.process.env ??= {};
// ============================================
// AUTH SERVICE
// ============================================

// Get session from request cookie
function getSessionFromRequest(request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/session=([^;]+)/);
  return match ? match[1] : null;
}

// Get current user from session
async function getCurrentUser(request, DB) {
  const sessionId = getSessionFromRequest(request);
  if (!sessionId) return null;
  
  try {
    // Check if session exists and is valid
    const session = await DB
      .prepare('SELECT * FROM sessions WHERE session_id = ? AND expires_at > datetime("now")')
      .bind(sessionId)
      .first();
    
    if (!session) return null;
    
    // Get user from session
    const user = await DB
      .prepare('SELECT id, username, email, role FROM admins WHERE id = ?')
      .bind(session.user_id)
      .first();
    
    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export { getCurrentUser as g };
