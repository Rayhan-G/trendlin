import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { id } = req.query;
    
    const { data, error } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) return res.status(500).json({ error: error.message });
    
    return res.status(200).json({ comments: data || [] });
  }
  
  if (req.method === 'POST') {
    const { id } = req.query;
    const { author_name, author_email, content } = req.body;
    
    // Validate required fields
    if (!author_name?.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!content?.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    
    // Insert comment
    const { data, error } = await supabase
      .from('post_comments')
      .insert([{
        post_id: id,
        author_name: author_name.trim(),
        author_email: author_email?.trim() || null,
        content: content.trim()
      }])
      .select()
      .single();
    
    if (error) return res.status(500).json({ error: error.message });
    
    // Update comment count on post
    await supabase
      .from('posts')
      .update({ comments_count: supabase.raw('comments_count + 1') })
      .eq('id', id);
    
    return res.status(201).json({ comment: data });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}