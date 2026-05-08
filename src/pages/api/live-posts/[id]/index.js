// src/pages/api/live-posts/[id]/index.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    const { id } = req.query;
    
    res.setHeader('Content-Type', 'application/json');
    
    if (!id) {
        return res.status(400).json({ error: 'Post ID is required' });
    }
    
    if (req.method === 'GET') {
        try {
            const { data: post, error } = await supabase
                .from('live_posts')
                .select('*, category:category_id(*)')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }
            
            return res.status(200).json({ success: true, post });
        } catch (error) {
            console.error('GET Error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
}