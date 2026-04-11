import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    // Get posts from the last 7 days with real view counts
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { data: posts, error } = await supabase
      .from('popular_posts')
      .select('*')
      .order('view_count', { ascending: false })
      .limit(12)
    
    if (error) {
      console.error('Error fetching today\'s picks:', error)
      return res.status(500).json({ error: 'Failed to fetch posts' })
    }
    
    return res.status(200).json({
      success: true,
      posts: posts || []
    })
    
  } catch (error) {
    console.error('API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}