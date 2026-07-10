import bcrypt from 'bcryptjs';

export async function onRequest(context: any) {
  const { env } = context;
  
  try {
    // Check if admin exists
    const existing = await env.DB
      .prepare('SELECT * FROM admins WHERE username = ?')
      .bind('admin')
      .first();
    
    if (existing) {
      return new Response('Admin already exists', { status: 200 });
    }

    // Create admin with password: admin123
    const hash = bcrypt.hashSync('admin123', 10);
    await env.DB
      .prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)')
      .bind('admin', hash)
      .run();

    return new Response('Admin created! Username: admin, Password: admin123', { status: 200 });
  } catch (error) {
    return new Response('Error: ' + error.message, { status: 500 });
  }
}