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
    const { admin_reply, admin_name } = req.body;
    
    if (!id || !admin_reply) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const { error } = await supabase
        .from('live_post_comments')
        .update({
            admin_reply,
            admin_replied_at: new Date().toISOString(),
            admin_name: admin_name || 'Admin'
        })
        .eq('id', parseInt(id));
    
    if (error) return res.status(500).json({ error: error.message });
    
    return res.status(200).json({ success: true });
}