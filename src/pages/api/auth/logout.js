// ============================================
// API: Logout
// ============================================

export async function POST({ request, locals }) {
  const { DB } = locals.runtime.env;
  
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/session=([^;]+)/);
  const sessionId = match ? match[1] : null;
  
  console.log('🚪 Logout:', sessionId);
  
  if (sessionId) {
    try {
      await DB
        .prepare('DELETE FROM sessions WHERE session_id = ?')
        .bind(sessionId)
        .run();
      console.log('✅ Session deleted');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/admin/login',
      'Set-Cookie': 'session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax'
    }
  });
}