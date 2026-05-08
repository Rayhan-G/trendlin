import { useState, useCallback, useRef, useEffect } from 'react'

// Simple unique ID generator
const generateUniqueId = () => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

export function useCommentState() {
  const [commentsById, setCommentsById] = useState({})
  const [rootComments, setRootComments] = useState([])
  const [repliesByParent, setRepliesByParent] = useState({})
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  
  const pendingInserts = useRef(new Set())
  const commentsRef = useRef(commentsById)

  // Sync ref with state
  useEffect(() => {
    commentsRef.current = commentsById
  }, [commentsById])

  const generateTempId = useCallback(() => {
    return `temp_${generateUniqueId()}`
  }, [])

  const addComment = useCallback((comment, parentId = null) => {
    if (pendingInserts.current.has(comment.id)) return false
    
    setCommentsById(prev => ({ ...prev, [comment.id]: comment }))
    
    if (parentId) {
      setRepliesByParent(prev => ({
        ...prev,
        [parentId]: [comment, ...(prev[parentId] || [])]
      }))
    } else {
      setRootComments(prev => [comment, ...prev])
    }
    
    setTotalCount(prev => prev + 1)
    pendingInserts.current.add(comment.id)
    
    setTimeout(() => {
      pendingInserts.current.delete(comment.id)
    }, 3000)
    
    return true
  }, [])

  const updateOptimisticComment = useCallback((tempId, realComment) => {
    setCommentsById(prev => {
      const tempComment = prev[tempId]
      if (!tempComment) return prev
      
      const { [tempId]: _, ...rest } = prev
      return { ...rest, [realComment.id]: { ...realComment, isOptimistic: false } }
    })
    
    const parentId = tempComment?.parent_id
    if (parentId) {
      setRepliesByParent(prev => ({
        ...prev,
        [parentId]: prev[parentId]?.map(c => 
          c.id === tempId ? { ...realComment, isOptimistic: false } : c
        ) || []
      }))
    } else {
      setRootComments(prev => 
        prev.map(c => c.id === tempId ? { ...realComment, isOptimistic: false } : c)
      )
    }
    
    pendingInserts.current.delete(tempId)
  }, [])

  const updateComment = useCallback((commentId, updates) => {
    setCommentsById(prev => ({
      ...prev,
      [commentId]: { ...prev[commentId], ...updates }
    }))
  }, [])

  const deleteComment = useCallback((commentId, parentId = null) => {
    setCommentsById(prev => {
      const { [commentId]: _, ...rest } = prev
      return rest
    })
    
    if (parentId) {
      setRepliesByParent(prev => ({
        ...prev,
        [parentId]: prev[parentId]?.filter(r => r.id !== commentId) || []
      }))
    } else {
      setRootComments(prev => prev.filter(c => c.id !== commentId))
    }
    
    setTotalCount(prev => prev - 1)
  }, [])

  const toggleLike = useCallback((commentId, optimistic = true) => {
    const comment = commentsById[commentId]
    if (!comment) return
    
    const hasLiked = comment.user_liked
    const newLikesCount = hasLiked ? comment.likes_count - 1 : comment.likes_count + 1
    
    if (optimistic) {
      setCommentsById(prev => ({
        ...prev,
        [commentId]: {
          ...prev[commentId],
          likes_count: newLikesCount,
          user_liked: !hasLiked
        }
      }))
    }
    
    return { newLikesCount, newLiked: !hasLiked }
  }, [commentsById])

  const loadCommentsBatch = useCallback((newComments, total, reset = false) => {
    const byId = {}
    const roots = []
    const replies = {}
    
    newComments.forEach(comment => {
      byId[comment.id] = comment
      
      if (comment.parent_id) {
        replies[comment.parent_id] = [...(replies[comment.parent_id] || []), comment]
      } else {
        roots.push(comment)
      }
    })
    
    if (reset) {
      setCommentsById(byId)
      setRootComments(roots)
      setRepliesByParent(replies)
      setTotalCount(total)
      setCurrentPage(1)
    } else {
      setCommentsById(prev => ({ ...prev, ...byId }))
      setRootComments(prev => [...prev, ...roots])
      setRepliesByParent(prev => {
        const merged = { ...prev }
        Object.keys(replies).forEach(parentId => {
          merged[parentId] = [...(prev[parentId] || []), ...replies[parentId]]
        })
        return merged
      })
      setCurrentPage(prev => prev + 1)
    }
    
    setHasMore(newComments.length === 20)
  }, [])

  const getCommentsForRender = useCallback(() => {
    return rootComments.map(commentId => commentsById[commentId]).filter(Boolean)
  }, [rootComments, commentsById])

  return {
    commentsById,
    rootComments,
    repliesByParent,
    totalCount,
    hasMore,
    loading,
    currentPage,
    commentsRef,
    setLoading,
    setHasMore,
    setCurrentPage,
    generateTempId,
    addComment,
    updateOptimisticComment,
    updateComment,
    deleteComment,
    toggleLike,
    loadCommentsBatch,
    getCommentsForRender
  }
}