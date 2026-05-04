import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { id } = req.query;
  const sessionId = req.headers['x-session-id'];
  
  // Track unique views (optional: check if already viewed in this session)
  const { data, error } = await supabase
    .from('posts')
    .update({ view_count: supabase.raw('view_count + 1') })
    .eq('id', id)
    .select('view_count')
    .single();
  
  if (error) return res.status(500).json({ error: error.message });
  
  return res.status(200).json({ views: data.view_count });
}