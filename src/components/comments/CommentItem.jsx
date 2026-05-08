import React, { useState, memo } from 'react'
import CommentActions from './CommentActions'
import ReplyList from './ReplyList'
import EditCommentForm from './EditCommentForm'

const CommentItem = memo(({ 
  comment, 
  isReply = false,
  user,
  onLike,
  onReply,
  onEdit,
  onDelete,
  onShare,
  replies = [],
  replyCount = 0,
  isExpanded = false,
  onToggleReplies,
  onLoadMoreReplies
}) => {
  const [showActions, setShowActions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [liked, setLiked] = useState(comment.user_liked || false)
  const [likesCount, setLikesCount] = useState(comment.likes_count || 0)
  
  const isOwner = user?.id === comment.user_id

  const handleLike = () => {
    if (!user) return
    setLiked(!liked)
    setLikesCount(prev => liked ? prev - 1 : prev + 1)
    onLike(comment.id)
  }

  const handleEdit = (newContent) => {
    onEdit(comment.id, newContent)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (confirm('Delete this comment?')) {
      onDelete(comment.id, comment.parent_id)
    }
  }

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d`
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className={`comment-item ${isReply ? 'reply' : ''}`}>
      <div className="comment-avatar">
        <div className="avatar-placeholder">
          {comment.user_name?.[0]?.toUpperCase() || 'A'}
        </div>
      </div>
      
      <div className="comment-main">
        <div className="comment-bubble">
          <div className="comment-header">
            <span className="comment-name">{comment.user_name}</span>
            <span className="comment-time">{timeAgo(comment.created_at)}</span>
            {comment.is_edited && <span className="edited-badge">Edited</span>}
          </div>
          
          {isEditing ? (
            <EditCommentForm
              initialContent={comment.content}
              onSave={handleEdit}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="comment-text">{comment.content}</div>
          )}
          
          <CommentActions
            liked={liked}
            likesCount={likesCount}
            onLike={handleLike}
            onReply={() => onReply(comment)}
            onShare={() => onShare(comment)}
            isOwner={isOwner}
            onEdit={() => setIsEditing(true)}
            onDelete={handleDelete}
            showActions={showActions}
            setShowActions={setShowActions}
          />
        </div>
        
        {!isReply && (replies.length > 0 || replyCount > 0) && (
          <ReplyList
            commentId={comment.id}
            replies={replies}
            replyCount={replyCount}
            isExpanded={isExpanded}
            onToggle={onToggleReplies}
            onLoadMore={onLoadMoreReplies}
            user={user}
            onLike={onLike}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onShare={onShare}
          />
        )}
      </div>

      <style jsx>{`
        .comment-item {
          display: flex;
          gap: 12px;
          padding: 12px 0;
        }
        
        .comment-item.reply {
          margin-left: 48px;
        }
        
        .comment-avatar {
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
        
        .comment-main {
          flex: 1;
        }
        
        .comment-bubble {
          background: #f0f2f5;
          border-radius: 18px;
          padding: 10px 14px;
        }
        
        .comment-header {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 6px;
          flex-wrap: wrap;
        }
        
        .comment-name {
          font-weight: 600;
          font-size: 13px;
          color: #050505;
        }
        
        .comment-time {
          font-size: 11px;
          color: #65676b;
        }
        
        .edited-badge {
          font-size: 11px;
          color: #65676b;
          font-style: italic;
        }
        
        .comment-text {
          font-size: 14px;
          color: #050505;
          line-height: 1.4;
          word-wrap: break-word;
        }
        
        @media (max-width: 768px) {
          .comment-item.reply {
            margin-left: 36px;
          }
        }
      `}</style>
    </div>
  )
})

CommentItem.displayName = 'CommentItem'

export default CommentItem