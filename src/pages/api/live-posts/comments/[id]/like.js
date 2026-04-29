// pages/api/live-posts/comments/[id]/like.js
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
    const { user_id, has_liked } = req.body;
    
    // Validate required fields
    if (!id) {
        return res.status(400).json({ error: 'Comment ID is required' });
    }
    
    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    
    try {
        // Parse comment ID
        const commentId = parseInt(id);
        if (isNaN(commentId)) {
            return res.status(400).json({ error: 'Invalid comment ID' });
        }
        
        // Get current comment
        const { data: comment, error: fetchError } = await supabase
            .from('live_post_comments')
            .select('likes, liked_by')
            .eq('id', commentId)
            .single();
        
        if (fetchError) {
            console.error('Fetch error:', fetchError);
            return res.status(500).json({ error: fetchError.message });
        }
        
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        
        // Ensure liked_by is an array
        const currentLikedBy = comment.liked_by || [];
        const currentlyLiked = currentLikedBy.includes(user_id);
        
        // Determine the action based on has_liked parameter or current state
        const shouldUnlike = has_liked === true || (has_liked === undefined && currentlyLiked);
        const shouldLike = has_liked === false || (has_liked === undefined && !currentlyLiked);
        
        let result;
        let newLikesCount;
        let newLikedBy;
        
        if (shouldUnlike) {
            // Unlike: remove user_id from liked_by and decrement likes
            newLikedBy = currentLikedBy.filter(uid => uid !== user_id);
            newLikesCount = Math.max((comment.likes || 0) - 1, 0);
            
            result = await supabase
                .from('live_post_comments')
                .update({
                    likes: newLikesCount,
                    liked_by: newLikedBy
                })
                .eq('id', commentId);
        } else if (shouldLike) {
            // Like: add user_id to liked_by and increment likes
            newLikedBy = [...currentLikedBy, user_id];
            newLikesCount = (comment.likes || 0) + 1;
            
            result = await supabase
                .from('live_post_comments')
                .update({
                    likes: newLikesCount,
                    liked_by: newLikedBy
                })
                .eq('id', commentId);
        } else {
            // No change needed
            return res.status(200).json({ 
                success: true,
                liked: currentlyLiked,
                likes: comment.likes || 0,
                message: 'No change in like status'
            });
        }
        
        if (result.error) {
            console.error('Update error:', result.error);
            return res.status(500).json({ error: result.error.message });
        }
        
        // Return updated state
        return res.status(200).json({ 
            success: true,
            liked: shouldLike,
            likes: newLikesCount,
            commentId: commentId
        });
        
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}