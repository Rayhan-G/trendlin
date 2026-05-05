// components/comments/CommentSection.jsx
import { useState, useCallback, useEffect } from 'react'
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
  const [sortBy, setSortBy] = useState('top') // top, newest, likes
  const [showReplies, setShowReplies] = useState({})
  const [visibleReplies, setVisibleReplies] = useState(3)

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

  // Sort comments based on selected option
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
    setShowReplies(prev => ({ ...prev, [parentId]: true }))
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
    setShowReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }))
  }

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    return `${days}d`
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const sortedComments = getSortedComments()

  return (
    <div className="comment-section">
      {/* Name Input Modal */}
      {showNameInput && (
        <div className="name-modal">
          <div className="name-modal-content">
            <h4>Join the conversation</h4>
            <p>Please enter your name to comment</p>
            <input
              type="text"
              placeholder="Your name *"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="name-input"
            />
            <input
              type="email"
              placeholder="Your email (optional)"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="email-input"
            />
            <button onClick={handleSaveName} disabled={!userName.trim()} className="save-name-btn">
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Comment Stats & Sort */}
      <div className="comment-stats-bar">
        <div className="comment-count">
          <span className="count-number">{sortedComments.length}</span>
          <span className="count-text">Comments</span>
        </div>
        <div className="sort-options">
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
          <button 
            onClick={() => setSortBy('likes')} 
            className={`sort-btn ${sortBy === 'likes' ? 'active' : ''}`}
          >
            Most Liked
          </button>
        </div>
      </div>

      {/* Comment Input - YouTube Style */}
      <div className="comment-input-wrapper">
        <div className="comment-input-avatar">
          <div className="avatar-placeholder">
            {localStorage.getItem('comment_name')?.[0]?.toUpperCase() || '?'}
          </div>
        </div>
        <div className="comment-input-container">
          {replyingTo && (
            <div className="replying-badge">
              <span>Replying to @{comments.find(c => c.id === replyingTo)?.user_name}</span>
              <button onClick={() => setReplyingTo(null)}><X size={14} /></button>
            </div>
          )}
          <textarea
            placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
            value={replyingTo ? replyContent : newComment}
            onChange={(e) => replyingTo ? setReplyContent(e.target.value) : setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                replyingTo ? handleReplySubmit(replyingTo) : handleSubmit()
              }
            }}
            rows="1"
            className="comment-input-field"
          />
          <div className="comment-input-actions">
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
        <div className={`sync-status ${isSyncing ? 'syncing' : ''}`}>
          {isSyncing ? (
            <>
              <div className="sync-spinner" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Clock size={14} />
              <span>Saving {pendingComments.length} comment{pendingComments.length > 1 ? 's' : ''}</span>
              <button onClick={syncAllComments} className="sync-now-btn">Save now</button>
            </>
          )}
        </div>
      )}

      {/* Comments List */}
      <div className="comments-list">
        {loading ? (
          [...Array(3)].map((_, i) => (
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
            <h4>No comments yet</h4>
            <p>Be the first to share your thoughts!</p>
          </div>
        ) : (
          sortedComments.map((comment) => (
            <div key={comment.id} className="comment-thread">
              {/* Main Comment */}
              <div className={`comment-item ${!comment.is_synced ? 'pending' : ''}`}>
                <div className="comment-avatar">
                  <div className="avatar-placeholder">
                    {comment.user_name?.[0]?.toUpperCase() || '?'}
                  </div>
                </div>
                <div className="comment-content">
                  <div className="comment-header">
                    <div className="comment-author">
                      {comment.user_name}
                      {comment.is_edited && <span className="edited-badge">(edited)</span>}
                    </div>
                    <div className="comment-time">
                      {formatTimeAgo(comment.created_at)}
                    </div>
                  </div>
                  
                  {editingId === comment.id ? (
                    <div className="edit-mode">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows="2"
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
                      className={`action-btn like-btn ${comment.liked_by?.includes(sessionId) ? 'liked' : ''}`}
                    >
                      <ThumbsUp size={14} />
                      <span>{formatNumber(comment.likes || 0)}</span>
                    </button>
                    <button onClick={() => setReplyingTo(comment.id)} className="action-btn reply-btn">
                      <Reply size={14} />
                      <span>Reply</span>
                    </button>
                    {isOwnComment(comment) && (
                      <>
                        <button onClick={() => handleEdit(comment)} className="action-btn edit-btn">
                          <Edit2 size={14} />
                          <span>Edit</span>
                        </button>
                        <button onClick={() => deleteComment(comment.id)} className="action-btn delete-btn">
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </>
                    )}
                    <button className="action-btn more-btn">
                      <MoreHorizontal size={14} />
                    </button>
                  </div>

                  {/* Admin Reply */}
                  {comment.admin_reply && (
                    <div className="admin-reply">
                      <div className="admin-reply-header">
                        <span className="admin-badge">✓ Admin</span>
                      </div>
                      <div className="admin-reply-content">{comment.admin_reply}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Replies Section */}
              {comment.reply_count > 0 && (
                <div className="replies-section">
                  <button 
                    onClick={() => toggleReplies(comment.id)} 
                    className="show-replies-btn"
                  >
                    {showReplies[comment.id] ? (
                      <><ChevronUp size={14} /> Hide replies ({comment.reply_count})</>
                    ) : (
                      <><ChevronDown size={14} /> Show replies ({comment.reply_count})</>
                    )}
                  </button>
                  
                  {showReplies[comment.id] && comment.replies && (
                    <div className="replies-list">
                      {comment.replies.slice(0, visibleReplies).map((reply) => (
                        <div key={reply.id} className="comment-item reply-item">
                          <div className="comment-avatar">
                            <div className="avatar-placeholder small">
                              {reply.user_name?.[0]?.toUpperCase() || '?'}
                            </div>
                          </div>
                          <div className="comment-content">
                            <div className="comment-header">
                              <div className="comment-author">{reply.user_name}</div>
                              <div className="comment-time">{formatTimeAgo(reply.created_at)}</div>
                            </div>
                            <div className="comment-text">{reply.content}</div>
                            <div className="comment-actions">
                              <button 
                                onClick={() => likeComment(reply.id)} 
                                className={`action-btn like-btn ${reply.liked_by?.includes(sessionId) ? 'liked' : ''}`}
                              >
                                <ThumbsUp size={12} />
                                <span>{formatNumber(reply.likes || 0)}</span>
                              </button>
                              <button onClick={() => setReplyingTo(reply.id)} className="action-btn reply-btn">
                                <Reply size={12} />
                                <span>Reply</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {comment.replies.length > visibleReplies && (
                        <button 
                          onClick={() => setVisibleReplies(prev => prev + 5)}
                          className="load-more-replies"
                        >
                          Load more replies...
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        
        {hasMore && !loading && (
          <button onClick={loadMore} className="load-more-btn">
            Load more comments
          </button>
        )}
      </div>

      <style jsx>{`
        .comment-section {
          margin-top: 1.5rem;
          padding-top: 1rem;
        }

        /* Stats Bar */
        .comment-stats-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .comment-count {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }

        .count-number {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
        }

        .count-text {
          font-size: 0.9rem;
          color: #64748b;
        }

        .sort-options {
          display: flex;
          gap: 0.5rem;
        }

        .sort-btn {
          padding: 0.25rem 0.75rem;
          background: none;
          border: none;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .sort-btn:hover {
          background: #f1f5f9;
        }

        .sort-btn.active {
          background: #e2e8f0;
          color: #1e293b;
        }

        /* Comment Input - YouTube Style */
        .comment-input-wrapper {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .comment-input-avatar {
          flex-shrink: 0;
        }

        .avatar-placeholder {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 14px;
        }

        .avatar-placeholder.small {
          width: 32px;
          height: 32px;
          font-size: 12px;
        }

        .comment-input-container {
          flex: 1;
          position: relative;
        }

        .replying-badge {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.25rem 0.5rem;
          background: #f1f5f9;
          border-radius: 8px;
          font-size: 0.7rem;
          margin-bottom: 0.5rem;
          color: #475569;
        }

        .replying-badge button {
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
        }

        .comment-input-field {
          width: 100%;
          padding: 0.75rem 0;
          border: none;
          border-bottom: 2px solid #e2e8f0;
          font-size: 0.875rem;
          background: transparent;
          outline: none;
          resize: none;
          font-family: inherit;
          transition: border-color 0.2s;
        }

        .comment-input-field:focus {
          border-bottom-color: #8b5cf6;
        }

        .comment-input-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 0.5rem;
        }

        .submit-btn {
          padding: 0.375rem 1rem;
          background: #8b5cf6;
          color: white;
          border: none;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .submit-btn:hover {
          background: #7c3aed;
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Name Modal */
        .name-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .name-modal-content {
          background: white;
          border-radius: 16px;
          padding: 24px;
          max-width: 400px;
          width: 90%;
        }

        .name-modal-content h4 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .name-modal-content p {
          font-size: 0.85rem;
          color: #64748b;
          margin-bottom: 16px;
        }

        .name-input, .email-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          margin-bottom: 12px;
        }

        .save-name-btn {
          width: 100%;
          padding: 10px;
          background: #8b5cf6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        .save-name-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Sync Status */
        .sync-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #fef3c7;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.7rem;
          color: #d97706;
        }

        .sync-status.syncing {
          background: #e0e7ff;
          color: #4338ca;
        }

        .sync-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid #4338ca;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        .sync-now-btn {
          margin-left: auto;
          background: none;
          border: none;
          color: #d97706;
          cursor: pointer;
          text-decoration: underline;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Comments List */
        .comments-list {
          max-height: 600px;
          overflow-y: auto;
        }

        /* Comment Skeleton */
        .comment-skeleton {
          display: flex;
          gap: 1rem;
          padding: 1rem 0;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .skeleton-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e2e8f0;
        }

        .skeleton-content {
          flex: 1;
        }

        .skeleton-line {
          height: 12px;
          background: #e2e8f0;
          border-radius: 6px;
          margin-bottom: 8px;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Comment Item */
        .comment-thread {
          margin-bottom: 1rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .comment-item {
          display: flex;
          gap: 1rem;
          padding: 1rem 0;
        }

        .comment-item.pending {
          opacity: 0.7;
        }

        .reply-item {
          padding: 0.75rem 0 0.75rem 3rem;
        }

        .comment-content {
          flex: 1;
        }

        .comment-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 0.25rem;
        }

        .comment-author {
          font-weight: 600;
          font-size: 0.8rem;
          color: #1e293b;
        }

        .comment-time {
          font-size: 0.65rem;
          color: #94a3b8;
        }

        .edited-badge {
          font-size: 0.6rem;
          color: #64748b;
          margin-left: 0.25rem;
        }

        .comment-text {
          font-size: 0.85rem;
          color: #334155;
          line-height: 1.5;
          margin-bottom: 0.5rem;
        }

        .comment-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: none;
          border: none;
          color: #64748b;
          font-size: 0.7rem;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 20px;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: #f1f5f9;
        }

        .like-btn.liked {
          color: #ef4444;
        }

        .delete-btn:hover {
          background: #fee2e2;
          color: #ef4444;
        }

        .edit-mode {
          margin: 0.5rem 0;
        }

        .edit-mode textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.85rem;
          font-family: inherit;
        }

        .edit-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .edit-actions button {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.7rem;
          cursor: pointer;
        }

        .edit-actions button:first-child {
          background: #f1f5f9;
          border: none;
        }

        .edit-actions button:last-child {
          background: #8b5cf6;
          color: white;
          border: none;
        }

        /* Admin Reply */
        .admin-reply {
          margin-top: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: #f0fdf4;
          border-radius: 8px;
          border-left: 3px solid #22c55e;
        }

        .admin-badge {
          font-size: 0.6rem;
          font-weight: 600;
          color: #22c55e;
        }

        .admin-reply-content {
          font-size: 0.75rem;
          color: #1e293b;
          margin-top: 0.25rem;
        }

        /* Replies Section */
        .replies-section {
          margin-left: 2rem;
        }

        .show-replies-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: #8b5cf6;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          padding: 0.25rem 0;
          margin: 0.25rem 0;
        }

        .show-replies-btn:hover {
          opacity: 0.8;
        }

        .replies-list {
          margin-top: 0.5rem;
        }

        .load-more-replies {
          background: none;
          border: none;
          color: #8b5cf6;
          font-size: 0.7rem;
          cursor: pointer;
          margin-left: 3rem;
          padding: 0.25rem 0;
        }

        .load-more-btn {
          width: 100%;
          padding: 0.75rem;
          background: transparent;
          border: 1px solid #e2e8f0;
          border-radius: 40px;
          color: #8b5cf6;
          font-weight: 500;
          cursor: pointer;
          margin-top: 1rem;
          transition: all 0.2s;
        }

        .load-more-btn:hover {
          background: #f1f5f9;
        }

        /* No Comments */
        .no-comments {
          text-align: center;
          padding: 3rem;
        }

        .no-comments-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .no-comments h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }

        .no-comments p {
          font-size: 0.8rem;
          color: #64748b;
        }

        /* Dark Mode */
        @media (prefers-color-scheme: dark) {
          .count-number { color: #f1f5f9; }
          .comment-author { color: #e2e8f0; }
          .comment-text { color: #94a3b8; }
          .comment-input-field { color: #e2e8f0; }
          .comment-input-field:focus { border-bottom-color: #8b5cf6; }
          .name-modal-content { background: #1e293b; }
          .name-input, .email-input { background: #334155; border-color: #475569; color: white; }
          .action-btn:hover { background: #334155; }
          .delete-btn:hover { background: #7f1d1d; }
          .edit-actions button:first-child { background: #334155; color: #e2e8f0; }
          .no-comments h4 { color: #f1f5f9; }
          .load-more-btn { border-color: #334155; }
          .load-more-btn:hover { background: #334155; }
          .comment-thread { border-bottom-color: #1e293b; }
          .skeleton-avatar { background: #334155; }
          .skeleton-line { background: #334155; }
        }

        /* Mobile */
        @media (max-width: 640px) {
          .comment-stats-bar {
            flex-direction: column;
            align-items: flex-start;
          }
          .reply-item {
            padding-left: 1rem;
          }
          .replies-section {
            margin-left: 0;
          }
          .load-more-replies {
            margin-left: 1rem;
          }
        }
      `}</style>
    </div>
  )
}