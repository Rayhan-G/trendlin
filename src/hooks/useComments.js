// hooks/useComments.js
import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

const SYNC_INTERVAL = 600000 // 10 minutes
const STORAGE_KEY = 'pending_comments_cache'

export function useComments(postId, sessionId) {
  const [comments, setComments] = useState([])
  const [pendingComments, setPendingComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState(null)
  const syncIntervalRef = useRef(null)
  const pendingQueueRef = useRef([])

  // Load cached pending comments
  useEffect(() => {
    try {
      const cached = localStorage.getItem(`${STORAGE_KEY}_${postId}`)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) {
          pendingQueueRef.current = parsed
          setPendingComments(parsed)
          setComments(prev => [...parsed.filter(c => !prev.find(p => p.id === c.id)), ...prev])
        }
      }
    } catch (err) {
      console.error('Failed to load cached comments:', err)
    }
  }, [postId])

  // Load comments from database
  const loadComments = useCallback(async (reset = true) => {
    if (reset) {
      setPage(0)
      setComments([])
      setLoading(true)
    }

    const from = reset ? 0 : page * 20
    const to = from + 19

    const { data, error } = await supabase
      .from('live_post_comments')
      .select('*')
      .eq('live_post_id', postId)
      .is('parent_id', null)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    setHasMore(data.length === 20)
    setPage(prev => prev + 1)
    
    if (reset) {
      setComments([...pendingQueueRef.current, ...(data || [])])
    } else {
      setComments(prev => [...prev, ...(data || [])])
    }
    
    setLoading(false)
    return data
  }, [postId, page])

  // Add comment
  const addComment = useCallback(async (content, userName, userEmail = null, parentId = null) => {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    
    const optimisticComment = {
      id: tempId,
      live_post_id: postId,
      user_name: userName,
      user_email: userEmail,
      content,
      parent_id: parentId,
      likes: 0,
      liked_by: [],
      is_edited: false,
      created_at: new Date().toISOString(),
      is_synced: false
    }

    setComments(prev => [optimisticComment, ...prev])
    pendingQueueRef.current.unshift(optimisticComment)
    persistPendingComments(pendingQueueRef.current)
    setPendingComments([...pendingQueueRef.current])

    try {
      const { data, error } = await supabase
        .from('live_post_comments')
        .insert([{
          live_post_id: postId,
          user_name: userName,
          user_email: userEmail,
          content,
          parent_id: parentId,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      setComments(prev => prev.map(c => c.id === tempId ? { ...data, is_synced: true } : c))
      pendingQueueRef.current = pendingQueueRef.current.filter(c => c.id !== tempId)
      persistPendingComments(pendingQueueRef.current)
      setPendingComments([...pendingQueueRef.current])
      
      return data
    } catch (err) {
      console.error('Add comment error:', err)
      return null
    }
  }, [postId])

  // DELETE COMMENT - Complete function
  const deleteComment = useCallback(async (commentId) => {
    // Find comment
    const commentToDelete = comments.find(c => c.id === commentId)
    if (!commentToDelete) return

    // Optimistic update
    setComments(prev => prev.filter(c => c.id !== commentId))
    
    // Remove from pending queue if exists
    if (pendingQueueRef.current.some(c => c.id === commentId)) {
      pendingQueueRef.current = pendingQueueRef.current.filter(c => c.id !== commentId)
      persistPendingComments(pendingQueueRef.current)
      setPendingComments([...pendingQueueRef.current])
      return
    }

    // Delete from database
    try {
      const { error } = await supabase
        .from('live_post_comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error
    } catch (err) {
      console.error('Delete error:', err)
      // Revert on error
      setComments(prev => [commentToDelete, ...prev])
    }
  }, [comments])

  // EDIT COMMENT
  const editComment = useCallback(async (commentId, newContent) => {
    const originalComment = comments.find(c => c.id === commentId)
    if (!originalComment) return

    setComments(prev => prev.map(c => 
      c.id === commentId 
        ? { ...c, content: newContent, is_edited: true, edited_at: new Date().toISOString() }
        : c
    ))

    try {
      const { error } = await supabase
        .from('live_post_comments')
        .update({ 
          content: newContent, 
          is_edited: true, 
          edited_at: new Date().toISOString() 
        })
        .eq('id', commentId)

      if (error) throw error
    } catch (err) {
      console.error('Edit error:', err)
      setComments(prev => prev.map(c => c.id === commentId ? originalComment : c))
    }
  }, [comments])

  // LIKE COMMENT
  const likeComment = useCallback(async (commentId) => {
    const comment = comments.find(c => c.id === commentId)
    if (!comment) return
    
    const hasLiked = comment.liked_by?.includes(sessionId)
    
    setComments(prev => prev.map(c => {
      if (c.id !== commentId) return c
      const newLikedBy = hasLiked 
        ? c.liked_by.filter(id => id !== sessionId)
        : [...(c.liked_by || []), sessionId]
      return {
        ...c,
        likes: hasLiked ? (c.likes || 1) - 1 : (c.likes || 0) + 1,
        liked_by: newLikedBy
      }
    }))

    try {
      await supabase
        .from('live_post_comments')
        .update({ 
          likes: comment.likes + (hasLiked ? -1 : 1),
          liked_by: hasLiked 
            ? comment.liked_by?.filter(id => id !== sessionId) || []
            : [...(comment.liked_by || []), sessionId]
        })
        .eq('id', commentId)
    } catch (err) {
      console.error('Like error:', err)
    }
  }, [comments, sessionId])

  const persistPendingComments = (comments) => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_${postId}`, JSON.stringify(comments))
    } catch (err) {
      console.error('Failed to persist comments:', err)
    }
  }

  const syncAllComments = useCallback(async () => {
    if (pendingQueueRef.current.length === 0 || isSyncing) return

    setIsSyncing(true)
    setSyncError(null)
    
    const toSync = [...pendingQueueRef.current]
    
    for (const comment of toSync) {
      try {
        const { data, error } = await supabase
          .from('live_post_comments')
          .insert([{
            live_post_id: comment.live_post_id,
            user_name: comment.user_name,
            user_email: comment.user_email,
            content: comment.content,
            parent_id: comment.parent_id,
            created_at: comment.created_at
          }])
          .select()
          .single()

        if (error) throw error

        setComments(prev => prev.map(c => c.id === comment.id ? { ...data, is_synced: true } : c))
        pendingQueueRef.current = pendingQueueRef.current.filter(c => c.id !== comment.id)
        persistPendingComments(pendingQueueRef.current)
        setPendingComments([...pendingQueueRef.current])
      } catch (err) {
        console.error('Sync error:', err)
        setSyncError('Failed to sync comments')
      }
    }
    
    setIsSyncing(false)
  }, [isSyncing])

  // Auto-sync every 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingQueueRef.current.length > 0 && !isSyncing) {
        syncAllComments()
      }
    }, SYNC_INTERVAL)

    const handleBeforeUnload = () => {
      if (pendingQueueRef.current.length > 0) {
        persistPendingComments(pendingQueueRef.current)
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [syncAllComments, isSyncing])

  // Initial load
  useEffect(() => {
    loadComments()
  }, [])

  return {
    comments,
    pendingComments,
    loading,
    hasMore,
    isSyncing,
    syncError,
    loadMore: () => loadComments(false),
    addComment,
    editComment,
    deleteComment,
    likeComment,
    syncAllComments
  }
}