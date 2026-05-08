// components/comments/CommentSection.jsx - FIXED LAYOUT

import { useState, useCallback, useEffect, useRef } from 'react'
import { 
  Heart, Reply, Edit2, Trash2, User, Send, 
  X, Clock, CheckCircle, ThumbsUp, ThumbsDown,
  ChevronDown, ChevronUp, Flag, MoreHorizontal
} from 'lucide-react'
import { useComments } from '../../hooks/useComments'

export default function CommentSection({ postId, sessionId, commentCount, onCommentCountChange }) {
  const [newComment, setNewComment] = useState('')
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyContent, setReplyContent] = useState('')
  const [showNameInput, setShowNameInput] = useState(!localStorage.getItem('comment_name'))
  const [sortBy, setSortBy] = useState('top')
  const [expandedReplies, setExpandedReplies] = useState({})
  const textareaRef = useRef(null)
  const replyTextareaRef = useRef(null)

  const {
    comments,
    pendingComments,
    loading,
    hasMore,
    isSyncing,
    loadMore,
    addComment,
    editComment,
    deleteComment,
    likeComment,
    syncAllComments
  } = useComments(postId, sessionId)

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px'
    }
  }, [newComment])

  useEffect(() => {
    if (replyTextareaRef.current) {
      replyTextareaRef.current.style.height = 'auto'
      replyTextareaRef.current.style.height = Math.min(replyTextareaRef.current.scrollHeight, 80) + 'px'
    }
  }, [replyContent])

  // Sort comments
  const getSortedComments = () => {
    const sorted = [...comments]
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      case 'likes':
        return sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0))
      case 'top':
      default:
        return sorted.sort((a, b) => {
          const scoreA = (a.likes || 0) + (a.reply_count || 0) * 2
          const scoreB = (b.likes || 0) + (b.reply_count || 0) * 2
          return scoreB - scoreA
        })
    }
  }

  const isOwnComment = (comment) => {
    if (comment.user_id && sessionId && comment.user_id === sessionId) return true
    const storedName = localStorage.getItem('comment_name')
    return storedName && comment.user_name === storedName
  }

  const handleSubmit = async () => {
    if (!newComment.trim()) return
    
    let name = userName
    if (!name) {
      const savedName = localStorage.getItem('comment_name')
      if (savedName) {
        name = savedName
      } else if (showNameInput) {
        return
      }
    }
    
    setIsSubmitting(true)
    const newCommentObj = await addComment(newComment, name, userEmail || null, replyingTo)
    setNewComment('')
    setReplyingTo(null)
    if (onCommentCountChange && newCommentObj) onCommentCountChange(comments.length + 1)
    setIsSubmitting(false)
  }

  const handleReplySubmit = async (parentId) => {
    if (!replyContent.trim()) return
    
    let name = userName
    if (!name) {
      const savedName = localStorage.getItem('comment_name')
      if (savedName) {
        name = savedName
      } else if (showNameInput) {
        return
      }
    }
    
    await addComment(replyContent, name, userEmail || null, parentId)
    setReplyContent('')
    setReplyingTo(null)
    setExpandedReplies(prev => ({ ...prev, [parentId]: true }))
  }

  const handleSaveName = () => {
    if (userName.trim()) {
      localStorage.setItem('comment_name', userName)
      if (userEmail) localStorage.setItem('comment_email', userEmail)
      setShowNameInput(false)
    }
  }

  const handleEdit = (comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  const handleSaveEdit = async (commentId) => {
    if (editContent.trim()) {
      await editComment(commentId, editContent)
      setEditingId(null)
      setEditContent('')
    }
  }

  const toggleReplies = (commentId) => {
    setExpandedReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }))
  }

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d`
    const weeks = Math.floor(days / 7)
    return `${weeks}w`
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const sortedComments = getSortedComments()
  const currentUserName = localStorage.getItem('comment_name') || userName

  return (
    <div className="comment-section">
      {/* Name Input Modal */}
      {showNameInput && (
        <div className="modal-overlay" onClick={() => {}}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Join the conversation</h4>
              <button onClick={() => setShowNameInput(false)} className="modal-close">
                <X size={18} />
              </button>
            </div>
            <p>Please enter your name to comment</p>
            <input
              type="text"
              placeholder="Your name *"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="modal-input"
              autoFocus
            />
            <input
              type="email"
              placeholder="Your email (optional)"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="modal-input"
            />
            <button onClick={handleSaveName} disabled={!userName.trim()} className="modal-btn">
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="comments-header">
        <div className="comments-count">
          <span className="count">{sortedComments.length}</span>
          <span>Comments</span>
        </div>
        <div className="sort-buttons">
          <button 
            onClick={() => setSortBy('top')} 
            className={`sort-btn ${sortBy === 'top' ? 'active' : ''}`}
          >
            Top
          </button>
          <button 
            onClick={() => setSortBy('newest')} 
            className={`sort-btn ${sortBy === 'newest' ? 'active' : ''}`}
          >
            Newest
          </button>
        </div>
      </div>

      {/* Comment Input */}
      <div className="comment-input">
        <div className="comment-avatar">
          <div className="avatar">
            {currentUserName ? currentUserName[0].toUpperCase() : '?'}
          </div>
        </div>
        <div className="input-wrapper">
          {replyingTo && (
            <div className="replying-badge">
              <span>Replying to {comments.find(c => c.id === replyingTo)?.user_name}</span>
              <button onClick={() => setReplyingTo(null)}>
                <X size={14} />
              </button>
            </div>
          )}
          <textarea
            ref={replyingTo ? replyTextareaRef : textareaRef}
            placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
            value={replyingTo ? replyContent : newComment}
            onChange={(e) => replyingTo ? setReplyContent(e.target.value) : setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                replyingTo ? handleReplySubmit(replyingTo) : handleSubmit()
              }
            }}
            rows={1}
            className="comment-textarea"
          />
          <div className="input-actions">
            {replyingTo && (
              <button 
                onClick={() => setReplyingTo(null)}
                className="cancel-btn"
              >
                Cancel
              </button>
            )}
            <button 
              onClick={() => replyingTo ? handleReplySubmit(replyingTo) : handleSubmit()} 
              disabled={replyingTo ? !replyContent.trim() : (!newComment.trim() || isSubmitting)}
              className="submit-btn"
            >
              {isSubmitting ? 'Posting...' : 'Comment'}
            </button>
          </div>
        </div>
      </div>

      {/* Sync Status */}
      {pendingComments.length > 0 && (
        <div className="sync-status">
          <div className="sync-spinner" />
          <span>Saving...</span>
        </div>
      )}

      {/* Comments List */}
      <div className="comments-list">
        {loading ? (
          [...Array(2)].map((_, i) => (
            <div key={i} className="comment-skeleton">
              <div className="skeleton-avatar" />
              <div className="skeleton-content">
                <div className="skeleton-line" style={{ width: '30%' }} />
                <div className="skeleton-line" style={{ width: '70%' }} />
              </div>
            </div>
          ))
        ) : sortedComments.length === 0 ? (
          <div className="no-comments">
            <div className="no-comments-icon">💬</div>
            <p>No comments yet. Be the first!</p>
          </div>
        ) : (
          sortedComments.map((comment) => (
            <div key={comment.id} className="comment-thread">
              {/* Main Comment */}
              <div className={`comment ${!comment.is_synced ? 'pending' : ''}`}>
                <div className="comment-avatar">
                  <div className="avatar">
                    {comment.user_name?.[0]?.toUpperCase() || '?'}
                  </div>
                </div>
                <div className="comment-body">
                  <div className="comment-header">
                    <span className="comment-author">{comment.user_name}</span>
                    <span className="comment-time">{formatTimeAgo(comment.created_at)}</span>
                    {comment.is_edited && <span className="edited-badge">edited</span>}
                  </div>
                  
                  {editingId === comment.id ? (
                    <div className="edit-mode">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={2}
                        autoFocus
                      />
                      <div className="edit-actions">
                        <button onClick={() => setEditingId(null)}>Cancel</button>
                        <button onClick={() => handleSaveEdit(comment.id)}>Save</button>
                      </div>
                    </div>
                  ) : (
                    <div className="comment-text">{comment.content}</div>
                  )}
                  
                  <div className="comment-actions">
                    <button 
                      onClick={() => likeComment(comment.id)} 
                      className={`action like ${comment.liked_by?.includes(sessionId) ? 'active' : ''}`}
                    >
                      <ThumbsUp size={14} />
                      <span>{formatNumber(comment.likes || 0)}</span>
                    </button>
                    <button onClick={() => setReplyingTo(comment.id)} className="action reply">
                      <Reply size={14} />
                      <span>Reply</span>
                    </button>
                    {isOwnComment(comment) && (
                      <>
                        <button onClick={() => handleEdit(comment)} className="action edit">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => deleteComment(comment.id)} className="action delete">
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Replies */}
              {comment.reply_count > 0 && (
                <div className="replies-section">
                  <button 
                    onClick={() => toggleReplies(comment.id)} 
                    className="toggle-replies"
                  >
                    {expandedReplies[comment.id] ? (
                      <><ChevronUp size={14} /> Hide {comment.reply_count} replies</>
                    ) : (
                      <><ChevronDown size={14} /> Show {comment.reply_count} replies</>
                    )}
                  </button>
                  
                  {expandedReplies[comment.id] && comment.replies && (
                    <div className="replies-list">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="comment reply">
                          <div className="comment-avatar">
                            <div className="avatar small">
                              {reply.user_name?.[0]?.toUpperCase() || '?'}
                            </div>
                          </div>
                          <div className="comment-body">
                            <div className="comment-header">
                              <span className="comment-author">{reply.user_name}</span>
                              <span className="comment-time">{formatTimeAgo(reply.created_at)}</span>
                            </div>
                            <div className="comment-text">{reply.content}</div>
                            <div className="comment-actions">
                              <button 
                                onClick={() => likeComment(reply.id)} 
                                className={`action like ${reply.liked_by?.includes(sessionId) ? 'active' : ''}`}
                              >
                                <ThumbsUp size={12} />
                                <span>{formatNumber(reply.likes || 0)}</span>
                              </button>
                              <button onClick={() => setReplyingTo(reply.id)} className="action reply">
                                <Reply size={12} />
                                <span>Reply</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        
        {hasMore && !loading && (
          <button onClick={loadMore} className="load-more">
            Load more comments
          </button>
        )}
      </div>

      <style jsx>{`
        .comment-section {
          margin-top: 16px;
          padding: 16px 0 8px 0;
          border-top: 1px solid var(--border-color);
          width: 100%;
          overflow-x: hidden;
        }

        /* Header */
        .comments-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .comments-count {
          display: flex;
          align-items: baseline;
          gap: 6px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .comments-count .count {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .sort-buttons {
          display: flex;
          gap: 4px;
        }

        .sort-btn {
          padding: 4px 12px;
          background: transparent;
          border: none;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .sort-btn:hover {
          background: var(--hover-bg);
        }

        .sort-btn.active {
          background: var(--active-bg);
          color: #8b5cf6;
        }

        /* Comment Input */
        .comment-input {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .comment-avatar {
          flex-shrink: 0;
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 13px;
        }

        .avatar.small {
          width: 28px;
          height: 28px;
          font-size: 11px;
        }

        .input-wrapper {
          flex: 1;
          min-width: 0;
        }

        .replying-badge {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 8px;
          background: var(--replying-bg);
          border-radius: 6px;
          font-size: 11px;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }

        .replying-badge button {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-secondary);
          padding: 2px;
          display: flex;
          align-items: center;
        }

        .comment-textarea {
          width: 100%;
          padding: 8px 0;
          border: none;
          border-bottom: 2px solid var(--border-color);
          background: transparent;
          font-size: 13px;
          font-family: inherit;
          resize: none;
          outline: none;
          color: var(--text-primary);
          transition: border-color 0.2s;
        }

        .comment-textarea:focus {
          border-bottom-color: #8b5cf6;
        }

        .comment-textarea::placeholder {
          color: var(--text-tertiary);
          font-size: 13px;
        }

        .input-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 8px;
        }

        .cancel-btn {
          padding: 4px 12px;
          background: transparent;
          border: none;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .cancel-btn:hover {
          background: var(--hover-bg);
        }

        .submit-btn {
          padding: 4px 14px;
          background: #8b5cf6;
          border: none;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .submit-btn:hover:not(:disabled) {
          background: #7c3aed;
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--card-bg);
          border-radius: 16px;
          padding: 20px;
          max-width: 320px;
          width: 90%;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .modal-header h4 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .modal-close {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-secondary);
          padding: 4px;
        }

        .modal-content p {
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }

        .modal-input {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--border-color);
          border-radius: 10px;
          background: var(--input-bg);
          color: var(--text-primary);
          margin-bottom: 10px;
          font-size: 13px;
        }

        .modal-input:focus {
          outline: none;
          border-color: #8b5cf6;
        }

        .modal-btn {
          width: 100%;
          padding: 10px;
          background: #8b5cf6;
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 500;
          cursor: pointer;
          font-size: 13px;
        }

        .modal-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Sync Status */
        .sync-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          background: var(--sync-bg);
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 11px;
          color: var(--sync-color);
        }

        .sync-spinner {
          width: 12px;
          height: 12px;
          border: 2px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Comments List */
        .comments-list {
          max-height: 400px;
          overflow-y: auto;
        }

        /* Comment Skeleton */
        .comment-skeleton {
          display: flex;
          gap: 10px;
          padding: 12px 0;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .skeleton-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--skeleton-bg);
        }

        .skeleton-content {
          flex: 1;
        }

        .skeleton-line {
          height: 10px;
          background: var(--skeleton-bg);
          border-radius: 5px;
          margin-bottom: 6px;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Comment Thread */
        .comment-thread {
          margin-bottom: 4px;
        }

        .comment {
          display: flex;
          gap: 10px;
          padding: 10px 0;
        }

        .comment.pending {
          opacity: 0.6;
        }

        .comment.reply {
          padding: 8px 0 8px 38px;
        }

        .comment-body {
          flex: 1;
          min-width: 0;
        }

        .comment-header {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 2px;
        }

        .comment-author {
          font-weight: 600;
          font-size: 12px;
          color: var(--text-primary);
        }

        .comment-time {
          font-size: 10px;
          color: var(--text-tertiary);
        }

        .edited-badge {
          font-size: 9px;
          color: var(--text-tertiary);
        }

        .comment-text {
          font-size: 13px;
          line-height: 1.45;
          color: var(--text-primary);
          margin-bottom: 6px;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .comment-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .action {
          display: flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          font-size: 11px;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 3px 6px;
          border-radius: 16px;
          transition: all 0.2s;
        }

        .action:hover {
          background: var(--hover-bg);
        }

        .action.like.active {
          color: #ef4444;
        }

        .action.delete:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .action span {
          font-size: 11px;
        }

        /* Edit Mode */
        .edit-mode {
          margin: 6px 0;
        }

        .edit-mode textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid var(--border-color);
          border-radius: 10px;
          background: var(--input-bg);
          color: var(--text-primary);
          font-family: inherit;
          font-size: 12px;
          resize: vertical;
        }

        .edit-actions {
          display: flex;
          gap: 6px;
          margin-top: 6px;
        }

        .edit-actions button {
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
        }

        .edit-actions button:first-child {
          background: var(--hover-bg);
          border: none;
          color: var(--text-secondary);
        }

        .edit-actions button:last-child {
          background: #8b5cf6;
          border: none;
          color: white;
        }

        /* Replies Section */
        .replies-section {
          margin-left: 46px;
        }

        .toggle-replies {
          display: flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          font-size: 11px;
          font-weight: 500;
          color: #8b5cf6;
          cursor: pointer;
          padding: 4px 0;
          margin: 2px 0;
        }

        .toggle-replies:hover {
          opacity: 0.8;
        }

        .replies-list {
          margin-top: 2px;
        }

        .load-more {
          width: 100%;
          padding: 10px;
          background: transparent;
          border: 1px solid var(--border-color);
          border-radius: 30px;
          font-size: 12px;
          font-weight: 500;
          color: #8b5cf6;
          cursor: pointer;
          margin-top: 12px;
          transition: all 0.2s;
        }

        .load-more:hover {
          background: var(--hover-bg);
        }

        /* No Comments */
        .no-comments {
          text-align: center;
          padding: 32px 16px;
        }

        .no-comments-icon {
          font-size: 36px;
          margin-bottom: 8px;
        }

        .no-comments p {
          font-size: 12px;
          color: var(--text-secondary);
        }

        /* CSS Variables */
        :root {
          --border-color: #e2e8f0;
          --text-primary: #1e293b;
          --text-secondary: #64748b;
          --text-tertiary: #94a3b8;
          --hover-bg: #f1f5f9;
          --active-bg: #f1f5f9;
          --replying-bg: #f1f5f9;
          --card-bg: #ffffff;
          --input-bg: #ffffff;
          --skeleton-bg: #e2e8f0;
          --sync-bg: #fef3c7;
          --sync-color: #d97706;
        }

        :global(.dark) {
          --border-color: #334155;
          --text-primary: #f1f5f9;
          --text-secondary: #94a3b8;
          --text-tertiary: #64748b;
          --hover-bg: #334155;
          --active-bg: #334155;
          --replying-bg: #334155;
          --card-bg: #1e293b;
          --input-bg: #1e293b;
          --skeleton-bg: #334155;
          --sync-bg: #422006;
          --sync-color: #f59e0b;
        }

        /* Mobile */
        @media (max-width: 640px) {
          .comment.reply {
            padding-left: 32px;
          }
          
          .replies-section {
            margin-left: 32px;
          }
          
          .action span:not(.like span) {
            display: none;
          }
          
          .action {
            padding: 3px;
          }
          
          .comment-text {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  )
}