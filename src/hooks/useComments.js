// hooks/useComments.js
import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

const SYNC_INTERVAL = 600000 // 10 minutes in milliseconds
const STORAGE_KEY = 'pending_comments_cache'
const SYNC_RETRY_DELAY = 5000 // 5 seconds retry delay
const MAX_SYNC_RETRIES = 3

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
  const retryQueueRef = useRef([])
  const isMountedRef = useRef(true)

  // Load cached pending comments from localStorage on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(`${STORAGE_KEY}_${postId}`)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) {
          pendingQueueRef.current = parsed
          setPendingComments(parsed)
          
          // Merge cached comments into UI
          setComments(prev => [...parsed.filter(c => !prev.find(p => p.id === c.id)), ...prev])
        }
      }
    } catch (err) {
      console.error('Failed to load cached comments:', err)
    }
    
    return () => {
      isMountedRef.current = false
    }
  }, [postId])

  // Save pending comments to localStorage whenever they change
  const persistPendingComments = useCallback((comments) => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_${postId}`, JSON.stringify(comments))
    } catch (err) {
      console.error('Failed to persist comments:', err)
    }
  }, [postId])

  // Load initial comments with caching
  const loadComments = useCallback(async (reset = true) => {
    if (reset) {
      setPage(0)
      setComments([])
      setLoading(true)
    }

    const currentPage = reset ? 0 : page
    const from = currentPage * 30
    const to = from + 29

    // Try cache first
    const cacheKey = `comments_${postId}_page_${currentPage}`
    const cached = sessionStorage.getItem(cacheKey)
    
    if (reset && cached) {
      try {
        const parsed = JSON.parse(cached)
        setComments(parsed)
        setLoading(false)
      } catch (err) {
        console.error('Cache parse error:', err)
      }
    }

    const { data, error, count } = await supabase
      .from('live_post_comments')
      .select('*', { count: 'exact' })
      .eq('live_post_id', postId)
      .is('parent_id', null)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    // Cache the results
    if (reset) {
      sessionStorage.setItem(cacheKey, JSON.stringify(data))
    }

    setHasMore(data.length === 30)
    setPage(currentPage + 1)
    
    if (reset) {
      // Merge with pending comments
      const allComments = [...pendingQueueRef.current, ...(data || [])]
      setComments(allComments)
    } else {
      setComments(prev => [...prev, ...(data || [])])
    }
    
    return data
  }, [postId, page, pendingQueueRef])

  // Add comment with persistent queue and retry
  const addComment = useCallback(async (content, userName, userEmail = null, parentId = null) => {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const optimisticComment = {
      id: tempId,
      temp_id: tempId,
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
      is_synced: false,
      sync_attempts: 0,
      status: 'pending_sync'
    }

    // Add to UI immediately
    setComments(prev => [optimisticComment, ...prev])
    
    // Add to persistent queue
    pendingQueueRef.current.unshift(optimisticComment)
    persistPendingComments(pendingQueueRef.current)
    setPendingComments([...pendingQueueRef.current])

    // Try immediate sync (will fail but queue will retry)
    attemptSyncComment(optimisticComment)

    return optimisticComment
  }, [postId, sessionId, persistPendingComments])

  // Individual comment sync with retry logic
  const attemptSyncComment = useCallback(async (comment, retryCount = 0) => {
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
          created_at: comment.created_at
        }])
        .select()
        .single()

      if (error) throw error

      if (isMountedRef.current) {
        // Update comment with real ID
        setComments(prev => prev.map(c => 
          c.id === comment.id ? { ...data, is_synced: true } : c
        ))
        
        // Remove from pending queue
        pendingQueueRef.current = pendingQueueRef.current.filter(c => c.id !== comment.id)
        persistPendingComments(pendingQueueRef.current)
        setPendingComments([...pendingQueueRef.current])
      }
      
      return { success: true, data }
      
    } catch (error) {
      console.error(`Sync attempt ${retryCount + 1} failed:`, error)
      
      if (retryCount < MAX_SYNC_RETRIES) {
        // Schedule retry with exponential backoff
        setTimeout(() => {
          if (isMountedRef.current) {
            attemptSyncComment(comment, retryCount + 1)
          }
        }, SYNC_RETRY_DELAY * Math.pow(2, retryCount))
      } else {
        // Mark as failed but keep in queue
        setSyncError(`Failed to sync comment after ${MAX_SYNC_RETRIES} attempts`)
        setTimeout(() => setSyncError(null), 5000)
      }
      
      return { success: false, error }
    }
  }, [persistPendingComments])

  // Sync all pending comments in batch
  const syncAllComments = useCallback(async () => {
    if (pendingQueueRef.current.length === 0 || isSyncing) return

    setIsSyncing(true)
    setSyncError(null)
    
    const toSync = [...pendingQueueRef.current]
    const results = []
    
    for (const comment of toSync) {
      const result = await attemptSyncComment(comment)
      results.push(result)
    }
    
    setIsSyncing(false)
    return results
  }, [isSyncing, attemptSyncComment])

  // Edit comment with optimistic update
  const editComment = useCallback(async (commentId, newContent) => {
    // Optimistic update
    setComments(prev => prev.map(c => 
      c.id === commentId 
        ? { ...c, content: newContent, is_edited: true, edited_at: new Date().toISOString() }
        : c
    ))

    // If it's a pending comment, update in queue
    const pendingIndex = pendingQueueRef.current.findIndex(c => c.id === commentId)
    if (pendingIndex !== -1) {
      pendingQueueRef.current[pendingIndex].content = newContent
      pendingQueueRef.current[pendingIndex].is_edited = true
      persistPendingComments(pendingQueueRef.current)
      setPendingComments([...pendingQueueRef.current])
      return
    }

    // Otherwise update in database
    try {
      await supabase
        .from('live_post_comments')
        .update({ 
          content: newContent, 
          is_edited: true, 
          edited_at: new Date().toISOString() 
        })
        .eq('id', commentId)
        .eq('user_id', sessionId)
    } catch (err) {
      console.error('Edit failed:', err)
      setSyncError('Failed to edit comment')
      setTimeout(() => setSyncError(null), 3000)
    }
  }, [sessionId, persistPendingComments])

  // Delete comment with optimistic update
  const deleteComment = useCallback(async (commentId) => {
    // Optimistic update
    setComments(prev => prev.filter(c => c.id !== commentId))
    
    // Remove from pending queue if exists
    const wasPending = pendingQueueRef.current.some(c => c.id === commentId)
    if (wasPending) {
      pendingQueueRef.current = pendingQueueRef.current.filter(c => c.id !== commentId)
      persistPendingComments(pendingQueueRef.current)
      setPendingComments([...pendingQueueRef.current])
      return
    }

    // Otherwise delete from database
    try {
      await supabase
        .from('live_post_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', sessionId)
    } catch (err) {
      console.error('Delete failed:', err)
      setSyncError('Failed to delete comment')
      setTimeout(() => setSyncError(null), 3000)
    }
  }, [sessionId, persistPendingComments])

  // Like comment with optimistic update
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
        likes: hasLiked ? (c.likes || 1) - 1 : (c.likes || 0) + 1,
        liked_by: newLikedBy
      }
    }))

    // Don't sync likes for pending comments
    if (comment.is_synced === false) return

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
      console.error('Like failed:', err)
      // Revert optimistic update on error
      setComments(prev => prev.map(c => {
        if (c.id !== commentId) return c
        return {
          ...c,
          likes: comment.likes,
          liked_by: comment.liked_by
        }
      }))
    }
  }, [comments, sessionId])

  // Auto-sync every 10 minutes
  useEffect(() => {
    // Initial sync of any cached comments
    if (pendingQueueRef.current.length > 0) {
      syncAllComments()
    }

    // Set up periodic sync
    syncIntervalRef.current = setInterval(() => {
      if (pendingQueueRef.current.length > 0 && !isSyncing) {
        syncAllComments()
      }
    }, SYNC_INTERVAL)

    // Sync before page unload or visibility change
    const handleBeforeUnload = () => {
      if (pendingQueueRef.current.length > 0) {
        // Synchronous storage is all we can do on unload
        persistPendingComments(pendingQueueRef.current)
      }
    }
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && pendingQueueRef.current.length > 0) {
        persistPendingComments(pendingQueueRef.current)
        // Try sync but don't wait for result
        syncAllComments()
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(syncIntervalRef.current)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      
      // Final persist on unmount
      if (pendingQueueRef.current.length > 0) {
        persistPendingComments(pendingQueueRef.current)
      }
    }
  }, [syncAllComments, isSyncing, persistPendingComments])

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