import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { id } = req.query;
    
    if (!id) {
        return res.status(400).json({ error: 'Missing post id' });
    }
    
    const { data, error } = await supabase
        .from('live_post_comments')
        .select('*')
        .eq('live_post_id', parseInt(id))
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
    
    if (error) return res.status(500).json({ error: error.message });
    
    return res.status(200).json({ comments: data || [] });
}