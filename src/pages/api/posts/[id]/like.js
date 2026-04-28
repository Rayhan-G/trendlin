// pages/api/posts/[id]/like.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    const { id } = req.query;
    
    // Get current likes
    const { data: post } = await supabase
        .from('posts')
        .select('likes')
        .eq('id', id)
        .single();
    
    const { data, error } = await supabase
        .from('posts')
        .update({ likes: (post?.likes || 0) + 1 })
        .eq('id', id)
        .select()
        .single();
    
    if (error) return res.status(500).json({ error: error.message });
    
    return res.status(200).json({ likes: data.likes });
}