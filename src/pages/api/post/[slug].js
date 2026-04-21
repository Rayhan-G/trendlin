// src/pages/api/post/[slug].js (COMPLETE FIXED FILE)

import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  const { slug } = req.query
  
  // ✅ FIXED: Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ 
      success: false, 
      error: `Method ${req.method} not allowed` 
    })
  }
  
  // ✅ FIXED: Validate slug
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'Slug is required and must be a string' 
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
  
  // ✅ FIXED: Add cache headers (1 hour)
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=1800')
  
  try {
    // ✅ FIXED: Use maybeSingle() instead of single() to avoid errors
    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
    
    if (error) {
      console.error('Error fetching post:', error)
      return res.status(500).json({ 
        success: false, 
        error: 'Database error occurred' 
      })
    }
    
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        error: 'Post not found' 
      })
    }
    
    // ✅ FIXED: Increment view count asynchronously (don't await)
    // This prevents blocking the response
    supabase.rpc('increment_post_views', { post_id: post.id }).catch(err => {
      console.error('Failed to increment view count:', err)
    })
    
    // Return the post
    return res.status(200).json({
      success: true,
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        featured_image: post.featured_image,
        featured_video: post.featured_video,
        category: post.category,
        tags: post.tags,
        published_at: post.published_at,
        seo_title: post.seo_title,
        seo_description: post.seo_description,
        views: post.views,
        author_name: post.author_name,
        created_at: post.created_at,
        updated_at: post.updated_at
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