// pages/api/posts/[id]/comment.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    const { id } = req.query;
    const { author, text } = req.body;
    
    const { data, error } = await supabase
        .from('post_comments')
        .insert([{
            post_id: id,
            author,
            text
        }])
        .select()
        .single();
    
    if (error) return res.status(500).json({ error: error.message });
    
    return res.status(201).json({ comment: data });
}