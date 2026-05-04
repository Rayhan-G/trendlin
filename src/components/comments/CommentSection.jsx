// components/comments/CommentSection.jsx
import { useState, useCallback, useRef, useEffect } from 'react'
import { 
  Heart, Reply, Edit2, Trash2, User, Send, 
  X, Clock, AlertCircle, CheckCircle, RefreshCw
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
  const [showRetryModal, setShowRetryModal] = useState(false)
  
  const {
    comments,
    pendingComments,
    loading,
    hasMore,
    isSyncing,
    syncError,
    loadMore,
    addComment,
    editComment,
    deleteComment,
    likeComment,
    syncAllComments
  } = useComments(postId, sessionId)

  useEffect(() => {
    if (syncError) {
      setShowRetryModal(true)
    }
  }, [syncError])

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

  const handleManualSync = () => {
    syncAllComments()
    setShowRetryModal(false)
  }

  // FIXED: Check if comment belongs to current user
  const isOwnComment = (comment) => {
    // Primary check: user_id matches sessionId
    if (comment.user_id && sessionId) {
      return comment.user_id === sessionId
    }
    // Secondary check: user_name matches stored name
    const currentUserName = localStorage.getItem('comment_name')
    return currentUserName && comment.user_name === currentUserName
  }

  const formatTimeAgo = (date) => {
    const minutes = Math.floor((new Date() - new Date(date)) / 60000)
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    return `${days}d`
  }

  const formatNumber = (num) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="comment-section">
      {/* Retry Modal */}
      {showRetryModal && (
        <div className="retry-modal">
          <div className="retry-modal-content">
            <AlertCircle size={32} color="#ef4444" />
            <h4>Sync Issue Detected</h4>
            <p>Some comments couldn't be saved. They will be retried automatically.</p>
            <div className="retry-actions">
              <button onClick={() => setShowRetryModal(false)} className="retry-later">
                Later
              </button>
              <button onClick={handleManualSync} className="retry-now">
                <RefreshCw size={16} />
                Retry Now
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Comment Input */}
      <div className="comment-input-wrapper">
        <div className="comment-input-avatar">
          <User size={20} />
        </div>
        <div className="comment-input-container">
          {replyingTo && (
            <div className="replying-badge">
              Replying to @{comments.find(c => c.id === replyingTo)?.user_name}
              <button onClick={() => setReplyingTo(null)}><X size={14} /></button>
            </div>
          )}
          <textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            rows="2"
          />
          <div className="comment-actions">
            <div className="comment-name-display">
              Commenting as <strong>{localStorage.getItem('comment_name') || 'Guest'}</strong>
              <button onClick={() => setShowNameInput(true)} className="change-name-btn">
                Change
              </button>
            </div>
            <button 
              onClick={handleSubmit} 
              disabled={!newComment.trim() || isSubmitting}
              className="submit-btn"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
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
              <span>Saving {pendingComments.length} comment{pendingComments.length > 1 ? 's' : ''}...</span>
            </>
          ) : (
            <>
              <Clock size={14} />
              <span>{pendingComments.length} comment{pendingComments.length > 1 ? 's' : ''} will be saved</span>
              <button onClick={syncAllComments} className="sync-now-btn">
                Save now
              </button>
            </>
          )}
        </div>
      )}

      {/* Comments List */}
      <div className="comments-list">
        {loading ? (
          <div className="loading-comments">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="no-comments">No comments yet. Start the conversation!</div>
        ) : (
          <>
            {comments.map((comment) => (
              <div key={comment.id} className={`comment-item ${!comment.is_synced ? 'pending' : ''}`}>
                <div className="comment-avatar">
                  <div className="avatar-placeholder">
                    {comment.user_name?.[0]?.toUpperCase() || '?'}
                  </div>
                </div>
                <div className="comment-content">
                  <div className="comment-header">
                    <div className="comment-author">
                      {comment.user_name}
                      {!comment.is_synced && (
                        <span className="pending-badge">
                          <Clock size={10} /> Saving...
                        </span>
                      )}
                      {comment.is_edited && <span className="edited-badge">Edited</span>}
                    </div>
                    <div className="comment-time">
                      {formatTimeAgo(comment.created_at)}
                    </div>
                    {/* EDIT and DELETE buttons - now working */}
                    {isOwnComment(comment) && (
                      <div className="comment-actions-dropdown">
                        <button onClick={() => handleEdit(comment)} title="Edit comment">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => deleteComment(comment.id)} title="Delete comment">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
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
                  
                  <div className="comment-footer">
                    <button 
                      onClick={() => likeComment(comment.id)} 
                      className={`like-btn ${comment.liked_by?.includes(sessionId) ? 'liked' : ''}`}
                    >
                      <Heart size={14} />
                      <span>{formatNumber(comment.likes || 0)}</span>
                    </button>
                    <button onClick={() => setReplyingTo(comment.id)} className="reply-btn">
                      <Reply size={14} />
                      <span>Reply</span>
                    </button>
                  </div>

                  {/* Admin Reply */}
                  {comment.admin_reply && (
                    <div className="admin-reply">
                      <div className="admin-reply-header">
                        <span className="admin-badge">✓ Admin Response</span>
                        <span className="admin-name">{comment.admin_name || 'Admin'}</span>
                      </div>
                      <div className="admin-reply-content">{comment.admin_reply}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {hasMore && (
              <button onClick={loadMore} className="load-more-btn">
                Load more comments
              </button>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .comment-section {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }

        .retry-modal {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .retry-modal-content {
          background: white;
          border-radius: 12px;
          padding: 16px;
          width: 280px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          border: 1px solid #fecaca;
          text-align: center;
        }

        .retry-modal-content h4 {
          margin: 8px 0 4px;
          font-size: 14px;
          font-weight: 600;
        }

        .retry-modal-content p {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 12px;
        }

        .retry-actions {
          display: flex;
          gap: 8px;
          justify-content: center;
        }

        .retry-later, .retry-now {
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
        }

        .retry-later {
          background: #f1f5f9;
          border: none;
        }

        .retry-now {
          background: #ef4444;
          color: white;
          border: none;
          display: flex;
          align-items: center;
          gap: 6px;
        }

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

        .comment-input-wrapper {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .comment-input-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .comment-input-container {
          flex: 1;
        }

        .replying-badge {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px;
          background: #f1f5f9;
          border-radius: 8px;
          font-size: 0.75rem;
          margin-bottom: 8px;
        }

        .comment-input-container textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          resize: none;
          font-family: inherit;
          font-size: 0.85rem;
        }

        .comment-input-container textarea:focus {
          outline: none;
          border-color: #8b5cf6;
        }

        .comment-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
        }

        .comment-name-display {
          font-size: 0.7rem;
          color: #64748b;
        }

        .change-name-btn {
          background: none;
          border: none;
          color: #8b5cf6;
          cursor: pointer;
          margin-left: 6px;
        }

        .submit-btn {
          padding: 6px 16px;
          background: #8b5cf6;
          color: white;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .sync-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #fef3c7;
          border-radius: 8px;
          margin-bottom: 16px;
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

        .comments-list {
          max-height: 500px;
          overflow-y: auto;
        }

        .loading-comments, .no-comments {
          text-align: center;
          padding: 32px;
          color: #94a3b8;
          font-size: 0.85rem;
        }

        .comment-item {
          display: flex;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .comment-item.pending {
          opacity: 0.7;
        }

        .comment-avatar {
          flex-shrink: 0;
        }

        .avatar-placeholder {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: 600;
        }

        .comment-content {
          flex: 1;
        }

        .comment-header {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 4px;
        }

        .comment-author {
          font-weight: 600;
          font-size: 0.8rem;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .pending-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.6rem;
          font-weight: normal;
          color: #d97706;
          background: #fef3c7;
          padding: 2px 6px;
          border-radius: 12px;
        }

        .edited-badge {
          font-size: 0.6rem;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 12px;
        }

        .comment-time {
          font-size: 0.65rem;
          color: #94a3b8;
        }

        .comment-actions-dropdown {
          display: flex;
          gap: 4px;
          margin-left: auto;
        }

        .comment-actions-dropdown button {
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .comment-actions-dropdown button:hover {
          background: #f1f5f9;
          color: #ef4444;
        }

        .comment-text {
          font-size: 0.85rem;
          color: #334155;
          line-height: 1.5;
          margin-bottom: 8px;
        }

        .edit-mode {
          margin: 8px 0;
        }

        .edit-mode textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.85rem;
        }

        .edit-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .edit-actions button {
          padding: 4px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.7rem;
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

        .comment-footer {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .like-btn, .reply-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 0.7rem;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 20px;
          transition: all 0.2s;
        }

        .like-btn:hover, .reply-btn:hover {
          background: #f1f5f9;
        }

        .like-btn.liked {
          color: #ef4444;
        }

        .admin-reply {
          margin-top: 10px;
          padding: 10px 12px;
          background: #f0fdf4;
          border-radius: 12px;
          border-left: 3px solid #22c55e;
        }

        .admin-reply-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .admin-badge {
          font-size: 0.65rem;
          font-weight: 600;
          color: #22c55e;
        }

        .admin-name {
          font-size: 0.6rem;
          color: #64748b;
        }

        .admin-reply-content {
          font-size: 0.8rem;
          color: #1e293b;
          line-height: 1.4;
        }

        .load-more-btn {
          width: 100%;
          padding: 10px;
          background: none;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #8b5cf6;
          cursor: pointer;
          margin-top: 12px;
        }

        @media (prefers-color-scheme: dark) {
          .comment-section { border-top-color: #334155; }
          .comment-author { color: #e2e8f0; }
          .comment-text { color: #94a3b8; }
          .name-modal-content { background: #1e293b; }
          .name-input, .email-input { background: #334155; border-color: #475569; color: white; }
          .replying-badge { background: #334155; color: #e2e8f0; }
          .like-btn:hover, .reply-btn:hover { background: #334155; }
          .admin-reply { background: #064e3b; }
          .admin-reply-content { color: #e2e8f0; }
          .retry-modal-content { background: #1e293b; border-color: #7f1d1d; color: #e2e8f0; }
          .comment-actions-dropdown button:hover { background: #334155; }
        }

        @media (max-width: 640px) {
          .comment-input-wrapper { gap: 8px; }
          .comment-actions { flex-direction: column; align-items: flex-end; gap: 8px; }
        }
      `}</style>
    </div>
  )
}