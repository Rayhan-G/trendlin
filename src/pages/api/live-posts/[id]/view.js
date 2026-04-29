// pages/api/live-posts/[id]/view.js
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
    
    if (!id) {
        return res.status(400).json({ error: 'Post ID is required' });
    }
    
    try {
        // Increment view count
        const { error } = await supabase.rpc('increment_view_count', {
            post_id: id
        });
        
        // If RPC doesn't exist, do it manually
        if (error) {
            const { data: post } = await supabase
                .from('live_posts')
                .select('view_count')
                .eq('id', id)
                .single();
            
            await supabase
                .from('live_posts')
                .update({ view_count: (post?.view_count || 0) + 1 })
                .eq('id', id);
        }
        
        return res.status(200).json({ success: true });
        
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}