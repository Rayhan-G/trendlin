import { supabase } from '../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const sessionToken = req.cookies.session_token;
  
  if (sessionToken) {
    // Delete from both tables
    await supabase.from('user_sessions').delete().eq('token', sessionToken);
    await supabase.from('admin_sessions').delete().eq('token', sessionToken);
  }

  const isProduction = process.env.NODE_ENV === 'production';
  
  // Clear ALL cookies
  res.setHeader('Set-Cookie', [
    'session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict',
    'is_admin=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict',
    'admin_email=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict',
    'user_role=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict',
    'user_email=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict',
    'user_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict'
  ]);

  return res.status(200).json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
}