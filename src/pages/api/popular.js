// src/pages/api/popular.js (COMPLETE FIXED FILE)

import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  // ✅ FIXED: Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ 
      success: false, 
      error: `Method ${req.method} not allowed` 
    })
  }
  
  // ✅ FIXED: Add CORS headers for API access
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  // ✅ FIXED: Add cache headers (1 hour for popular posts)
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=1800')
  
  // ✅ FIXED: Parse query parameters for pagination
  const limit = Math.min(parseInt(req.query.limit) || 20, 50) // Max 50
  const offset = parseInt(req.query.offset) || 0
  const days = parseInt(req.query.days) || 30 // Popular in last N days
  
  try {
    let query = supabase
      .from('posts')
      .select('id, title, slug, excerpt, featured_image, category, views, published_at, created_at', { count: 'exact' })
      .eq('status', 'published')
      .order('views', { ascending: false })
      .range(offset, offset + limit - 1)
      .limit(limit)
    
    // ✅ FIXED: Optional date filter for trending posts
    if (days && days < 365) {
      const dateThreshold = new Date()
      dateThreshold.setDate(dateThreshold.getDate() - days)
      query = query.gte('published_at', dateThreshold.toISOString())
    }
    
    const { data: posts, error, count } = await query
    
    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({ 
        success: false, 
        error: 'Database error occurred' 
      })
    }
    
    // ✅ FIXED: Return only necessary fields
    const sanitizedPosts = posts?.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      featured_image: post.featured_image,
      category: post.category,
      views: post.views,
      published_at: post.published_at
    })) || []
    
    return res.status(200).json({
      success: true,
      posts: sanitizedPosts,
      pagination: {
        limit,
        offset,
        total: count || sanitizedPosts.length,
        hasMore: offset + limit < (count || sanitizedPosts.length)
      }
    })
    
  } catch (error) {
    console.error('API error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
}