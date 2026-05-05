// pages/api/live-posts/index.js
import { createClient } from '@supabase/supabase-js'

// Configure body parser for larger payloads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  // GET: Fetch posts by category
  if (req.method === 'GET') {
    try {
      const { category, limit = 50 } = req.query
      
      let query = supabase
        .from('live_posts')
        .select('*')
        .eq('status', 'published')
        .gt('expires_at', new Date().toISOString())
        .order('published_at', { ascending: false })
        .limit(parseInt(limit))
      
      if (category && category !== 'all') {
        query = query.eq('category', category)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      return res.status(200).json({ posts: data || [], success: true })
    } catch (error) {
      console.error('GET error:', error)
      return res.status(500).json({ error: error.message, success: false })
    }
  }
  
  // POST: Create post
  if (req.method === 'POST') {
    try {
      const { category, title, content, media_items, status } = req.body
      
      // Validate required fields
      if (!category) {
        return res.status(400).json({ error: 'Category is required', success: false })
      }
      
      // Check if category already has an active post
      const { data: existing, error: checkError } = await supabase
        .from('live_posts')
        .select('id')
        .eq('category', category)
        .eq('status', 'published')
        .gt('expires_at', new Date().toISOString())
        .limit(1)
      
      if (checkError) throw checkError
      
      if (existing && existing.length > 0) {
        return res.status(400).json({ 
          error: 'This category already has an active post. Please wait for it to expire.', 
          success: false 
        })
      }
      
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
      
      const { data, error } = await supabase
        .from('live_posts')
        .insert({
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
        })
        .select()
        .single()
      
      if (error) throw error
      
      return res.status(201).json({ post: data, success: true })
    } catch (error) {
      console.error('POST error:', error)
      return res.status(500).json({ error: error.message, success: false })
    }
  }
  
  // DELETE: Remove expired posts (optional admin function)
  if (req.method === 'DELETE') {
    try {
      const { data, error } = await supabase
        .from('live_posts')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .eq('status', 'expired')
      
      if (error) throw error
      
      return res.status(200).json({ deleted: data?.length || 0, success: true })
    } catch (error) {
      return res.status(500).json({ error: error.message, success: false })
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed', success: false })
}