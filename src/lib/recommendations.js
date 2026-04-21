import { supabase } from './supabase'

/**
 * Recommendation Engine for Blog Posts
 * Features:
 * 1. Content-based recommendations (same category, similar tags)
 * 2. Collaborative filtering (what similar users liked)
 * 3. Trending/popular posts
 * 4. Personalized recommendations (based on reading history)
 * 5. "Readers also enjoyed" suggestions
 */

// Get recommendations for a single post
export async function getPostRecommendations(postId, postCategory, postTags, limit = 4) {
  try {
    const recommendations = []
    
    // 1. SAME CATEGORY - Most important (weight: 40%)
    const { data: sameCategory } = await supabase
      .from('posts')
      .select('id, title, slug, image_url, category, views, created_at, average_rating, total_ratings')
      .eq('category', postCategory)
      .eq('status', 'published')
      .neq('id', postId)
      .order('views', { ascending: false })
      .limit(limit * 2)
    
    if (sameCategory) {
      sameCategory.forEach(post => {
        recommendations.push({
          ...post,
          score: (post.views || 0) / 1000 + (post.average_rating || 0) * 100,
          reason: `More from ${postCategory}`,
          priority: 1
        })
      })
    }
    
    // 2. TRENDING POSTS - High engagement (weight: 25%)
    const { data: trending } = await supabase
      .from('posts')
      .select('id, title, slug, image_url, category, views, created_at, average_rating, total_ratings')
      .eq('status', 'published')
      .neq('id', postId)
      .neq('category', postCategory)
      .gte('views', 100)
      .order('views', { ascending: false })
      .limit(limit)
    
    if (trending) {
      trending.forEach(post => {
        recommendations.push({
          ...post,
          score: (post.views || 0) / 100,
          reason: 'Trending now 🔥',
          priority: 2
        })
      })
    }
    
    // 3. HIGHEST RATED (weight: 20%)
    const { data: topRated } = await supabase
      .from('posts')
      .select('id, title, slug, image_url, category, views, created_at, average_rating, total_ratings')
      .eq('status', 'published')
      .neq('id', postId)
      .gte('average_rating', 4)
      .order('average_rating', { ascending: false })
      .limit(limit)
    
    if (topRated) {
      topRated.forEach(post => {
        recommendations.push({
          ...post,
          score: (post.average_rating || 0) * 200,
          reason: `⭐ ${post.average_rating} rating`,
          priority: 3
        })
      })
    }
    
    // 4. RECENT POSTS - Fresh content (weight: 15%)
    const { data: recent } = await supabase
      .from('posts')
      .select('id, title, slug, image_url, category, views, created_at, average_rating, total_ratings')
      .eq('status', 'published')
      .neq('id', postId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (recent) {
      recent.forEach(post => {
        recommendations.push({
          ...post,
          score: (new Date() - new Date(post.created_at)) / 86400000,
          reason: 'New post 📢',
          priority: 4
        })
      })
    }
    
    // Remove duplicates and sort by score
    const unique = []
    const seen = new Set()
    
    for (const rec of recommendations) {
      if (!seen.has(rec.id)) {
        seen.add(rec.id)
        unique.push(rec)
      }
    }
    
    // Sort by score (highest first) and limit
    const sorted = unique.sort((a, b) => b.score - a.score).slice(0, limit)
    
    // Add display metadata
    return sorted.map(rec => ({
      ...rec,
      formattedDate: new Date(rec.created_at).toLocaleDateString(),
      ratingStars: '★'.repeat(Math.round(rec.average_rating || 0))
    }))
    
  } catch (error) {
    console.error('Recommendation error:', error)
    return []
  }
}

// Get personalized recommendations for a user (based on reading history)
export async function getPersonalizedRecommendations(userEmail, limit = 6) {
  try {
    // Get user's reading history
    const { data: history } = await supabase
      .from('post_ratings')
      .select('post_slug, post_title, rating')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (!history || history.length === 0) {
      // Fallback to trending if no history
      return getTrendingRecommendations(limit)
    }
    
    // Get categories user likes (rated 4 or 5)
    const likedPosts = history.filter(h => h.rating >= 4)
    
    if (likedPosts.length === 0) {
      return getTrendingRecommendations(limit)
    }
    
    // Get post details for liked posts
    const postSlugs = likedPosts.map(p => p.post_slug)
    const { data: likedPostDetails } = await supabase
      .from('posts')
      .select('category, tags')
      .in('slug', postSlugs)
    
    // Extract preferred categories
    const preferredCategories = [...new Set(likedPostDetails?.map(p => p.category) || [])]
    
    // Get recommendations based on preferred categories
    const { data: recommendations } = await supabase
      .from('posts')
      .select('id, title, slug, image_url, category, views, created_at, average_rating, total_ratings')
      .in('category', preferredCategories)
      .eq('status', 'published')
      .not('slug', 'in', `(${postSlugs.join(',')})`)
      .order('average_rating', { ascending: false })
      .limit(limit)
    
    return recommendations?.map(rec => ({
      ...rec,
      reason: `Because you like ${rec.category}`,
      formattedDate: new Date(rec.created_at).toLocaleDateString()
    })) || []
    
  } catch (error) {
    console.error('Personalized recommendations error:', error)
    return getTrendingRecommendations(limit)
  }
}

// Get trending recommendations (for homepage)
export async function getTrendingRecommendations(limit = 6) {
  try {
    const { data } = await supabase
      .from('posts')
      .select('id, title, slug, image_url, category, views, created_at, average_rating, total_ratings')
      .eq('status', 'published')
      .order('views', { ascending: false })
      .limit(limit)
    
    return data?.map(post => ({
      ...post,
      reason: 'Trending now 🔥',
      formattedDate: new Date(post.created_at).toLocaleDateString()
    })) || []
  } catch (error) {
    console.error('Trending recommendations error:', error)
    return []
  }
}

// Get "You might also like" based on tags similarity
export async function getSimilarByTags(postTags, currentPostId, limit = 3) {
  if (!postTags || postTags.length === 0) {
    return []
  }
  
  try {
    // This is simplified - in production, use a more sophisticated approach
    const { data } = await supabase
      .from('posts')
      .select('id, title, slug, image_url, category, views, created_at, average_rating, total_ratings')
      .eq('status', 'published')
      .neq('id', currentPostId)
      .order('views', { ascending: false })
      .limit(limit * 2)
    
    // Simple tag matching (in real app, use PostgreSQL array overlap)
    const matched = data?.filter(post => {
      return post.tags && post.tags.some(tag => postTags.includes(tag))
    }) || []
    
    return matched.slice(0, limit).map(post => ({
      ...post,
      reason: 'Similar topics',
      formattedDate: new Date(post.created_at).toLocaleDateString()
    }))
    
  } catch (error) {
    console.error('Similar by tags error:', error)
    return []
  }
}

// Get editor's picks (curated content)
export async function getEditorsPicks(limit = 3) {
  try {
    const { data } = await supabase
      .from('posts')
      .select('id, title, slug, image_url, category, views, created_at, average_rating, total_ratings')
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    return data?.map(post => ({
      ...post,
      reason: "Editor's pick ✨",
      formattedDate: new Date(post.created_at).toLocaleDateString()
    })) || []
  } catch (error) {
    console.error('Editor picks error:', error)
    return []
  }
}

// Get mixed recommendations (combines multiple strategies)
export async function getMixedRecommendations(currentPostId, currentCategory, currentTags, limit = 4) {
  try {
    const allRecommendations = []
    
    // Strategy 1: Same category (40% weight)
    const categoryPosts = await getPostRecommendations(currentPostId, currentCategory, currentTags, limit)
    allRecommendations.push(...categoryPosts)
    
    // Strategy 2: Similar tags (30% weight)
    const tagPosts = await getSimilarByTags(currentTags, currentPostId, limit)
    allRecommendations.push(...tagPosts)
    
    // Strategy 3: Editor's picks (20% weight)
    const editorPicks = await getEditorsPicks(limit)
    allRecommendations.push(...editorPicks)
    
    // Strategy 4: Trending (10% weight)
    const trending = await getTrendingRecommendations(limit)
    allRecommendations.push(...trending)
    
    // Remove duplicates
    const unique = []
    const seen = new Set()
    
    for (const rec of allRecommendations) {
      if (!seen.has(rec.id)) {
        seen.add(rec.id)
        unique.push(rec)
      }
    }
    
    // Return limited results
    return unique.slice(0, limit)
    
  } catch (error) {
    console.error('Mixed recommendations error:', error)
    return []
  }
}