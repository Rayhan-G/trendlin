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
    const { user_name, content, user_email, user_avatar } = req.body;
    
    if (!id || !user_name || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const { data, error } = await supabase
        .from('live_post_comments')
        .insert([{
            live_post_id: parseInt(id),
            user_name,
            user_email: user_email || null,
            user_avatar: user_avatar || null,
            content,
            status: 'approved',
            likes: 0,
            liked_by: []
        }])
        .select()
        .single();
    
    if (error) return res.status(500).json({ error: error.message });
    
    return res.status(201).json({ comment: data });
}