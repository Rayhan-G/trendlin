import React, { useState, useRef, useEffect, memo } from 'react'

const CommentInput = memo(({ user, replyTo, onSubmit, onCancelReply, isSubmitting }) => {
  const [content, setContent] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    if (replyTo && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [replyTo])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!content.trim() || isSubmitting) return
    onSubmit(content.trim())
    setContent('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  if (!user) return null

  return (
    <div className="comment-input-section">
      <div className="input-avatar">
        <div className="avatar-placeholder small">
          {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
        </div>
      </div>
      
      <div className="input-wrapper">
        {replyTo && (
          <div className="reply-indicator">
            <span>Replying to <strong>{replyTo.user_name}</strong></span>
            <button onClick={onCancelReply}>✕</button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="comment-form">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={replyTo ? `Reply to ${replyTo.user_name}...` : "Write a comment..."}
            rows="2"
            disabled={isSubmitting}
          />
          <button type="submit" disabled={!content.trim() || isSubmitting}>
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </form>
      </div>
      
      <style jsx>{`
        .comment-input-section {
          display: flex;
          gap: 12px;
          padding: 16px 0;
        }
        
        .input-avatar {
          flex-shrink: 0;
        }
        
        .avatar-placeholder {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1877f2, #0c5fd9);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 16px;
        }
        
        .avatar-placeholder.small {
          width: 36px;
          height: 36px;
          font-size: 14px;
        }
        
        .input-wrapper {
          flex: 1;
        }
        
        .reply-indicator {
          background: #e7f3ff;
          padding: 6px 12px;
          border-radius: 8px;
          margin-bottom: 8px;
          font-size: 13px;
          color: #1877f2;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .reply-indicator button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          color: #65676b;
        }
        
        .comment-form {
          display: flex;
          gap: 12px;
          align-items: flex-end;
          background: #f0f2f5;
          border-radius: 20px;
          padding: 8px 12px;
        }
        
        .comment-form textarea {
          flex: 1;
          background: transparent;
          border: none;
          resize: none;
          font-family: inherit;
          font-size: 14px;
          outline: none;
          padding: 6px 0;
          max-height: 100px;
        }
        
        .comment-form button {
          background: #1877f2;
          color: white;
          border: none;
          border-radius: 20px;
          padding: 6px 16px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .comment-form button:hover:not(:disabled) {
          background: #166fe5;
        }
        
        .comment-form button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
})

CommentInput.displayName = 'CommentInput'

export default CommentInput