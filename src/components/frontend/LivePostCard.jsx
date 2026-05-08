import { memo, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DOMPurify from 'dompurify'
import PostActions from './LivePostActions'
import ShareMenu from './LivePostShareMenu'
import MoreMenu from './LivePostMoreMenu'
import ImageGallery from './LivePostImageGallery'

const PostCard = memo(({ 
  post, 
  isExpanded, 
  onToggleExpand, 
  onLike, 
  onCommentToggle,
  showComments,
  commentCount,
  shareCount,
  likes,
  hasLiked,
  isSyncing,
  pendingLike,
  sessionId
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const displayContent = isExpanded ? post.content : post.content?.substring(0, 280)
  const sanitizedHTML = DOMPurify.sanitize(displayContent || post.content)

  return (
    <motion.div 
      className="post-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="more-wrapper">
        <MoreMenu postId={post.id} />
      </div>

      <div className="content">
        <motion.div 
          className="content-text"
          dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        />
        {post.content?.length > 280 && (
          <motion.button 
            onClick={onToggleExpand}
            className="read-more"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label={isExpanded ? "Show less" : "Read more"}
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </motion.button>
        )}
      </div>

      {post.media_items && post.media_items.length > 0 && (
        <ImageGallery images={post.media_items} />
      )}

      <PostActions
        likes={likes}
        hasLiked={hasLiked}
        onLike={onLike}
        commentCount={commentCount}
        onCommentToggle={onCommentToggle}
        shareCount={shareCount}
        isSyncing={isSyncing}
        pendingLike={pendingLike}
        showComments={showComments}
      />

      <style jsx>{`
        .post-card {
          position: relative;
        }
        
        .more-wrapper {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 10;
        }
        
        .content {
          padding: 24px 24px 0 24px;
        }
        
        .content-text {
          font-size: 16px;
          line-height: 1.75;
          font-weight: 400;
          letter-spacing: -0.01em;
          color: var(--text-primary);
        }
        
        .read-more {
          display: inline-block;
          margin-top: 12px;
          font-size: 14px;
          font-weight: 600;
          color: var(--primary);
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .read-more:hover {
          color: var(--primary-hover);
        }
        
        @media (max-width: 768px) {
          .content {
            padding: 20px 20px 0 20px;
          }
          
          .content-text {
            font-size: 15px;
            line-height: 1.6;
          }
        }
      `}</style>
    </motion.div>
  )
})

PostCard.displayName = 'PostCard'

export default PostCard