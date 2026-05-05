// Updated useInteractions.js with share tracking removed from hook
// hooks/useInteractions.js - Share tracking removed (handled in component)

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

const SYNC_INTERVAL = 600000 // 10 minutes
const STORAGE_KEY = 'pending_interactions'

export function useInteractions(postId, sessionId) {
  const [likes, setLikes] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)
  const [pendingLike, setPendingLike] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState(null)
  const syncIntervalRef = useRef(null)
  const pendingQueueRef = useRef({ like: undefined })

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('live_posts')
        .select('likes, liked_by')
        .eq('id', postId)
        .single()

      if (!error && data) {
        setLikes(data.likes || 0)
        setHasLiked(data.liked_by?.includes(sessionId) || false)
      }
    } catch (err) {
      console.error('Failed to load initial data:', err)
    }
  }, [postId, sessionId])

  // Load pending from localStorage
  useEffect(() => {
    const loadPending = () => {
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
        }
      } catch (err) {
        console.error('Failed to load pending:', err)
      }
    }
    
    loadInitialData()
    loadPending()
  }, [loadInitialData, postId])

  const persistPending = useCallback(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_${postId}`, JSON.stringify({ like: pendingQueueRef.current.like }))
    } catch (err) {
      console.error('Failed to persist:', err)
    }
  }, [postId])

  // Toggle like
  const toggleLike = useCallback(async () => {
    const newLikedState = !hasLiked
    
    setHasLiked(newLikedState)
    setLikes(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1))
    
    pendingQueueRef.current.like = newLikedState
    setPendingLike(newLikedState)
    persistPending()
    
    setSyncError(null)
  }, [hasLiked, persistPending])

  // Sync likes to database
  const syncLikes = useCallback(async () => {
    if (isSyncing) return
    
    const pendingLikeState = pendingQueueRef.current.like
    if (pendingLikeState === undefined) return
    
    setIsSyncing(true)
    setSyncError(null)
    
    try {
      const { data: current, error: fetchError } = await supabase
        .from('live_posts')
        .select('likes, liked_by')
        .eq('id', postId)
        .single()
      
      if (fetchError) throw fetchError
      
      let newLikes = current.likes || 0
      let newLikedBy = current.liked_by || []
      
      const currentlyLiked = newLikedBy.includes(sessionId)
      
      if (pendingLikeState === true && !currentlyLiked) {
        newLikes += 1
        newLikedBy.push(sessionId)
      } else if (pendingLikeState === false && currentlyLiked) {
        newLikes = Math.max(0, newLikes - 1)
        newLikedBy = newLikedBy.filter(id => id !== sessionId)
      }
      
      const { error: updateError } = await supabase
        .from('live_posts')
        .update({
          likes: newLikes,
          liked_by: newLikedBy
        })
        .eq('id', postId)
      
      if (updateError) throw updateError
      
      pendingQueueRef.current = { like: undefined }
      setPendingLike(null)
      persistPending()
      
      setLikes(newLikes)
      setHasLiked(newLikedBy.includes(sessionId))
      
    } catch (err) {
      console.error('Sync failed:', err)
      setSyncError(err.message)
      
      setTimeout(() => {
        if (pendingQueueRef.current.like !== undefined) {
          syncLikes()
        }
      }, 5000)
    } finally {
      setIsSyncing(false)
    }
  }, [postId, sessionId, isSyncing, persistPending])

  // Auto-sync every 10 minutes
  useEffect(() => {
    syncIntervalRef.current = setInterval(() => {
      if (pendingQueueRef.current.like !== undefined) {
        syncLikes()
      }
    }, SYNC_INTERVAL)

    const handleBeforeUnload = () => {
      if (pendingQueueRef.current.like !== undefined) {
        persistPending()
      }
    }
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && pendingQueueRef.current.like !== undefined) {
        persistPending()
        syncLikes()
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(syncIntervalRef.current)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      
      if (pendingQueueRef.current.like !== undefined) {
        persistPending()
      }
    }
  }, [syncLikes, persistPending])

  return {
    likes,
    hasLiked,
    pendingLike,
    isSyncing,
    syncError,
    toggleLike,
    syncLikes
  }
}