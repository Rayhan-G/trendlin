import { supabase } from './supabase'

// Get stats for a specific category (ONLY verified subscribers)
export async function getCategoryStats(category) {
  try {
    // Try to get from category_stats_table first
    let { data, error } = await supabase
      .from('category_stats_table')
      .select('total_posts, total_subscribers, average_rating, total_ratings')
      .eq('category', category)
      .single()

    if (error) {
      // Fallback: Calculate manually from posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('average_rating, total_ratings')
        .eq('category', category)
        .eq('status', 'published')

      if (postsError) throw postsError

      if (posts && posts.length > 0) {
        let totalWeightedRating = 0
        let totalRatingsCount = 0
        
        posts.forEach(post => {
          if (post.total_ratings && post.total_ratings > 0) {
            totalWeightedRating += (post.average_rating || 0) * post.total_ratings
            totalRatingsCount += post.total_ratings
          }
        })
        
        const averageRating = totalRatingsCount > 0 ? totalWeightedRating / totalRatingsCount : 0

        // Get ONLY verified subscribers
        const { count: subscribersCount } = await supabase
          .from('newsletter_subscribers')
          .select('*', { count: 'exact', head: true })
          .contains('categories', [category])
          .not('verified_at', 'is', null)  // Only verified
          .is('unsubscribed_at', null)      // Not unsubscribed

        return {
          totalPosts: posts.length,
          totalSubscribers: subscribersCount || 0,
          averageRating: parseFloat(averageRating.toFixed(1)),
          totalRatings: totalRatingsCount
        }
      }
    }

    return {
      totalPosts: data?.total_posts || 0,
      totalSubscribers: data?.total_subscribers || 0,
      averageRating: data?.average_rating || 0,
      totalRatings: data?.total_ratings || 0
    }
  } catch (error) {
    console.error(`Error fetching stats for ${category}:`, error)
    return {
      totalPosts: 0,
      totalSubscribers: 0,
      averageRating: 0,
      totalRatings: 0
    }
  }
}

// Get total stats for home page (ONLY verified subscribers)
export async function getTotalStats() {
  try {
    const { data, error } = await supabase
      .from('category_stats_table')
      .select('total_posts, total_subscribers, average_rating, total_ratings')

    if (error) {
      return {
        totalPosts: 0,
        totalSubscribers: 0,
        averageRating: 0,
        totalRatings: 0
      }
    }

    const totalPosts = data.reduce((sum, cat) => sum + (cat.total_posts || 0), 0)
    const totalSubscribers = data.reduce((sum, cat) => sum + (cat.total_subscribers || 0), 0)
    const totalRatings = data.reduce((sum, cat) => sum + (cat.total_ratings || 0), 0)
    
    let weightedRatingSum = 0
    data.forEach(cat => {
      if (cat.average_rating > 0 && cat.total_ratings > 0) {
        weightedRatingSum += cat.average_rating * cat.total_ratings
      }
    })
    
    const averageRating = totalRatings > 0 ? weightedRatingSum / totalRatings : 0

    return {
      totalPosts: totalPosts,
      totalSubscribers: totalSubscribers,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalRatings: totalRatings
    }
  } catch (error) {
    return {
      totalPosts: 0,
      totalSubscribers: 0,
      averageRating: 0,
      totalRatings: 0
    }
  }
}