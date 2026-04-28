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
    const { user_id } = req.body;
    
    if (!id || !user_id) {
        return res.status(400).json({ error: 'Missing post id or user id' });
    }
    
    // Get current post
    const { data: post, error: fetchError } = await supabase
        .from('live_posts')
        .select('likes, liked_by')
        .eq('id', id)
        .single();
    
    if (fetchError) return res.status(500).json({ error: fetchError.message });
    
    const hasLiked = post?.liked_by?.includes(user_id);
    
    let result;
    if (hasLiked) {
        // Unlike
        result = await supabase
            .from('live_posts')
            .update({
                likes: Math.max((post.likes || 0) - 1, 0),
                liked_by: post.liked_by.filter(uid => uid !== user_id)
            })
            .eq('id', id);
    } else {
        // Like
        result = await supabase
            .from('live_posts')
            .update({
                likes: (post.likes || 0) + 1,
                liked_by: [...(post.liked_by || []), user_id]
            })
            .eq('id', id);
    }
    
    if (result.error) return res.status(500).json({ error: result.error.message });
    
    return res.status(200).json({ 
        liked: !hasLiked,
        likes: hasLiked ? (post.likes || 0) - 1 : (post.likes || 0) + 1
    });
}