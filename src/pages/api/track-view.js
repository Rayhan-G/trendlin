import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    const { postId, postTitle, category, slug } = req.body
    
    if (!postId) {
      return res.status(400).json({ error: 'postId is required' })
    }
    
    // Generate unique visitor ID (IP + User Agent)
    const visitorId = req.headers['x-forwarded-for']?.split(',')[0] || 
                      req.socket.remoteAddress || 
                      'unknown'
    
    // Check if this visitor viewed this post in last 24 hours
    const { data: existingView, error: checkError } = await supabase
      .from('views')
      .select('id')
      .eq('post_id', postId)
      .eq('visitor_id', visitorId)
      .gte('viewed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .maybeSingle()
    
    if (checkError) {
      console.error('Error checking existing view:', checkError)
    }
    
    // Only count unique views per 24 hours
    if (!existingView) {
      // Insert new view
      const { error: insertError } = await supabase
        .from('views')
        .insert({
          post_id: postId,
          visitor_id: visitorId,
          country: req.headers['cf-ipcountry'] || 'Unknown'
        })
      
      if (insertError) {
        console.error('Error inserting view:', insertError)
        return res.status(500).json({ error: 'Failed to track view' })
      }
    }
    
    // Get updated view count for this post
    const { count: totalViews, error: countError } = await supabase
      .from('views')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
    
    if (countError) {
      console.error('Error getting view count:', countError)
    }
    
    return res.status(200).json({ 
      success: true, 
      views: totalViews || 0
    })
    
  } catch (error) {
    console.error('Track view error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}