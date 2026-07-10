import bcrypt from 'bcryptjs';

export async function onRequest(context: any) {
  const { request, env } = context;
  
  // Only accept POST requests
  if (request.method !== 'POST') {
    return new Response('Method not allowed. Use POST.', { 
      status: 405,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  try {
    const formData = await request.formData();
    const username = formData.get('username');
    const password = formData.get('password');

    // Query admin from database
    const admin = await env.DB
      .prepare('SELECT * FROM admins WHERE username = ?')
      .bind(username)
      .first();

    // Check if admin exists
    if (!admin) {
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/admin?error=Invalid credentials'
        }
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/admin?error=Invalid credentials'
        }
      });
    }

    // Generate session ID
    const sessionId = crypto.randomUUID();
    
    // Create response with redirect and session cookie
    const response = new Response(null, {
      status: 302,
      headers: {
        'Location': '/admin/dashboard',
        'Set-Cookie': `session=${sessionId}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`
      }
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/admin?error=Login failed'
      }
    });
  }
}