import { supabase } from '../lib/supabase'

export const commentService = {
  // Get top-level comments with pagination
  async getComments(postId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit
      
      const { data: comments, error, count } = await supabase
        .from('comments')
        .select('*', { count: 'exact' })
        .eq('post_id', Number(postId))
        .is('parent_id', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      
      if (error) throw error
      
      // Get reply counts for each comment
      const commentsWithReplyCounts = await Promise.all(
        (comments || []).map(async (comment) => {
          const { count: replyCount } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('parent_id', comment.id)
          
          return {
            ...comment,
            reply_count: replyCount || 0
          }
        })
      )
      
      return {
        comments: commentsWithReplyCounts,
        total: count || 0,
        hasMore: (comments?.length || 0) === limit
      }
    } catch (error) {
      console.error('Error getting comments:', error)
      return { comments: [], total: 0, hasMore: false }
    }
  },

  // Get replies for a specific comment
  async getCommentReplies(commentId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit
      
      const { data: replies, error, count } = await supabase
        .from('comments')
        .select('*', { count: 'exact' })
        .eq('parent_id', Number(commentId))
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1)
      
      if (error) throw error
      
      return {
        replies: replies || [],
        total: count || 0,
        hasMore: (replies?.length || 0) === limit
      }
    } catch (error) {
      console.error('Error getting replies:', error)
      return { replies: [], total: 0, hasMore: false }
    }
  },

  // Create a new comment
  async createComment(postId, content, user, parentId = null) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: Number(postId),
          content: content.trim(),
          user_id: user.id,
          user_name: user.name || user.email?.split('@')[0] || 'Anonymous',
          user_email: user.email,
          parent_id: parentId ? Number(parentId) : null
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating comment:', error)
      throw error
    }
  },

  // Update a comment
  async updateComment(commentId, content) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .update({ 
          content: content.trim(), 
          updated_at: new Date().toISOString(),
          is_edited: true
        })
        .eq('id', Number(commentId))
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating comment:', error)
      throw error
    }
  },

  // Delete a comment
  async deleteComment(commentId) {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', Number(commentId))
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting comment:', error)
      throw error
    }
  },

  // Toggle like on a comment
  async toggleLike(commentId, userId) {
    try {
      const { data: existing } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', Number(commentId))
        .eq('user_id', userId)
        .maybeSingle()
      
      if (existing) {
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', Number(commentId))
          .eq('user_id', userId)
        
        if (error) throw error
        await supabase.rpc('decrement_comment_likes', { comment_id: Number(commentId) })
        return { liked: false }
      } else {
        const { error } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: Number(commentId),
            user_id: userId
          })
        
        if (error) throw error
        await supabase.rpc('increment_comment_likes', { comment_id: Number(commentId) })
        return { liked: true }
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      throw error
    }
  },

  // Subscribe to real-time changes
  subscribeToComments(postId, callback) {
    return supabase
      .channel(`comments:${postId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `post_id=eq.${postId}`
      }, (payload) => {
        callback(payload)
      })
      .subscribe()
  }
}