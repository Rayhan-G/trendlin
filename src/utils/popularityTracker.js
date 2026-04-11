import { supabase } from '@/lib/supabase'
import blogData from '@/data/blog-posts.json'

// Track real post view in Supabase
export async function trackPostView(postId) {
  if (typeof window === 'undefined') return
  
  const sessionKey = `viewed_${postId}_${new Date().toISOString().split('T')[0]}`
  if (sessionStorage.getItem(sessionKey)) return
  
  sessionStorage.setItem(sessionKey, 'true')
  
  const sessionId = localStorage.getItem('visitor_session_id')
  if (!sessionId) {
    localStorage.setItem('visitor_session_id', `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
  }
  
  try {
    await supabase.from('post_views').upsert({
      post_id: postId,
      session_id: localStorage.getItem('visitor_session_id'),
      views: 1
    }, { onConflict: 'post_id,view_date,session_id' })
  } catch (error) {
    console.error('Error tracking view:', error)
  }
}

// Get real popular posts from Supabase
export async function getPopularPosts(limit = 30) {
  try {
    // Get current month's real view counts from Supabase
    const { data: viewData, error } = await supabase
      .rpc('get_current_month_popular', { limit_count: limit })
    
    if (error) throw error
    
    const posts = blogData.posts || []
    
    // Merge real view counts with post content
    const popularPosts = viewData?.map(view => {
      const post = posts.find(p => p.id === view.id)
      return post ? { 
        ...post, 
        monthly_views: view.monthly_views,
        rank: view.rank
      } : null
    }).filter(p => p !== null) || []
    
    return popularPosts
  } catch (error) {
    console.error('Error fetching popular posts:', error)
    // Return posts without view counts if Supabase fails
    return blogData.posts?.slice(0, limit) || []
  }
}

// Get today's posts (last 2 days)
export function getTodayPosts() {
  const posts = blogData.posts || []
  
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
  
  return posts.filter(post => 
    post.date === todayStr || post.date === yesterdayStr
  )
}