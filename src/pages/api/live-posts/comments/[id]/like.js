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
    const { user_id, has_liked } = req.body;
    
    if (!id || !user_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get current comment
    const { data: comment, error: fetchError } = await supabase
        .from('live_post_comments')
        .select('likes, liked_by')
        .eq('id', parseInt(id))
        .single();
    
    if (fetchError) return res.status(500).json({ error: fetchError.message });
    
    let result;
    if (has_liked) {
        // Unlike
        result = await supabase
            .from('live_post_comments')
            .update({
                likes: Math.max((comment.likes || 0) - 1, 0),
                liked_by: comment.liked_by?.filter(uid => uid !== user_id) || []
            })
            .eq('id', parseInt(id));
    } else {
        // Like
        result = await supabase
            .from('live_post_comments')
            .update({
                likes: (comment.likes || 0) + 1,
                liked_by: [...(comment.liked_by || []), user_id]
            })
            .eq('id', parseInt(id));
    }
    
    if (result.error) return res.status(500).json({ error: result.error.message });
    
    return res.status(200).json({ success: true });
}