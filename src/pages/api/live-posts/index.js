// pages/api/live-posts/index.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  // GET: Fetch posts by category
  if (req.method === 'GET') {
    const { category } = req.query
    
    let query = supabase.from('live_posts').select('*')
    
    if (category) {
      query = query.eq('category', category)
    }
    
    const { data, error } = await query.eq('status', 'published').gt('expires_at', new Date().toISOString())
    
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ posts: data || [] })
  }
  
  // POST: Create post
  if (req.method === 'POST') {
    const { category, title, content, media_items, status } = req.body
    
    if (!category) return res.status(400).json({ error: 'Category required' })
    
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    
    const { data, error } = await supabase.from('live_posts').insert({
      category,
      title,
      content,
      media_items,
      status: status || 'draft',
      published_at: status === 'published' ? new Date().toISOString() : null,
      expires_at: status === 'published' ? expiresAt.toISOString() : null
    }).select().single()
    
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ post: data })
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
}