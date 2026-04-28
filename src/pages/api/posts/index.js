// pages/api/posts/index.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    if (req.method === 'GET') {
        // Get active post for a category
        const { category } = req.query;
        
        const { data, error } = await supabase
            .from('posts')
            .select('*, comments:post_comments(*)')
            .eq('category', category)
            .gt('expires_at', new Date().toISOString())
            .order('published_at', { ascending: false })
            .limit(1)
            .single();
        
        if (error && error.code !== 'PGRST116') {
            return res.status(500).json({ error: error.message });
        }
        
        return res.status(200).json({ post: data || null });
    }
    
    if (req.method === 'POST') {
        // Create new post
        const { category, description, overlay_headline, media_items } = req.body;
        
        // Check if category already has active post
        const { data: existing } = await supabase
            .from('posts')
            .select('id')
            .eq('category', category)
            .gt('expires_at', new Date().toISOString())
            .limit(1);
        
        if (existing && existing.length > 0) {
            return res.status(400).json({ error: 'Category already has an active post' });
        }
        
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        const { data, error } = await supabase
            .from('posts')
            .insert([{
                category,
                description,
                overlay_headline,
                media_items,
                expires_at: expiresAt.toISOString(),
                likes: 0,
                shares: 0
            }])
            .select()
            .single();
        
        if (error) return res.status(500).json({ error: error.message });
        
        return res.status(201).json({ post: data });
    }
}