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
  const pendingQueueRef = useRef({ like: undefined, share: undefined })

  // Load initial data from post
  const loadInitialData = useCallback(async () => {
    try {
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
    } catch (err) {
      console.error('Failed to load initial data:', err)
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
            pendingQueueRef.current.like = parsed.like
            setPendingLike(parsed.like)
            if (parsed.like === true) {
              setHasLiked(true)
              setLikes(prev => prev + 1)
            } else if (parsed.like === false) {
              setHasLiked(false)
              setLikes(prev => Math.max(0, prev - 1))
            }
          }
          if (parsed.share !== undefined) {
            pendingQueueRef.current.share = parsed.share
            setPendingShare(parsed.share)
            if (parsed.share === true) {
              setShares(prev => prev + 1)
            }
          }
        }
      } catch (err) {
        console.error('Failed to load pending interactions:', err)
      }
    }
    
    loadInitialData()
    loadPendingInteractions()
  }, [loadInitialData, postId])

  // Save pending interactions to localStorage
  const persistPending = useCallback(() => {
    try {
      const toStore = {
        like: pendingQueueRef.current.like,
        share: pendingQueueRef.current.share
      }
      localStorage.setItem(`${STORAGE_KEY}_${postId}`, JSON.stringify(toStore))
    } catch (err) {
      console.error('Failed to persist interactions:', err)
    }
  }, [postId])

  // Like/Unlike with optimistic update
  const toggleLike = useCallback(async () => {
    const newLikedState = !hasLiked
    
    // Optimistic update
    setHasLiked(newLikedState)
    setLikes(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1))
    
    // Store pending action
    pendingQueueRef.current.like = newLikedState
    setPendingLike(newLikedState)
    persistPending()
    
    setSyncError(null)
  }, [hasLiked, persistPending])

  // Share with optimistic update
  const incrementShare = useCallback(async () => {
    // Optimistic update
    setShares(prev => prev + 1)
    
    // Store pending action
    pendingQueueRef.current.share = true
    setPendingShare(true)
    persistPending()
    
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
      const { data: current, error: fetchError } = await supabase
        .from('live_posts')
        .select('likes, shares, liked_by')
        .eq('id', postId)
        .single()
      
      if (fetchError) throw fetchError
      
      let newLikes = current.likes || 0
      let newShares = current.shares || 0
      let newLikedBy = current.liked_by || []
      
      if (pendingLikeState !== undefined) {
        const currentlyLiked = newLikedBy.includes(sessionId)
        
        if (pendingLikeState === true && !currentlyLiked) {
          newLikes += 1
          newLikedBy.push(sessionId)
        } else if (pendingLikeState === false && currentlyLiked) {
          newLikes = Math.max(0, newLikes - 1)
          newLikedBy = newLikedBy.filter(id => id !== sessionId)
        }
      }
      
      if (pendingShareState === true) {
        newShares += 1
      }
      
      const { error: updateError } = await supabase
        .from('live_posts')
        .update({
          likes: newLikes,
          shares: newShares,
          liked_by: newLikedBy
        })
        .eq('id', postId)
      
      if (updateError) throw updateError
      
      pendingQueueRef.current = { like: undefined, share: undefined }
      setPendingLike(null)
      setPendingShare(null)
      persistPending()
      
      setLikes(newLikes)
      setShares(newShares)
      setHasLiked(newLikedBy.includes(sessionId))
      
    } catch (err) {
      console.error('Sync failed:', err)
      setSyncError(err.message)
      
      setTimeout(() => {
        if (pendingQueueRef.current.like !== undefined || pendingQueueRef.current.share !== undefined) {
          syncInteractions()
        }
      }, 5000)
    } finally {
      setIsSyncing(false)
    }
  }, [postId, sessionId, isSyncing, persistPending])

  // Auto-sync every 10 minutes
  useEffect(() => {
    syncIntervalRef.current = setInterval(() => {
      if (pendingQueueRef.current.like !== undefined || pendingQueueRef.current.share !== undefined) {
        syncInteractions()
      }
    }, SYNC_INTERVAL)

    const handleBeforeUnload = () => {
      if (pendingQueueRef.current.like !== undefined || pendingQueueRef.current.share !== undefined) {
        persistPending()
      }
    }
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && 
          (pendingQueueRef.current.like !== undefined || pendingQueueRef.current.share !== undefined)) {
        persistPending()
        syncInteractions()
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(syncIntervalRef.current)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      
      if (pendingQueueRef.current.like !== undefined || pendingQueueRef.current.share !== undefined) {
        persistPending()
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
    syncInteractions
  }
}