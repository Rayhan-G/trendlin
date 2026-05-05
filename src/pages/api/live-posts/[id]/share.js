// pages/api/live-posts/[id]/share.js
import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  const { id } = req.query
  const { platform } = req.body
  
  try {
    // Get current shares
    const { data: post, error: fetchError } = await supabase
      .from('live_posts')
      .select('shares')
      .eq('id', id)
      .single()
    
    if (fetchError) throw fetchError
    
    // Increment share count
    const newShares = (post?.shares || 0) + 1
    
    const { error: updateError } = await supabase
      .from('live_posts')
      .update({ shares: newShares })
      .eq('id', id)
    
    if (updateError) throw updateError
    
    // Log share for analytics (optional)
    await supabase
      .from('share_logs')
      .insert([{
        post_id: id,
        platform: platform || 'unknown',
        shared_at: new Date().toISOString()
      }])
    
    return res.status(200).json({ success: true, shares: newShares })
    
  } catch (error) {
    console.error('Share error:', error)
    return res.status(500).json({ error: error.message })
  }
}