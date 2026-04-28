// pages/api/live-posts/[id]/share.js
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
    
    const { data: post, error: fetchError } = await supabase
        .from('live_posts')
        .select('shares')
        .eq('id', id)
        .single();
    
    if (fetchError) return res.status(500).json({ error: fetchError.message });
    
    const { error } = await supabase
        .from('live_posts')
        .update({ shares: (post?.shares || 0) + 1 })
        .eq('id', id);
    
    if (error) return res.status(500).json({ error: error.message });
    
    return res.status(200).json({ success: true });
}