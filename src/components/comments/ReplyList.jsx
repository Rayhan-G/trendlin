import React, { memo } from 'react'
import CommentItem from './CommentItem'

const ReplyList = memo(({ 
  commentId, 
  replies, 
  replyCount, 
  isExpanded, 
  onToggle, 
  onLoadMore,
  user,
  onLike,
  onReply,
  onEdit,
  onDelete,
  onShare
}) => {
  const hasMoreReplies = replies.length < replyCount
  
  return (
    <div className="replies-section">
      <button className="toggle-replies" onClick={onToggle}>
        {isExpanded ? '▼' : '▶'} View {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
      </button>
      
      {isExpanded && (
        <div className="replies-list">
          {replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              isReply={true}
              user={user}
              onLike={onLike}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onShare={onShare}
            />
          ))}
          
          {hasMoreReplies && (
            <button className="load-more-replies" onClick={() => onLoadMore(commentId)}>
              Load more replies ({replies.length}/{replyCount})
            </button>
          )}
        </div>
      )}
      
      <style jsx>{`
        .replies-section {
          margin-top: 8px;
          margin-left: 8px;
        }
        
        .toggle-replies {
          background: none;
          border: none;
          font-size: 12px;
          color: #65676b;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
        }
        
        .toggle-replies:hover {
          background: #f0f2f5;
        }
        
        .replies-list {
          margin-top: 8px;
        }
        
        .load-more-replies {
          background: none;
          border: none;
          font-size: 12px;
          color: #1877f2;
          cursor: pointer;
          padding: 8px 12px;
          margin-top: 4px;
        }
        
        .load-more-replies:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
})

ReplyList.displayName = 'ReplyList'

export default ReplyList