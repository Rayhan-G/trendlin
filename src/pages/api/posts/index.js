// src/pages/api/posts/index.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const { limit = 100 } = req.query;
            
            // If you have a 'posts' table, use it
            let query = supabase
                .from('posts')
                .select('*')
                .eq('status', 'published')
                .order('created_at', { ascending: false });
            
            // If 'posts' table doesn't exist, return empty array
            const { data, error } = await query;
            
            if (error) {
                // Return empty array if table doesn't exist
                return res.status(200).json({ 
                    success: true, 
                    posts: [] 
                });
            }
            
            return res.status(200).json({ 
                success: true, 
                posts: data || [] 
            });
        } catch (error) {
            console.error('Posts API error:', error);
            return res.status(200).json({ 
                success: true, 
                posts: [] 
            });
        }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
}