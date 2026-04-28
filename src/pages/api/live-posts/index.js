// pages/api/live-posts/index.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    // GET: Fetch active post
    if (req.method === 'GET') {
        const { category } = req.query;
        
        const { data, error } = await supabase
            .from('live_posts')
            .select('*')
            .eq('category', category)
            .eq('status', 'published')
            .gt('expires_at', new Date().toISOString())
            .order('published_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
            return res.status(500).json({ error: error.message });
        }
        
        return res.status(200).json({ post: data || null });
    }
    
    // POST: Create new post - NO VALIDATION, anything goes
    if (req.method === 'POST') {
        const { category, title, content, status, media_items } = req.body;
        
        if (!category) {
            return res.status(400).json({ error: 'Category is required' });
        }
        
        // Check if category already has active published post
        if (status === 'published') {
            const { data: existing } = await supabase
                .from('live_posts')
                .select('id')
                .eq('category', category)
                .eq('status', 'published')
                .gt('expires_at', new Date().toISOString())
                .maybeSingle();
            
            if (existing) {
                return res.status(400).json({ error: 'This category already has an active post' });
            }
        }
        
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        const postData = {
            category,
            title: title || null,
            content: content || null,
            media_items: media_items || [],
            status: status || 'draft',
            published_at: status === 'published' ? new Date().toISOString() : null,
            expires_at: status === 'published' ? expiresAt.toISOString() : null,
            likes: 0,
            shares: 0,
            liked_by: []
        };
        
        const { data, error } = await supabase
            .from('live_posts')
            .insert([postData])
            .select()
            .single();
        
        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json({ post: data });
    }
    
    // PUT: Update existing post - NO VALIDATION
    if (req.method === 'PUT') {
        const { id } = req.query;
        const { title, content, status, media_items } = req.body;
        
        const updateData = {
            title: title || null,
            content: content || null,
            media_items: media_items || [],
            updated_at: new Date().toISOString()
        };
        
        if (status === 'published' && !updateData.published_at) {
            updateData.status = 'published';
            updateData.published_at = new Date().toISOString();
            updateData.expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        }
        
        const { data, error } = await supabase
            .from('live_posts')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
        
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ post: data });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
}