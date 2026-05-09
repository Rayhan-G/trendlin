// pages/api/live-posts/index.js
import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { limit = 50, sessionId } = req.query
    const now = new Date().toISOString()

    // Get active posts (not expired) - no auth needed for reading
    const { data: posts, error } = await supabase
      .from('live_posts')
      .select('*')
      .eq('status', 'active')
      .gte('expires_at', now)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit))

    if (error) throw error

    if (!posts || posts.length === 0) {
      return res.status(200).json({ success: true, posts: [] })
    }

    const postIds = posts.map(p => p.id)

    // Get reaction counts
    const { data: reactions, error: reactionsError } = await supabase
      .from('live_post_reactions')
      .select('post_id, reaction_type')
      .in('post_id', postIds)

    if (reactionsError) throw reactionsError

    // Calculate reaction counts
    const reactionCountsMap = {}
    reactions?.forEach(reaction => {
      if (!reactionCountsMap[reaction.post_id]) {
        reactionCountsMap[reaction.post_id] = {
          like: 0, love: 0, laugh: 0, wow: 0, sad: 0, angry: 0, total: 0
        }
      }
      reactionCountsMap[reaction.post_id][reaction.reaction_type]++
      reactionCountsMap[reaction.post_id].total++
    })

    // Get user's reactions if sessionId provided
    let userReactionMap = {}
    if (sessionId) {
      const { data: userReactions } = await supabase
        .from('live_post_reactions')
        .select('post_id, reaction_type')
        .in('post_id', postIds)
        .eq('session_id', sessionId)

      if (userReactions) {
        userReactions.forEach(reaction => {
          userReactionMap[reaction.post_id] = reaction.reaction_type
        })
      }
    }

    // Format response
    const formattedPosts = posts.map(post => {
      const hoursRemaining = Math.max(0, (new Date(post.expires_at) - new Date()) / (1000 * 60 * 60))
      
      return {
        id: post.id,
        title: post.title,
        description: post.description,
        content: post.content,
        author: {
          name: post.author_name,
          handle: post.author_handle,
          avatar: post.author_avatar
        },
        created_at: post.created_at,
        expires_at: post.expires_at,
        hoursRemaining: Math.floor(hoursRemaining),
        share_count: post.share_count,
        view_count: post.view_count,
        media_items: post.media_items || [],
        sources: post.sources || [],
        category: post.category,
        reactions: reactionCountsMap[post.id] || {
          like: 0, love: 0, laugh: 0, wow: 0, sad: 0, angry: 0, total: 0
        },
        userReaction: userReactionMap[post.id] || null
      }
    })

    res.status(200).json({ success: true, posts: formattedPosts })

  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}