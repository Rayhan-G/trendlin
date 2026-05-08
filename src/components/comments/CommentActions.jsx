import React, { memo } from 'react'

const CommentActions = memo(({ 
  liked, 
  likesCount, 
  onLike, 
  onReply, 
  onShare, 
  isOwner, 
  onEdit, 
  onDelete,
  showActions,
  setShowActions
}) => {
  const formatNumber = (num) => {
    if (!num) return '0'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="comment-actions">
      <button className={`action-btn like-btn ${liked ? 'active' : ''}`} onClick={onLike}>
        👍 {likesCount > 0 && <span className="count">{formatNumber(likesCount)}</span>}
      </button>
      
      <button className="action-btn reply-btn" onClick={onReply}>
        💬 Reply
      </button>
      
      <button className="action-btn share-btn" onClick={onShare}>
        🔗 Share
      </button>
      
      {isOwner && (
        <div className="action-dropdown">
          <button onClick={() => setShowActions(!showActions)}>⋯</button>
          {showActions && (
            <div className="dropdown-menu">
              <button onClick={onEdit}>✏️ Edit</button>
              <button onClick={onDelete}>🗑️ Delete</button>
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        .comment-actions {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }
        
        .action-btn {
          background: none;
          border: none;
          font-size: 12px;
          color: #65676b;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        
        .action-btn:hover {
          background: #e4e6eb;
        }
        
        .like-btn.active {
          color: #1877f2;
        }
        
        .count {
          margin-left: 2px;
        }
        
        .action-dropdown {
          position: relative;
          margin-left: auto;
        }
        
        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 4px;
          min-width: 100px;
          z-index: 10;
        }
        
        .dropdown-menu button {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 13px;
          text-align: left;
        }
        
        .dropdown-menu button:hover {
          background: #f0f2f5;
        }
      `}</style>
    </div>
  )
})

CommentActions.displayName = 'CommentActions'

export default CommentActions