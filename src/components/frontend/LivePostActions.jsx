import { memo } from 'react'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Share2 } from 'lucide-react'

const PostActions = memo(({ 
  likes, 
  hasLiked, 
  onLike, 
  commentCount, 
  onCommentToggle,
  shareCount,
  isSyncing,
  pendingLike,
  showComments
}) => {
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num?.toString() || '0'
  }

  // Heart bounce animation
  const heartVariants = {
    idle: { scale: 1 },
    liked: { 
      scale: [1, 1.3, 1],
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  }

  return (
    <div className="actions">
      <motion.button 
        onClick={onLike}
        className={`action like ${hasLiked ? 'active' : ''}`}
        disabled={isSyncing}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        animate={hasLiked ? "liked" : "idle"}
        variants={heartVariants}
        aria-label={hasLiked ? "Unlike post" : "Like post"}
      >
        <Heart 
          size={24} 
          fill={hasLiked ? '#ef4444' : 'none'}
          strokeWidth={hasLiked ? 0 : 2}
        />
        <span className="action-count">{formatNumber(likes)}</span>
        {pendingLike !== undefined && <span className="pending" />}
      </motion.button>
      
      <motion.button 
        onClick={onCommentToggle}
        className={`action comment ${showComments ? 'active' : ''}`}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        aria-label={showComments ? "Hide comments" : "Show comments"}
        aria-expanded={showComments}
      >
        <MessageCircle size={24} />
        <span className="action-count">{formatNumber(commentCount)}</span>
      </motion.button>
      
      <motion.button 
        className="action share"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        aria-label="Share post"
      >
        <Share2 size={24} />
        <span className="action-count">{formatNumber(shareCount)}</span>
      </motion.button>

      <style jsx>{`
        .actions {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 24px 20px 24px;
          border-top: 1px solid var(--border-color);
          margin-top: 12px;
        }
        
        .action {
          display: flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 10px 18px;
          border-radius: 999px;
          font-size: 15px;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
          position: relative;
          overflow: hidden;
        }
        
        .action::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--hover-bg);
          border-radius: 999px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .action:hover::before {
          opacity: 1;
        }
        
        .action-count {
          font-weight: 600;
          font-size: 14px;
        }
        
        .like.active {
          color: #ef4444;
        }
        
        .like.active .action-count {
          color: #ef4444;
        }
        
        .comment.active {
          color: var(--primary);
        }
        
        .comment.active .action-count {
          color: var(--primary);
        }
        
        .pending {
          width: 6px;
          height: 6px;
          background: #f59e0b;
          border-radius: 50%;
          animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        
        @media (max-width: 768px) {
          .actions {
            padding: 12px 20px 16px 20px;
            gap: 4px;
          }
          
          .action {
            padding: 8px 14px;
          }
          
          .action span:not(.pending) {
            display: none;
          }
          
          .action-count {
            display: inline !important;
          }
        }
      `}</style>
    </div>
  )
})

PostActions.displayName = 'PostActions'

export default PostActions