// src/pages/api/live-posts/[id]/comments.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    const { id } = req.query;
    
    // Set JSON header
    res.setHeader('Content-Type', 'application/json');
    
    if (!id) {
        return res.status(400).json({ error: 'Post ID required' });
    }
    
    // GET - Fetch comments
    if (req.method === 'GET') {
        try {
            // Get top-level comments
            const { data: comments, error } = await supabase
                .from('post_comments')
                .select('*')
                .eq('post_id', parseInt(id))
                .is('parent_id', null)
                .eq('status', 'approved')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            // Get replies for each comment
            const commentsWithReplies = await Promise.all(
                (comments || []).map(async (comment) => {
                    const { data: replies } = await supabase
                        .from('post_comments')
                        .select('*')
                        .eq('parent_id', comment.id)
                        .eq('status', 'approved')
                        .order('created_at', { ascending: true });
                    
                    return {
                        ...comment,
                        replies: replies || [],
                        reply_count: replies?.length || 0
                    };
                })
            );
            
            return res.status(200).json({ 
                success: true, 
                comments: commentsWithReplies 
            });
        } catch (error) {
            console.error('GET comments error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    
    // POST - Add new comment
    if (req.method === 'POST') {
        try {
            const { user_name, user_email, content, parent_id } = req.body;
            
            if (!user_name || !content) {
                return res.status(400).json({ error: 'Name and content required' });
            }
            
            const { data, error } = await supabase
                .from('post_comments')
                .insert({
                    post_id: parseInt(id),
                    parent_id: parent_id || null,
                    user_id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                    user_name,
                    user_email: user_email || null,
                    content,
                    status: 'approved'
                })
                .select()
                .single();
            
            if (error) throw error;
            
            return res.status(201).json({ success: true, comment: data });
        } catch (error) {
            console.error('POST comment error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
}