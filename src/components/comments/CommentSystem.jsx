import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import toast, { Toaster } from 'react-hot-toast'
import { commentService } from '../../services/commentService'
import { useCommentState } from '../../hooks/useCommentState'
import CommentItem from './CommentItem'
import CommentInput from './CommentInput'
import AuthModal from '../frontend/AuthModal'

export default function FacebookComments({ postId }) {
  const [user, setUser] = useState(null)
  const [replyTo, setReplyTo] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [expandedReplies, setExpandedReplies] = useState({})
  const [loadingMore, setLoadingMore] = useState(false)
  const subscriptionRef = useRef(null)
  const likesQueue = useRef(new Map())
  
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: '100px'
  })
  
  const {
    commentsRef,
    rootComments,
    repliesByParent,
    totalCount,
    hasMore,
    loading,
    currentPage,
    setLoading,
    setHasMore,
    generateTempId,
    addComment,
    updateOptimisticComment,
    updateComment,
    deleteComment,
    toggleLike,
    loadCommentsBatch,
    getCommentsForRender
  } = useCommentState()

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' })
        const data = await response.json()
        if (data.authenticated && data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            name: data.user.name || data.user.email?.split('@')[0]
          })
        }
      } catch (error) {
        console.error('Error getting user:', error)
      }
    }
    getUser()
  }, [])

  // Load comments
  const loadComments = useCallback(async (page = 1, append = false) => {
    if (!postId) return
    
    try {
      setLoading(true)
      const result = await commentService.getComments(postId, page, 20)
      
      if (append) {
        loadCommentsBatch(result.comments, result.total, false)
      } else {
        loadCommentsBatch(result.comments, result.total, true)
      }
      
      setHasMore(result.hasMore)
    } catch (error) {
      console.error('Error loading comments:', error)
      toast.error('Failed to load comments')
    } finally {
      setLoading(false)
    }
  }, [postId, setLoading, loadCommentsBatch, setHasMore])

  // Load more replies
  const loadMoreReplies = useCallback(async (commentId) => {
    try {
      const currentReplies = repliesByParent[commentId] || []
      const nextPage = Math.floor(currentReplies.length / 10) + 1
      
      const { replies, hasMore: moreReplies } = await commentService.getCommentReplies(commentId, nextPage, 10)
      
      if (replies.length > 0) {
        loadCommentsBatch(replies, 0, false)
      }
    } catch (error) {
      console.error('Error loading replies:', error)
      toast.error('Failed to load replies')
    }
  }, [repliesByParent, loadCommentsBatch])

  // Create comment with optimistic update
  const handleCreateComment = useCallback(async (content) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    
    const parentId = replyTo?.id
    const tempId = generateTempId()
    
    // Optimistic insert
    const optimisticComment = {
      id: tempId,
      content,
      user_id: user.id,
      user_name: user.name,
      created_at: new Date().toISOString(),
      likes_count: 0,
      user_liked: false,
      parent_id: parentId || null,
      isOptimistic: true
    }
    
    addComment(optimisticComment, parentId)
    setReplyTo(null)
    
    if (parentId) {
      setExpandedReplies(prev => ({ ...prev, [parentId]: true }))
    }
    
    try {
      setSubmitting(true)
      const realComment = await commentService.createComment(postId, content, user, parentId)
      updateOptimisticComment(tempId, realComment)
      toast.success('Comment posted!')
    } catch (error) {
      deleteComment(tempId, parentId)
      toast.error('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }, [user, replyTo, postId, generateTempId, addComment, updateOptimisticComment, deleteComment])

  // Delete comment
  const handleDeleteComment = useCallback(async (commentId, parentId) => {
    const comment = commentsRef.current[commentId]
    if (!comment) return
    
    deleteComment(commentId, parentId)
    
    try {
      await commentService.deleteComment(commentId)
      toast.success('Comment deleted')
    } catch (error) {
      addComment(comment, parentId)
      toast.error('Failed to delete comment')
    }
  }, [commentsRef, deleteComment, addComment])

  // Edit comment
  const handleEditComment = useCallback(async (commentId, newContent) => {
    const oldContent = commentsRef.current[commentId]?.content
    
    updateComment(commentId, { content: newContent, is_edited: true })
    
    try {
      await commentService.updateComment(commentId, newContent)
      toast.success('Comment updated')
    } catch (error) {
      updateComment(commentId, { content: oldContent, is_edited: false })
      toast.error('Failed to update comment')
    }
  }, [commentsRef, updateComment])

  // Like comment with debounce
  const handleLike = useCallback(async (commentId) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    
    if (likesQueue.current.has(commentId)) return
    likesQueue.current.set(commentId, setTimeout(() => likesQueue.current.delete(commentId), 500))
    
    toggleLike(commentId, true)
    
    try {
      await commentService.toggleLike(commentId, user.id)
    } catch (error) {
      toggleLike(commentId, false)
      toast.error('Failed to like comment')
    }
  }, [user, toggleLike])

  // Share comment
  const handleShare = useCallback(async (comment) => {
    const url = `${window.location.origin}/post/${postId}?comment=${comment.id}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this comment',
          text: comment.content.substring(0, 100),
          url
        })
      } catch (err) {
        if (err.name !== 'AbortError') {
          await navigator.clipboard.writeText(url)
          toast.success('Link copied!')
        }
      }
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied!')
    }
  }, [postId])

  // Toggle replies visibility
  const toggleReplies = useCallback((commentId) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }))
  }, [])

  // Real-time subscription
  useEffect(() => {
    if (!postId) return
    
    loadComments(1, false)
    
    subscriptionRef.current = commentService.subscribeToComments(postId, (payload) => {
      if (payload.eventType === 'INSERT') {
        const newComment = payload.new
        if (!commentsRef.current[newComment.id]) {
          addComment(newComment, newComment.parent_id)
          
          const isReplyToUser = newComment.parent_id && 
            commentsRef.current[newComment.parent_id]?.user_id === user?.id
          
          if (isReplyToUser && user) {
            toast.success(`${newComment.user_name} replied to you!`, { icon: '💬' })
          }
          
          if (newComment.parent_id) {
            setExpandedReplies(prev => ({ ...prev, [newComment.parent_id]: true }))
          }
        }
      } else if (payload.eventType === 'DELETE') {
        deleteComment(payload.old.id, payload.old.parent_id)
      } else if (payload.eventType === 'UPDATE') {
        updateComment(payload.new.id, payload.new)
      }
    })
    
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [postId, loadComments, user, addComment, deleteComment, updateComment])

  // Infinite scroll
  useEffect(() => {
    if (inView && !loading && hasMore && !loadingMore) {
      setLoadingMore(true)
      loadComments(currentPage + 1, true).finally(() => {
        setLoadingMore(false)
      })
    }
  }, [inView, loading, hasMore, loadingMore, loadComments, currentPage])

  const visibleComments = getCommentsForRender()

  if (loading && visibleComments.length === 0) {
    return (
      <div className="loading-container">
        <div className="skeleton-comment" />
        <div className="skeleton-comment" />
        <div className="skeleton-comment" />
        <style jsx>{`
          .loading-container { padding: 20px; }
          .skeleton-comment {
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
          }
          .skeleton-comment::before {
            content: '';
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #e4e6eb;
            animation: pulse 1.5s ease-in-out infinite;
          }
          .skeleton-comment::after {
            content: '';
            flex: 1;
            height: 60px;
            background: #e4e6eb;
            border-radius: 18px;
            animation: pulse 1.5s ease-in-out infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="facebook-comments">
      <Toaster position="top-center" />
      
      <div className="comments-header">
        <h3>Comments</h3>
        <span className="comments-count">{totalCount}</span>
      </div>
      
      <CommentInput
        user={user}
        replyTo={replyTo}
        onSubmit={handleCreateComment}
        onCancelReply={() => setReplyTo(null)}
        isSubmitting={submitting}
      />
      
      <div className="comments-list">
        {!loading && visibleComments.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
        
        {visibleComments.map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            user={user}
            onLike={handleLike}
            onReply={setReplyTo}
            onEdit={handleEditComment}
            onDelete={handleDeleteComment}
            onShare={handleShare}
            replies={repliesByParent[comment.id] || []}
            replyCount={comment.reply_count || 0}
            isExpanded={expandedReplies[comment.id] || false}
            onToggleReplies={() => toggleReplies(comment.id)}
            onLoadMoreReplies={loadMoreReplies}
          />
        ))}
        
        {hasMore && (
          <div ref={loadMoreRef} className="load-more-trigger">
            {loadingMore && <span className="loading-more">Loading more...</span>}
          </div>
        )}
      </div>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onLogin={(loggedInUser) => {
          setUser(loggedInUser)
          setShowAuthModal(false)
          loadComments(1, false)
        }} 
      />
      
      <style jsx>{`
        .facebook-comments {
          max-width: 680px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 12px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        
        .comments-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 20px 0 16px 0;
          border-bottom: 1px solid #e4e6eb;
        }
        
        .comments-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #050505;
          margin: 0;
        }
        
        .comments-count {
          color: #65676b;
          font-size: 15px;
        }
        
        .comments-list {
          max-height: 600px;
          overflow-y: auto;
        }
        
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #65676b;
        }
        
        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }
        
        .load-more-trigger {
          padding: 20px;
          text-align: center;
        }
        
        .loading-more {
          font-size: 13px;
          color: #65676b;
        }
        
        .comments-list::-webkit-scrollbar {
          width: 6px;
        }
        
        .comments-list::-webkit-scrollbar-track {
          background: #f0f2f5;
          border-radius: 3px;
        }
        
        .comments-list::-webkit-scrollbar-thumb {
          background: #bcc0c4;
          border-radius: 3px;
        }
        
        .comments-list::-webkit-scrollbar-thumb:hover {
          background: #65676b;
        }
        
        @media (max-width: 768px) {
          .facebook-comments { padding: 0 8px; }
          .comments-list { max-height: none; overflow-y: visible; }
        }
      `}</style>
    </div>
  )
}