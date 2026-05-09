// pages/api/live-posts/[id]/react.js
import { supabase } from '../../../../lib/supabase'

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { id } = req.query
    const { reactionType, sessionId } = req.body

    // Validate sessionId (always required)
    if (!sessionId) {
      return res.status(400).json({ 
        error: 'sessionId is required' 
      })
    }

    // Check if post exists and is still active
    const { data: post, error: postError } = await supabase
      .from('live_posts')
      .select('id, status, expires_at')
      .eq('id', id)
      .single()

    if (postError || !post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    if (post.status !== 'active' || new Date(post.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Post is no longer active' })
    }

    // Handle reaction removal (when reactionType is null or undefined)
    if (!reactionType || reactionType === null) {
      // Delete the user's reaction
      const { error: deleteError } = await supabase
        .from('live_post_reactions')
        .delete()
        .eq('post_id', id)
        .eq('session_id', sessionId)

      if (deleteError && deleteError.code !== 'PGRST116') {
        throw deleteError
      }

      // Get updated reaction counts
      const { data: reactions, error: countsError } = await supabase
        .from('live_post_reactions')
        .select('reaction_type')
        .eq('post_id', id)

      if (countsError) throw countsError

      const counts = calculateReactionCounts(reactions)

      return res.status(200).json({
        success: true,
        action: 'removed',
        userReaction: null,
        reactions: counts
      })
    }

    // Validate reaction type for add/update
    const validReactions = ['like', 'love', 'laugh', 'wow', 'sad', 'angry']
    if (!validReactions.includes(reactionType)) {
      return res.status(400).json({ error: 'Invalid reaction type' })
    }

    // Check if user already reacted
    const { data: existingReaction, error: checkError } = await supabase
      .from('live_post_reactions')
      .select('id, reaction_type')
      .eq('post_id', id)
      .eq('session_id', sessionId)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    if (existingReaction) {
      if (existingReaction.reaction_type === reactionType) {
        // Remove reaction if same type (toggle off)
        const { error: deleteError } = await supabase
          .from('live_post_reactions')
          .delete()
          .eq('id', existingReaction.id)

        if (deleteError) throw deleteError
        
        const { data: reactions, error: countsError } = await supabase
          .from('live_post_reactions')
          .select('reaction_type')
          .eq('post_id', id)

        if (countsError) throw countsError

        const counts = calculateReactionCounts(reactions)

        return res.status(200).json({
          success: true,
          action: 'removed',
          userReaction: null,
          reactions: counts
        })
      } else {
        // Update to new reaction type
        const { error: updateError } = await supabase
          .from('live_post_reactions')
          .update({ 
            reaction_type: reactionType, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', existingReaction.id)

        if (updateError) throw updateError
      }
    } else {
      // Create new reaction
      const { error: insertError } = await supabase
        .from('live_post_reactions')
        .insert({
          post_id: id,
          session_id: sessionId,
          reaction_type: reactionType,
          created_at: new Date().toISOString()
        })

      if (insertError) throw insertError
    }

    // Get updated reaction counts
    const { data: reactions, error: countsError } = await supabase
      .from('live_post_reactions')
      .select('reaction_type')
      .eq('post_id', id)

    if (countsError) throw countsError

    const counts = calculateReactionCounts(reactions)

    res.status(200).json({
      success: true,
      action: existingReaction ? 'updated' : 'added',
      userReaction: reactionType,
      reactions: counts
    })

  } catch (error) {
    console.error('Reaction error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error'
    })
  }
}

function calculateReactionCounts(reactions) {
  const counts = {
    like: 0, love: 0, laugh: 0, wow: 0, sad: 0, angry: 0, total: 0
  }
  
  reactions?.forEach(r => {
    if (counts[r.reaction_type] !== undefined) {
      counts[r.reaction_type]++
      counts.total++
    }
  })
  
  return counts
}