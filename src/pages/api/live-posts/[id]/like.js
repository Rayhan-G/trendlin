// src/pages/api/live-posts/[id]/like.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { id } = req.query;
    const { user_id } = req.body;
    
    if (!id || !user_id) {
        return res.status(400).json({ error: 'Post ID and User ID required' });
    }
    
    try {
        const { data: post, error: fetchError } = await supabase
            .from('live_posts')
            .select('likes_count, liked_by')
            .eq('id', id)
            .single();
        
        if (fetchError) throw fetchError;
        
        const likedBy = post.liked_by || [];
        const hasLiked = likedBy.includes(user_id);
        
        const { error: updateError } = await supabase
            .from('live_posts')
            .update({
                likes_count: hasLiked 
                    ? Math.max((post.likes_count || 0) - 1, 0)
                    : (post.likes_count || 0) + 1,
                liked_by: hasLiked
                    ? likedBy.filter(uid => uid !== user_id)
                    : [...likedBy, user_id]
            })
            .eq('id', id);
        
        if (updateError) throw updateError;
        
        return res.status(200).json({ 
            success: true, 
            liked: !hasLiked,
            likes_count: hasLiked 
                ? Math.max((post.likes_count || 0) - 1, 0)
                : (post.likes_count || 0) + 1
        });
    } catch (error) {
        console.error('Like Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}