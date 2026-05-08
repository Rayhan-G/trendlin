import { createClient } from '@supabase/supabase-js'; 
 
const supabase = createClient( 
    process.env.NEXT_PUBLIC_SUPABASE_URL, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
); 
 
export default async function handler(req, res) { 
    if (req.method !== 'GET') { 
        return res.status(405).json({ error: 'Method not allowed' }); 
    } 
 
    try { 
        const { data: categories, error } = await supabase 
            .from('post_categories') 
            .select('*') 
            .eq('is_active', true) 
            .order('name'); 
 
        if (error) throw error; 
    } catch (error) { 
        return res.status(500).json({ success: false, error: error.message }); 
    } 
} 
