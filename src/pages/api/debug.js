import { supabase, isSupabaseAvailable } from '@/lib/supabase'

export default async function handler(req, res) {
  if (!isSupabaseAvailable()) {
    return res.status(200).json({ error: 'Supabase not configured' })
  }
  
  // Get all posts
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
  
  res.status(200).json({
    posts: posts,
    error: error,
    count: posts?.length || 0
  })
}