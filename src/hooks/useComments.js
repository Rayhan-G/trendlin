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

  // Load cached pending comments from localStorage
  useEffect(() => {
    try {
      const cached = localStorage.getItem(`${STORAGE_KEY}_${postId}`)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) {
          pendingQueueRef.current = parsed
          setPendingComments(parsed)
          // Merge with existing comments
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

    if (error) {
      console.error('Load comments error:', error)
      setLoading(false)
      return
    }

    setHasMore(data.length === 20)
    setPage(prev => prev + 1)
    
    // Merge with pending comments
    const pending = pendingQueueRef.current
    const allComments = reset 
      ? [...pending, ...(data || [])]
      : [...pending, ...comments, ...(data || [])]
    
    // Remove duplicates by id
    const uniqueComments = Array.from(new Map(allComments.map(c => [c.id, c])).values())
    
    if (reset) {
      setComments(uniqueComments)
    } else {
      setComments(prev => [...prev, ...data])
    }
    
    setLoading(false)
    return data
  }, [postId, page, comments])

  // Save pending comments to localStorage
  const persistPendingComments = useCallback((comments) => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_${postId}`, JSON.stringify(comments))
    } catch (err) {
      console.error('Failed to persist comments:', err)
    }
  }, [postId])

  // Add comment with optimistic update
  const addComment = useCallback(async (content, userName, userEmail = null, parentId = null) => {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    
    const optimisticComment = {
      id: tempId,
      live_post_id: postId,
      user_id: sessionId,
      user_name: userName,
      user_email: userEmail,
      content,
      parent_id: parentId,
      likes: 0,
      liked_by: [],
      is_edited: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_synced: false,
      admin_reply: null,
      admin_replied_at: null,
      admin_name: null,
      status: 'approved'
    }

    // Optimistic update
    setComments(prev => [optimisticComment, ...prev])
    pendingQueueRef.current.unshift(optimisticComment)
    persistPendingComments(pendingQueueRef.current)
    setPendingComments([...pendingQueueRef.current])

    try {
      const { data, error } = await supabase
        .from('live_post_comments')
        .insert([{
          live_post_id: postId,
          user_id: sessionId,
          user_name: userName,
          user_email: userEmail,
          content,
          parent_id: parentId,
          created_at: new Date().toISOString(),
          status: 'approved'
        }])
        .select()
        .single()

      if (error) throw error

      // Replace optimistic with real comment
      setComments(prev => prev.map(c => c.id === tempId ? { ...data, is_synced: true } : c))
      pendingQueueRef.current = pendingQueueRef.current.filter(c => c.id !== tempId)
      persistPendingComments(pendingQueueRef.current)
      setPendingComments([...pendingQueueRef.current])
      
      return data
    } catch (err) {
      console.error('Add comment error:', err)
      // Keep the comment in pending queue - will retry on next sync
      return null
    }
  }, [postId, sessionId, persistPendingComments])

  // Edit comment
  const editComment = useCallback(async (commentId, newContent) => {
    const originalComment = comments.find(c => c.id === commentId)
    if (!originalComment) return

    // Optimistic update
    setComments(prev => prev.map(c => 
      c.id === commentId 
        ? { ...c, content: newContent, is_edited: true, updated_at: new Date().toISOString() }
        : c
    ))

    // Check if it's a pending comment
    const isPending = pendingQueueRef.current.some(c => c.id === commentId)
    if (isPending) {
      // Update in pending queue
      pendingQueueRef.current = pendingQueueRef.current.map(c => 
        c.id === commentId ? { ...c, content: newContent, is_edited: true } : c
      )
      persistPendingComments(pendingQueueRef.current)
      setPendingComments([...pendingQueueRef.current])
      return
    }

    // Update in database
    try {
      const { error } = await supabase
        .from('live_post_comments')
        .update({ 
          content: newContent, 
          is_edited: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', commentId)
        .eq('user_id', sessionId)

      if (error) throw error
    } catch (err) {
      console.error('Edit error:', err)
      // Revert optimistic update
      setComments(prev => prev.map(c => c.id === commentId ? originalComment : c))
    }
  }, [comments, sessionId, persistPendingComments])

  // Delete comment
  const deleteComment = useCallback(async (commentId) => {
    const commentToDelete = comments.find(c => c.id === commentId)
    if (!commentToDelete) return

    // Confirm deletion
    if (!confirm('Are you sure you want to delete this comment?')) return

    // Optimistic update
    setComments(prev => prev.filter(c => c.id !== commentId))
    
    // Remove from pending queue if exists
    if (pendingQueueRef.current.some(c => c.id === commentId)) {
      pendingQueueRef.current = pendingQueueRef.current.filter(c => c.id !== commentId)
      persistPendingComments(pendingQueueRef.current)
      setPendingComments([...pendingQueueRef.current])
      return
    }

    // Soft delete in database
    try {
      const { error } = await supabase
        .from('live_post_comments')
        .update({ 
          is_deleted: true, 
          content: '[deleted]',
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('user_id', sessionId)

      if (error) throw error
    } catch (err) {
      console.error('Delete error:', err)
      // Revert optimistic update
      setComments(prev => [commentToDelete, ...prev])
    }
  }, [comments, sessionId, persistPendingComments])

  // Like/unlike comment
  const likeComment = useCallback(async (commentId) => {
    const comment = comments.find(c => c.id === commentId)
    if (!comment) return
    
    const hasLiked = comment.liked_by?.includes(sessionId)
    
    // Optimistic update
    setComments(prev => prev.map(c => {
      if (c.id !== commentId) return c
      const newLikedBy = hasLiked 
        ? c.liked_by.filter(id => id !== sessionId)
        : [...(c.liked_by || []), sessionId]
      return {
        ...c,
        likes: hasLiked ? Math.max(0, (c.likes || 1) - 1) : (c.likes || 0) + 1,
        liked_by: newLikedBy
      }
    }))

    try {
      const { error } = await supabase
        .from('live_post_comments')
        .update({ 
          likes: hasLiked ? Math.max(0, (comment.likes || 1) - 1) : (comment.likes || 0) + 1,
          liked_by: hasLiked 
            ? comment.liked_by?.filter(id => id !== sessionId) || []
            : [...(comment.liked_by || []), sessionId]
        })
        .eq('id', commentId)

      if (error) throw error
    } catch (err) {
      console.error('Like error:', err)
      // Revert optimistic update
      setComments(prev => prev.map(c => c.id === commentId ? comment : c))
    }
  }, [comments, sessionId])

  // Sync all pending comments
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
            user_id: comment.user_id,
            user_name: comment.user_name,
            user_email: comment.user_email,
            content: comment.content,
            parent_id: comment.parent_id,
            created_at: comment.created_at,
            status: 'approved'
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
        setSyncError('Failed to sync some comments')
      }
    }
    
    setIsSyncing(false)
  }, [isSyncing, persistPendingComments])

  // Load more comments
  const loadMore = useCallback(() => {
    loadComments(false)
  }, [loadComments])

  // Auto-sync every 10 minutes
  useEffect(() => {
    syncIntervalRef.current = setInterval(() => {
      if (pendingQueueRef.current.length > 0 && !isSyncing) {
        syncAllComments()
      }
    }, SYNC_INTERVAL)

    const handleBeforeUnload = () => {
      if (pendingQueueRef.current.length > 0) {
        persistPendingComments(pendingQueueRef.current)
      }
    }
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && pendingQueueRef.current.length > 0) {
        persistPendingComments(pendingQueueRef.current)
        syncAllComments()
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(syncIntervalRef.current)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      
      if (pendingQueueRef.current.length > 0) {
        persistPendingComments(pendingQueueRef.current)
      }
    }
  }, [syncAllComments, isSyncing, persistPendingComments])

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
    loadMore,
    addComment,
    editComment,
    deleteComment,
    likeComment,
    syncAllComments
  }
}