// pages/api/live-posts/[id]/comments.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    const { id } = req.query;
    
    if (!id) {
        return res.status(400).json({ error: 'Post ID is required' });
    }
    
    // GET comments
    if (req.method === 'GET') {
        const { data, error } = await supabase
            .from('live_post_comments')
            .select('*')
            .eq('live_post_id', id)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });
        
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        
        return res.status(200).json({ comments: data || [] });
    }
    
    // POST a comment
    if (req.method === 'POST') {
        const { user_name, content, user_email, user_avatar } = req.body;
        
        if (!user_name || !content) {
            return res.status(400).json({ error: 'Name and content are required' });
        }
        
        const { data, error } = await supabase
            .from('live_post_comments')
            .insert([{
                live_post_id: parseInt(id),
                user_name,
                user_email: user_email || null,
                user_avatar: user_avatar || null,
                content,
                status: 'pending' // Requires admin approval
            }])
            .select()
            .single();
        
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        
        return res.status(201).json({ comment: data });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
}