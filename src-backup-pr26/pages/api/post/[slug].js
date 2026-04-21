import { supabase, isSupabaseAvailable } from '@/lib/supabase'

export default async function handler(req, res) {
  const { slug } = req.query
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  if (!slug) {
    return res.status(400).json({ error: 'Slug is required' })
  }
  
  // Check if Supabase is available
  if (!isSupabaseAvailable()) {
    return res.status(200).json({
      success: true,
      post: null,
      warning: 'Supabase not configured'
    })
  }
  
  try {
    // Get post from popular_posts view
    const { data: post, error } = await supabase
      .from('popular_posts')
      .select('*')
      .eq('slug', slug)
      .single()
    
    if (error) {
      console.error('Error fetching post:', error)
      return res.status(404).json({ error: 'Post not found' })
    }
    
    return res.status(200).json({
      success: true,
      post: post
    })
    
  } catch (error) {
    console.error('API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}