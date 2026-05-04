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
  
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID required' });
  }
  
  // Check if already liked
  const { data: existingReaction } = await supabase
    .from('post_reactions')
    .select('id')
    .eq('post_id', id)
    .eq('session_id', sessionId)
    .single();
  
  if (existingReaction) {
    // Unlike: Remove reaction and decrement count
    await supabase
      .from('post_reactions')
      .delete()
      .eq('id', existingReaction.id);
    
    const { data: post, error } = await supabase
      .from('posts')
      .update({ likes: supabase.raw('likes - 1') })
      .eq('id', id)
      .select('likes')
      .single();
    
    if (error) return res.status(500).json({ error: error.message });
    
    return res.status(200).json({ liked: false, likes: post.likes });
  } else {
    // Like: Add reaction and increment count
    await supabase
      .from('post_reactions')
      .insert({ post_id: id, session_id: sessionId });
    
    const { data: post, error } = await supabase
      .from('posts')
      .update({ likes: supabase.raw('likes + 1') })
      .eq('id', id)
      .select('likes')
      .single();
    
    if (error) return res.status(500).json({ error: error.message });
    
    return res.status(200).json({ liked: true, likes: post.likes });
  }
}