// pages/api/live-posts/[id]/like.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { id } = req.query;
    const { user_id } = req.body;
    
    // Validate required fields
    if (!id) {
        return res.status(400).json({ error: 'Post ID is required' });
    }
    
    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    
    try {
        // Get current post
        const { data: post, error: fetchError } = await supabase
            .from('live_posts')
            .select('likes, liked_by')
            .eq('id', id)
            .single();
        
        if (fetchError) {
            console.error('Fetch error:', fetchError);
            return res.status(500).json({ error: fetchError.message });
        }
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        // Ensure liked_by is an array
        const currentLikedBy = post.liked_by || [];
        const hasLiked = currentLikedBy.includes(user_id);
        
        let result;
        if (hasLiked) {
            // Unlike: remove user_id from liked_by and decrement likes
            result = await supabase
                .from('live_posts')
                .update({
                    likes: Math.max((post.likes || 0) - 1, 0),
                    liked_by: currentLikedBy.filter(uid => uid !== user_id)
                })
                .eq('id', id);
        } else {
            // Like: add user_id to liked_by and increment likes
            result = await supabase
                .from('live_posts')
                .update({
                    likes: (post.likes || 0) + 1,
                    liked_by: [...currentLikedBy, user_id]
                })
                .eq('id', id);
        }
        
        if (result.error) {
            console.error('Update error:', result.error);
            return res.status(500).json({ error: result.error.message });
        }
        
        // Return the updated state
        return res.status(200).json({ 
            success: true,
            liked: !hasLiked,
            likes: hasLiked ? (post.likes || 0) - 1 : (post.likes || 0) + 1
        });
        
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}