import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    // GET: Fetch active post for a category or all active posts
    if (req.method === 'GET') {
        const { category } = req.query;
        
        if (category) {
            // Get single category post
            const { data, error } = await supabase
                .from('live_posts')
                .select('*, comments:live_post_comments(*)')
                .eq('category', category)
                .eq('status', 'active')
                .gt('expires_at', new Date().toISOString())
                .order('published_at', { ascending: false })
                .limit(1)
                .single();
            
            if (error && error.code !== 'PGRST116') {
                return res.status(500).json({ error: error.message });
            }
            return res.status(200).json({ post: data || null });
        } else {
            // Get all active posts
            const { data, error } = await supabase
                .from('live_posts')
                .select('*')
                .eq('status', 'active')
                .gt('expires_at', new Date().toISOString())
                .order('published_at', { ascending: false });
            
            if (error) return res.status(500).json({ error: error.message });
            return res.status(200).json({ posts: data || [] });
        }
    }
    
    // POST: Create new live post
    if (req.method === 'POST') {
        const { category, title, description, overlay_headline, media_items } = req.body;
        
        // Validation
        if (!category || !title || !description || !media_items?.length) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Check if category already has active post
        const { data: existing } = await supabase
            .from('live_posts')
            .select('id')
            .eq('category', category)
            .eq('status', 'active')
            .gt('expires_at', new Date().toISOString())
            .single();
        
        if (existing) {
            return res.status(400).json({ error: 'Category already has an active post' });
        }
        
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        const { data, error } = await supabase
            .from('live_posts')
            .insert([{
                category,
                title,
                description,
                overlay_headline,
                media_items,
                expires_at: expiresAt.toISOString(),
                published_at: new Date().toISOString(),
                status: 'active',
                likes: 0,
                shares: 0,
                liked_by: []
            }])
            .select()
            .single();
        
        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json({ post: data });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
}