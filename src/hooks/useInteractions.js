// hooks/useInteractions.js
import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

const SYNC_INTERVAL = 600000 // 10 minutes

export function useInteractions(postId, sessionId) {
  const [likes, setLikes] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)
  const [pendingLike, setPendingLike] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState(null)
  const syncIntervalRef = useRef(null)
  const pendingQueueRef = useRef({ like: undefined })

  // Guard clause - return early if no postId
  if (!postId) {
    return {
      likes: 0,
      hasLiked: false,
      pendingLike: null,
      isSyncing: false,
      syncError: null,
      toggleLike: () => {},
    }
  }

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

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  const toggleLike = useCallback(async () => {
    if (!postId) return
    
    const newLikedState = !hasLiked
    
    // Optimistic update
    setHasLiked(newLikedState)
    setLikes(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1))
    pendingQueueRef.current.like = newLikedState
    setPendingLike(newLikedState)
    
    try {
      // Get current state from database
      const { data: current, error: fetchError } = await supabase
        .from('live_posts')
        .select('likes, liked_by')
        .eq('id', postId)
        .single()
      
      if (fetchError) throw fetchError
      
      let newLikes = current?.likes || 0
      let newLikedBy = current?.liked_by || []
      const currentlyLiked = newLikedBy.includes(sessionId)
      
      // Calculate new values
      if (newLikedState === true && !currentlyLiked) {
        newLikes += 1
        newLikedBy.push(sessionId)
      } else if (newLikedState === false && currentlyLiked) {
        newLikes = Math.max(0, newLikes - 1)
        newLikedBy = newLikedBy.filter(id => id !== sessionId)
      }
      
      // Update database
      const { error: updateError } = await supabase
        .from('live_posts')
        .update({ 
          likes: newLikes, 
          liked_by: newLikedBy 
        })
        .eq('id', postId)
      
      if (updateError) throw updateError
      
      // Clear pending state
      pendingQueueRef.current.like = undefined
      setPendingLike(null)
      setLikes(newLikes)
      setHasLiked(newLikedBy.includes(sessionId))
      
    } catch (err) {
      console.error('Like sync error:', err)
      // Rollback optimistic update on error
      setHasLiked(!newLikedState)
      setLikes(prev => newLikedState ? prev - 1 : prev + 1)
      pendingQueueRef.current.like = undefined
      setPendingLike(null)
      setSyncError(err.message)
      setTimeout(() => setSyncError(null), 5000)
    }
  }, [hasLiked, postId, sessionId])

  // Auto-sync every 10 minutes (optional, for pending likes)
  useEffect(() => {
    if (!postId) return
    
    const syncPendingLikes = async () => {
      if (pendingQueueRef.current.like === undefined) return
      
      try {
        const { data: current } = await supabase
          .from('live_posts')
          .select('likes, liked_by')
          .eq('id', postId)
          .single()
        
        if (!current) return
        
        let newLikes = current.likes || 0
        let newLikedBy = current.liked_by || []
        const currentlyLiked = newLikedBy.includes(sessionId)
        const pendingState = pendingQueueRef.current.like
        
        if (pendingState === true && !currentlyLiked) {
          newLikes += 1
          newLikedBy.push(sessionId)
        } else if (pendingState === false && currentlyLiked) {
          newLikes = Math.max(0, newLikes - 1)
          newLikedBy = newLikedBy.filter(id => id !== sessionId)
        } else {
          // No change needed
          pendingQueueRef.current.like = undefined
          setPendingLike(null)
          return
        }
        
        await supabase
          .from('live_posts')
          .update({ likes: newLikes, liked_by: newLikedBy })
          .eq('id', postId)
        
        pendingQueueRef.current.like = undefined
        setPendingLike(null)
        setLikes(newLikes)
        setHasLiked(newLikedBy.includes(sessionId))
        
      } catch (err) {
        console.error('Auto-sync error:', err)
      }
    }
    
    const interval = setInterval(syncPendingLikes, SYNC_INTERVAL)
    return () => clearInterval(interval)
  }, [postId, sessionId])

  return {
    likes,
    hasLiked,
    pendingLike,
    isSyncing,
    syncError,
    toggleLike,
  }
}