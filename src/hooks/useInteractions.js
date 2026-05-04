// hooks/useInteractions.js
import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

const SYNC_INTERVAL = 600000 // 10 minutes
const STORAGE_KEY = 'pending_interactions'

export function useInteractions(postId, sessionId) {
  const [likes, setLikes] = useState(0)
  const [shares, setShares] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)
  const [pendingLike, setPendingLike] = useState(null)
  const [pendingShare, setPendingShare] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState(null)
  const syncIntervalRef = useRef(null)
  const pendingQueueRef = useRef({ likes: [], shares: [] })

  // Load initial data from post
  const loadInitialData = useCallback(async () => {
    const { data, error } = await supabase
      .from('live_posts')
      .select('likes, shares, liked_by')
      .eq('id', postId)
      .single()

    if (!error && data) {
      setLikes(data.likes || 0)
      setShares(data.shares || 0)
      setHasLiked(data.liked_by?.includes(sessionId) || false)
    }
  }, [postId, sessionId])

  // Load pending interactions from localStorage
  useEffect(() => {
    const loadPendingInteractions = () => {
      try {
        const cached = localStorage.getItem(`${STORAGE_KEY}_${postId}`)
        if (cached) {
          const parsed = JSON.parse(cached)
          if (parsed.like !== undefined) {
            setPendingLike(parsed.like)
            if (parsed.like === true) {
              setHasLiked(true)
              setLikes(prev => prev + 1)
            }
          }
          if (parsed.share !== undefined) {
            setPendingShare(parsed.share)
            if (parsed.share === true) {
              setShares(prev => prev + 1)
            }
          }
          pendingQueueRef.current = parsed
        }
      } catch (err) {
        console.error('Failed to load pending interactions:', err)
      }
    }
    
    loadInitialData()
    loadPendingInteractions()
  }, [loadInitialData, postId])

  // Save pending interactions to localStorage
  const persistPending = useCallback((data) => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_${postId}`, JSON.stringify(data))
    } catch (err) {
      console.error('Failed to persist interactions:', err)
    }
  }, [postId])

  // Like/Unlike with optimistic update
  const toggleLike = useCallback(async () => {
    const newLikedState = !hasLiked
    
    // Optimistic update
    setHasLiked(newLikedState)
    setLikes(prev => newLikedState ? prev + 1 : prev - 1)
    
    // Store pending action
    pendingQueueRef.current.like = newLikedState
    persistPending(pendingQueueRef.current)
    setPendingLike(newLikedState)
    
    // Don't sync immediately - wait for interval
    setSyncError(null)
  }, [hasLiked, persistPending])

  // Share with optimistic update
  const incrementShare = useCallback(async () => {
    // Optimistic update
    setShares(prev => prev + 1)
    
    // Store pending action
    pendingQueueRef.current.share = true
    persistPending(pendingQueueRef.current)
    setPendingShare(true)
    
    setSyncError(null)
  }, [persistPending])

  // Sync all pending interactions to database
  const syncInteractions = useCallback(async () => {
    if (isSyncing) return
    
    const pendingLikeState = pendingQueueRef.current.like
    const pendingShareState = pendingQueueRef.current.share
    
    if (pendingLikeState === undefined && pendingShareState === undefined) return
    
    setIsSyncing(true)
    setSyncError(null)
    
    try {
      // Get current database state
      const { data: current, error: fetchError } = await supabase
        .from('live_posts')
        .select('likes, shares, liked_by')
        .eq('id', postId)
        .single()
      
      if (fetchError) throw fetchError
      
      let newLikes = current.likes || 0
      let newShares = current.shares || 0
      let newLikedBy = current.liked_by || []
      
      // Apply pending like
      if (pendingLikeState !== undefined) {
        const currentlyLiked = newLikedBy.includes(sessionId)
        
        if (pendingLikeState === true && !currentlyLiked) {
          newLikes += 1
          newLikedBy.push(sessionId)
        } else if (pendingLikeState === false && currentlyLiked) {
          newLikes -= 1
          newLikedBy = newLikedBy.filter(id => id !== sessionId)
        }
      }
      
      // Apply pending share
      if (pendingShareState === true) {
        newShares += 1
      }
      
      // Update database
      const { error: updateError } = await supabase
        .from('live_posts')
        .update({
          likes: newLikes,
          shares: newShares,
          liked_by: newLikedBy
        })
        .eq('id', postId)
      
      if (updateError) throw updateError
      
      // Clear pending queue
      pendingQueueRef.current = { likes: [], shares: [] }
      persistPending({})
      setPendingLike(null)
      setPendingShare(null)
      
      // Update UI to match database
      setLikes(newLikes)
      setShares(newShares)
      setHasLiked(newLikedBy.includes(sessionId))
      
    } catch (err) {
      console.error('Sync failed:', err)
      setSyncError(err.message)
      
      // Schedule retry with exponential backoff
      setTimeout(() => {
        if (pendingQueueRef.current.like !== undefined || pendingQueueRef.current.share !== undefined) {
          syncInteractions()
        }
      }, 5000)
    } finally {
      setIsSyncing(false)
    }
  }, [postId, sessionId, isSyncing, pendingLikeState, pendingShareState])

  // Clear pending interactions (on success)
  const clearPending = useCallback(() => {
    pendingQueueRef.current = { likes: [], shares: [] }
    persistPending({})
    setPendingLike(null)
    setPendingShare(null)
  }, [persistPending])

  // Auto-sync every 10 minutes
  useEffect(() => {
    syncIntervalRef.current = setInterval(() => {
      if (pendingQueueRef.current.like !== undefined || pendingQueueRef.current.share !== undefined) {
        syncInteractions()
      }
    }, SYNC_INTERVAL)

    // Sync before page unload
    const handleBeforeUnload = () => {
      if (pendingQueueRef.current.like !== undefined || pendingQueueRef.current.share !== undefined) {
        persistPending(pendingQueueRef.current)
      }
    }
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && 
          (pendingQueueRef.current.like !== undefined || pendingQueueRef.current.share !== undefined)) {
        persistPending(pendingQueueRef.current)
        syncInteractions()
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(syncIntervalRef.current)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      
      // Final persist on unmount
      if (pendingQueueRef.current.like !== undefined || pendingQueueRef.current.share !== undefined) {
        persistPending(pendingQueueRef.current)
      }
    }
  }, [syncInteractions, persistPending])

  return {
    likes,
    shares,
    hasLiked,
    pendingLike,
    pendingShare,
    isSyncing,
    syncError,
    toggleLike,
    incrementShare,
    syncInteractions,
    clearPending
  }
}