// src/pages/api/live-posts/index.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method === 'GET') {
        try {
            const { category, limit = 50, page = 1 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            
            let query = supabase
                .from('live_posts')
                .select('*', { count: 'exact' })
                .eq('status', 'published')
                .gt('expires_at', new Date().toISOString())
                .order('published_at', { ascending: false });
            
            if (category && category !== 'all') {
                query = query.eq('category_id', parseInt(category));
            }
            
            const { data, error, count } = await query.range(offset, offset + parseInt(limit) - 1);
            
            if (error) throw error;
            
            return res.status(200).json({ 
                success: true, 
                posts: data || [],
                pagination: {
                    total: count || 0,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil((count || 0) / parseInt(limit))
                }
            });
        } catch (error) {
            console.error('GET Error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
}