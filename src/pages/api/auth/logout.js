import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const sessionToken = req.cookies.session_token;

  if (sessionToken) {
    // Delete from user_sessions (regular users)
    await supabase.from('user_sessions').delete().eq('token', sessionToken);
    
    // Delete from admin_sessions (admin users)
    await supabase.from('admin_sessions').delete().eq('token', sessionToken);
  }

  // Clear all auth cookies
  const isProduction = process.env.NODE_ENV === 'production';
  res.setHeader('Set-Cookie', [
    `session_token=; Path=/; Max-Age=0; SameSite=Strict; ${isProduction ? 'Secure;' : ''} HttpOnly`,
    `is_admin=; Path=/; Max-Age=0; SameSite=Strict`,
    `admin_email=; Path=/; Max-Age=0; SameSite=Strict`,
    `user_email=; Path=/; Max-Age=0; SameSite=Strict`,
    `user_id=; Path=/; Max-Age=0; SameSite=Strict`,
    `user_role=; Path=/; Max-Age=0; SameSite=Strict`
  ]);

  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}