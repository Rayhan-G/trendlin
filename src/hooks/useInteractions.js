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

  // Don't do anything if postId is undefined
  const loadInitialData = useCallback(async () => {
    if (!postId) return
    
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
    
    setHasLiked(newLikedState)
    setLikes(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1))
    pendingQueueRef.current.like = newLikedState
    setPendingLike(newLikedState)
    
    try {
      const { data: current } = await supabase
        .from('live_posts')
        .select('likes, liked_by')
        .eq('id', postId)
        .single()
      
      let newLikes = current?.likes || 0
      let newLikedBy = current?.liked_by || []
      const currentlyLiked = newLikedBy.includes(sessionId)
      
      if (newLikedState === true && !currentlyLiked) {
        newLikes += 1
        newLikedBy.push(sessionId)
      } else if (newLikedState === false && currentlyLiked) {
        newLikes = Math.max(0, newLikes - 1)
        newLikedBy = newLikedBy.filter(id => id !== sessionId)
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
      console.error('Like sync error:', err)
    }
  }, [hasLiked, postId, sessionId])

  return {
    likes,
    hasLiked,
    pendingLike,
    isSyncing,
    syncError,
    toggleLike,
  }
}