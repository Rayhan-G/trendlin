// src/utils/popularityTracker.js (COMPLETE FIXED FILE)

import { supabase } from '@/lib/supabase'

/**
 * Get or create visitor session ID
 * @returns {string} Session ID
 */
const getVisitorSessionId = () => {
  if (typeof window === 'undefined') return null
  
  let sessionId = localStorage.getItem('visitor_session_id')
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('visitor_session_id', sessionId)
  }
  return sessionId
}

/**
 * Track a single post view with deduplication per day
 * @param {string} postId - Post ID to track
 * @returns {Promise<boolean>} Success status
 */
export async function trackPostView(postId) {
  if (typeof window === 'undefined') return false
  if (!postId) return false
  
  const today = new Date().toISOString().split('T')[0]
  const sessionKey = `viewed_${postId}_${today}`
  
  // Check if already viewed today in this session
  if (sessionStorage.getItem(sessionKey)) {
    return false
  }
  
  const sessionId = getVisitorSessionId()
  if (!sessionId) return false
  
  // Mark as viewed in this session
  sessionStorage.setItem(sessionKey, 'true')
  
  try {
    // ✅ FIXED: Insert into post_views with proper columns
    const { error: upsertError } = await supabase
      .from('post_views')
      .upsert({
        post_id: postId,
        session_id: sessionId,
        view_date: today,
        view_count: 1
      }, {
        onConflict: 'post_id,view_date,session_id'
      })
    
    if (upsertError) {
      console.error('Upsert error:', upsertError)
      return false
    }
    
    // ✅ FIXED: Increment total post views counter
    const { error: rpcError } = await supabase.rpc('increment_post_views', {
      post_id: postId,
      increment_by: 1
    })
    
    if (rpcError) {
      console.error('RPC error:', rpcError)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error tracking view:', error)
    return false
  }
}

/**
 * Get popular posts (all-time, by total views)
 * @param {number} limit - Max posts to return
 * @returns {Promise<Array>} Array of posts
 */
export async function getPopularPosts(limit = 30) {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .order('views', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return posts || []
  } catch (error) {
    console.error('Error fetching popular posts:', error)
    return []
  }
}

/**
 * Get trending posts (most viewed in last 7 days)
 * @param {number} limit - Max posts to return
 * @returns {Promise<Array>} Array of posts with view counts
 */
export async function getTrendingPosts(limit = 20) {
  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]
    const todayStr = new Date().toISOString().split('T')[0]
    
    // ✅ FIXED: Get view counts from last 7 days
    const { data: viewCounts, error: viewsError } = await supabase
      .from('post_views')
      .select('post_id, view_count')
      .gte('view_date', sevenDaysAgoStr)
      .lte('view_date', todayStr)
    
    if (viewsError) {
      console.error('Views fetch error:', viewsError)
      return []
    }
    
    // Aggregate view counts by post
    const viewMap = new Map()
    viewCounts?.forEach(view => {
      const current = viewMap.get(view.post_id) || 0
      viewMap.set(view.post_id, current + (view.view_count || 1))
    })
    
    if (viewMap.size === 0) {
      // Fallback to regular popular posts
      return getPopularPosts(limit)
    }
    
    // Get posts with their aggregated view counts
    const postIds = Array.from(viewMap.keys())
    
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .in('id', postIds)
      .eq('status', 'published')
    
    if (postsError) {
      console.error('Posts fetch error:', postsError)
      return []
    }
    
    // Add view counts to posts and sort
    const postsWithViews = posts.map(post => ({
      ...post,
      trending_views: viewMap.get(post.id) || 0
    }))
    
    postsWithViews.sort((a, b) => b.trending_views - a.trending_views)
    
    return postsWithViews.slice(0, limit)
  } catch (error) {
    console.error('Error fetching trending posts:', error)
    return []
  }
}

/**
 * Get today's published posts
 * @returns {Promise<Array>} Array of today's posts
 */
export async function getTodayPosts() {
  try {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .gte('published_at', `${todayStr}T00:00:00`)
      .lte('published_at', `${todayStr}T23:59:59`)
      .order('published_at', { ascending: false })
    
    if (error) throw error
    return posts || []
  } catch (error) {
    console.error('Error fetching today\'s posts:', error)
    return []
  }
}

/**
 * Get posts by category, ordered by views
 * @param {string} category - Category slug
 * @param {number} limit - Max posts to return
 * @returns {Promise<Array>} Array of posts
 */
export async function getCategoryPosts(category, limit = 50) {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .eq('category', category)
      .order('views', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return posts || []
  } catch (error) {
    console.error('Error fetching category posts:', error)
    return []
  }
}

/**
 * Get editor's picks (featured posts)
 * @param {number} limit - Max posts to return
 * @returns {Promise<Array>} Array of featured posts
 */
export async function getEditorsPicks(limit = 6) {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return posts || []
  } catch (error) {
    console.error('Error fetching editor\'s picks:', error)
    return []
  }
}

/**
 * Get view statistics for a specific post
 * @param {string} postId - Post ID
 * @param {number} days - Number of days to look back
 * @returns {Promise<Object|null>} View statistics
 */
export async function getPostViewStats(postId, days = 30) {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString().split('T')[0]
    
    const { data: views, error } = await supabase
      .from('post_views')
      .select('view_date, view_count, session_id')
      .eq('post_id', postId)
      .gte('view_date', startDateStr)
      .order('view_date', { ascending: true })
    
    if (error) throw error
    
    const totalViews = views?.reduce((sum, v) => sum + (v.view_count || 1), 0) || 0
    const uniqueSessions = new Set(views?.map(v => v.session_id)).size
    
    return {
      post_id: postId,
      total_views: totalViews,
      unique_sessions: uniqueSessions,
      daily_views: views || [],
      days_tracked: days
    }
  } catch (error) {
    console.error('Error fetching post view stats:', error)
    return null
  }
}

/**
 * Batch track multiple post views (for list pages)
 * @param {Array<string>} postIds - Array of post IDs
 * @returns {Promise<void>}
 */
export async function batchTrackPostViews(postIds) {
  if (typeof window === 'undefined') return
  if (!postIds || postIds.length === 0) return
  
  const today = new Date().toISOString().split('T')[0]
  const sessionId = getVisitorSessionId()
  
  if (!sessionId) return
  
  const records = postIds.map(postId => ({
    post_id: postId,
    session_id: sessionId,
    view_date: today,
    view_count: 1
  }))
  
  try {
    const { error } = await supabase
      .from('post_views')
      .upsert(records, {
        onConflict: 'post_id,view_date,session_id'
      })
    
    if (error) throw error
  } catch (error) {
    console.error('Error batch tracking views:', error)
  }
}

export default {
  trackPostView,
  getPopularPosts,
  getTrendingPosts,
  getTodayPosts,
  getCategoryPosts,
  getEditorsPicks,
  getPostViewStats,
  batchTrackPostViews
}