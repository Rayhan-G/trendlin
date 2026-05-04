// components/frontend/LivePostCarousel.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useInteractions } from '../../hooks/useInteractions'
import CommentSection from '../comments/CommentSection'
import { 
  ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, 
  Play, Volume2, VolumeX, Maximize2, CheckCircle,
  Zap, User, Send, X, Twitter, Facebook, Linkedin, Copy, Clock
} from 'lucide-react'

export default function LivePostCarousel({ posts, autoPlayInterval = 5000, onLike, onShare, sessionId }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isHovering, setIsHovering] = useState(false)
  const [showComments, setShowComments] = useState({})
  const [commentCounts, setCommentCounts] = useState({})
  const [expandedContent, setExpandedContent] = useState({})
  const [errorMsg, setErrorMsg] = useState({})
  const [successMsg, setSuccessMsg] = useState({})
  const [showShareModal, setShowShareModal] = useState({})
  const autoPlayRef = useRef(null)
  const shareModalRef = useRef(null)

  const getSessionId = useCallback(() => {
    if (sessionId) return sessionId
    let id = localStorage.getItem('visitor_id')
    if (!id) {
      id = `v_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
      localStorage.setItem('visitor_id', id)
    }
    return id
  }, [sessionId])

  // Load comment counts for all posts
  useEffect(() => {
    const loadAllCommentCounts = async () => {
      const counts = {}
      for (const post of posts) {
        const { count } = await supabase
          .from('live_post_comments')
          .select('*', { count: 'exact', head: true })
          .eq('live_post_id', post.id)
        counts[post.id] = count || 0
      }
      setCommentCounts(counts)
    }
    if (posts.length > 0) loadAllCommentCounts()
  }, [posts])

  // Auto-play
  useEffect(() => {
    if (isAutoPlaying && posts.length > 1 && !isHovering) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % posts.length)
      }, autoPlayInterval)
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    }
  }, [isAutoPlaying, posts.length, autoPlayInterval, isHovering])

  // Close share modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareModalRef.current && !shareModalRef.current.contains(event.target)) {
        setShowShareModal({})
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Toggle comments section
  const toggleComments = (postId) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }))
  }

  // SHARE FUNCTION
  const handleShareClick = (postId, platform) => {
    const url = `${window.location.origin}/live-posts/${postId}`
    const title = encodeURIComponent('Check out this post on Trendlin')
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${title}&url=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420')
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=550,height=520')
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=550,height=520')
        break
      case 'copy':
        navigator.clipboard.writeText(url)
        setSuccessMsg(prev => ({ ...prev, [postId]: 'Link copied!' }))
        setTimeout(() => setSuccessMsg(prev => ({ ...prev, [postId]: null })), 2000)
        setShowShareModal(prev => ({ ...prev, [postId]: false }))
        return
    }
    
    setShowShareModal(prev => ({ ...prev, [postId]: false }))
  }

  const goToSlide = (index) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % posts.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  if (!posts || posts.length === 0) return null

  const currentPost = posts[currentIndex]
  const isExpanded = expandedContent[currentPost.id]
  const displayContent = isExpanded ? currentPost.content : currentPost.content?.substring(0, 280)
  const isCommentsOpen = showComments[currentPost.id]
  const currentCommentCount = commentCounts[currentPost.id] ?? currentPost.comments_count ?? 0

  // Use the interactions hook for the current post
  const {
    likes: liveLikes,
    shares: liveShares,
    hasLiked: userHasLiked,
    pendingLike,
    pendingShare,
    isSyncing: isSyncingInteractions,
    toggleLike,
    incrementShare
  } = useInteractions(currentPost.id, getSessionId())

  const getTimeLeft = () => {
    if (!currentPost.expires_at) return null
    const diff = new Date(currentPost.expires_at) - new Date()
    if (diff <= 0) return null
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % 3600000) / 60000)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <div 
      className="connected-carousel"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="connection-thread">
        <div className="thread-line"></div>
        <div className="thread-dots">
          {posts.map((_, idx) => (
            <div 
              key={idx} 
              className={`thread-dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(idx)}
            />
          ))}
        </div>
      </div>

      <div className="content-node">
        {/* Category Header */}
        <div className="category-marker">
          <span className="category-dot" />
          <span className="category-name">{currentPost.category}</span>
          {getTimeLeft() && (
            <span className="time-mark">
              <Zap size={10} />
              {getTimeLeft()} remaining
            </span>
          )}
        </div>

        {/* Content */}
        <div className="content-block">
          {currentPost.content ? (
            <>
              <div className="content-text">
                <div dangerouslySetInnerHTML={{ __html: displayContent || currentPost.content }} />
              </div>
              {currentPost.content.length > 280 && (
                <button onClick={() => setExpandedContent(prev => ({ ...prev, [currentPost.id]: !prev[currentPost.id] }))} className="expand-link">
                  {isExpanded ? 'Show less' : 'Continue reading'}
                  <ChevronRight size={14} />
                </button>
              )}
            </>
          ) : (
            <p className="empty-content">No description provided</p>
          )}
        </div>

        {/* Media */}
        {currentPost.media_items && currentPost.media_items.length > 0 && (
          <div className="media-node">
            {currentPost.media_items.slice(0, 2).map((media, idx) => (
              <div key={idx} className={`media-piece ${currentPost.media_items.length === 1 ? 'single' : 'pair'}`}>
                <img src={media.url} alt="" loading="lazy" />
              </div>
            ))}
            {currentPost.media_items.length > 2 && (
              <div className="media-more">+{currentPost.media_items.length - 2}</div>
            )}
          </div>
        )}

        {/* Actions with Interactions */}
        <div className="action-knots">
          <button 
            onClick={toggleLike} 
            className={`knot like ${userHasLiked ? 'active' : ''}`}
            disabled={isSyncingInteractions}
          >
            <Heart size={16} fill={userHasLiked ? '#ef4444' : 'none'} />
            <span>{formatNumber(liveLikes)}</span>
            {pendingLike !== undefined && (
              <span className="pending-indicator" title="Will be saved soon">
                <Clock size={10} />
              </span>
            )}
          </button>
          
          <button 
            onClick={() => toggleComments(currentPost.id)} 
            className={`knot ${isCommentsOpen ? 'active' : ''}`}
          >
            <MessageCircle size={16} />
            <span>{formatNumber(currentCommentCount)}</span>
          </button>
          
          <button 
            onClick={() => setShowShareModal(prev => ({ ...prev, [currentPost.id]: !prev[currentPost.id] }))} 
            className="knot"
          >
            <Share2 size={16} />
            <span>{formatNumber(liveShares)}</span>
            {pendingShare !== undefined && (
              <span className="pending-indicator" title="Will be saved soon">
                <Clock size={10} />
              </span>
            )}
          </button>
        </div>

        {/* Sync Status */}
        {(pendingLike !== undefined || pendingShare !== undefined) && (
          <div className="sync-status-bar">
            <div className="sync-status-content">
              {isSyncingInteractions ? (
                <>
                  <div className="sync-spinner-small" />
                  <span>Saving your interaction...</span>
                </>
              ) : (
                <>
                  <Clock size={12} />
                  <span>Will be saved in background</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal[currentPost.id] && (
          <div className="share-modal" ref={shareModalRef}>
            <div className="share-modal-header">
              <span>Share this story</span>
              <button onClick={() => setShowShareModal(prev => ({ ...prev, [currentPost.id]: false }))}>
                <X size={16} />
              </button>
            </div>
            <div className="share-buttons">
              <button onClick={() => {
                incrementShare()
                handleShareClick(currentPost.id, 'twitter')
              }} className="share-btn twitter">
                <Twitter size={18} />
                <span>Twitter</span>
              </button>
              <button onClick={() => {
                incrementShare()
                handleShareClick(currentPost.id, 'facebook')
              }} className="share-btn facebook">
                <Facebook size={18} />
                <span>Facebook</span>
              </button>
              <button onClick={() => {
                incrementShare()
                handleShareClick(currentPost.id, 'linkedin')
              }} className="share-btn linkedin">
                <Linkedin size={18} />
                <span>LinkedIn</span>
              </button>
              <button onClick={() => handleShareClick(currentPost.id, 'copy')} className="share-btn copy">
                <Copy size={18} />
                <span>Copy link</span>
              </button>
            </div>
          </div>
        )}

        {/* Comments Section - Integrated CommentSection Component */}
        {isCommentsOpen && (
          <CommentSection 
            postId={currentPost.id}
            sessionId={getSessionId()}
            commentCount={currentCommentCount}
            onCommentCountChange={(newCount) => {
              setCommentCounts(prev => ({ ...prev, [currentPost.id]: newCount }))
            }}
          />
        )}

        {/* Navigation */}
        {posts.length > 1 && (
          <div className="nav-controls">
            <button onClick={prevSlide} className="nav-prev"><ChevronLeft size={20} /></button>
            <div className="position-mark">{currentIndex + 1} / {posts.length}</div>
            <button onClick={nextSlide} className="nav-next"><ChevronRight size={20} /></button>
          </div>
        )}
      </div>

      <style jsx>{`
        .connected-carousel {
          position: relative;
          max-width: 580px;
          margin: 2rem auto;
          padding-top: 2rem;
        }

        .connection-thread {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
        }

        .thread-line {
          position: absolute;
          top: 8px;
          left: 10%;
          right: 10%;
          height: 1px;
          background: repeating-linear-gradient(90deg, #8b5cf6 0px, #8b5cf6 4px, transparent 4px, transparent 12px);
        }

        .thread-dots {
          display: flex;
          justify-content: center;
          gap: 12px;
          position: relative;
          z-index: 2;
        }

        .thread-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #cbd5e1;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .thread-dot.active {
          width: 24px;
          border-radius: 3px;
          background: #8b5cf6;
        }

        .content-node {
          animation: fadeSlide 0.4s ease;
        }

        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .category-marker {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.75rem;
        }

        .category-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #8b5cf6;
        }

        .category-name {
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .time-mark {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #94a3b8;
          font-family: monospace;
          font-size: 0.7rem;
        }

        .content-block {
          margin-bottom: 2rem;
        }

        .content-text {
          font-size: 1rem;
          line-height: 1.7;
          color: #1e293b;
        }

        .empty-content {
          color: #94a3b8;
          font-style: italic;
        }

        .expand-link {
          margin-top: 0.75rem;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #8b5cf6;
          font-size: 0.8rem;
          background: none;
          border: none;
          cursor: pointer;
        }

        .media-node {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: #f1f5f9;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 2rem;
        }

        .media-piece {
          background: #f8fafc;
          aspect-ratio: 16/9;
          overflow: hidden;
        }

        .media-piece.single {
          grid-column: span 2;
        }

        .media-piece img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .media-more {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(8px);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.7rem;
          color: white;
          font-weight: 500;
        }

        .action-knots {
          display: flex;
          gap: 2rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .knot {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
          padding: 4px 8px;
          border-radius: 8px;
          position: relative;
        }

        .knot:hover {
          color: #8b5cf6;
          background: rgba(139, 92, 246, 0.05);
        }

        .knot.like.active {
          color: #ef4444;
        }

        .knot.active {
          color: #8b5cf6;
        }

        .knot:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pending-indicator {
          display: inline-flex;
          margin-left: 2px;
          color: #f59e0b;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .sync-status-bar {
          margin: 8px 0;
          padding: 6px 12px;
          background: #fef3c7;
          border-radius: 8px;
          font-size: 0.7rem;
          color: #d97706;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sync-status-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sync-spinner-small {
          width: 12px;
          height: 12px;
          border: 2px solid #d97706;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .share-modal {
          position: absolute;
          bottom: 100%;
          right: 0;
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          padding: 1rem;
          z-index: 20;
          margin-bottom: 8px;
          border: 1px solid #e2e8f0;
          min-width: 180px;
        }

        .share-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.75rem;
          margin-bottom: 0.75rem;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.8rem;
          font-weight: 600;
          color: #1e293b;
        }

        .share-modal-header button {
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
          padding: 4px;
          border-radius: 6px;
        }

        .share-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .share-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background: none;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s;
          width: 100%;
          text-align: left;
        }

        .share-btn.twitter { color: #1DA1F2; }
        .share-btn.facebook { color: #4267B2; }
        .share-btn.linkedin { color: #0077B5; }
        .share-btn.copy { color: #64748b; }

        .share-btn:hover {
          background: #f1f5f9;
          transform: translateX(4px);
        }

        .nav-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 1.5rem;
        }

        .nav-prev, .nav-next {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: transparent;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          transition: all 0.2s;
        }

        .nav-prev:hover, .nav-next:hover {
          background: #8b5cf6;
          border-color: #8b5cf6;
          color: white;
          transform: scale(1.05);
        }

        .position-mark {
          font-size: 0.7rem;
          color: #94a3b8;
          font-family: monospace;
        }

        @media (prefers-color-scheme: dark) {
          .content-text { color: #e2e8f0; }
          .media-node { background: #1e293b; }
          .media-piece { background: #0f172a; }
          .action-knots { border-bottom-color: #1e293b; }
          .name-field, .message-group textarea { border-bottom-color: #334155; color: #e2e8f0; }
          .comment-item { border-bottom-color: #1e293b; }
          .comment-author { color: #e2e8f0; }
          .comment-text { color: #94a3b8; }
          .nav-prev, .nav-next { border-color: #334155; color: #94a3b8; }
          .share-modal {
            background: #1e293b;
            border-color: #334155;
          }
          .share-modal-header {
            border-bottom-color: #334155;
            color: #f1f5f9;
          }
          .share-btn:hover {
            background: #334155;
          }
          .sync-status-bar {
            background: #451a03;
            color: #fbbf24;
          }
          .sync-spinner-small {
            border-color: #fbbf24;
            border-top-color: transparent;
          }
        }

        @media (max-width: 640px) {
          .connected-carousel { max-width: 100%; margin: 1rem auto; padding-top: 1rem; }
          .action-knots { gap: 1rem; }
          .share-modal { right: -40px; min-width: 160px; }
        }
      `}</style>
    </div>
  )
}