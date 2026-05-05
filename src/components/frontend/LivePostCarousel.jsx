// components/frontend/LivePostCarousel.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useInteractions } from '../../hooks/useInteractions'
import CommentSection from '../comments/CommentSection'
import { 
  ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, 
  Play, Volume2, VolumeX, Maximize2, CheckCircle,
  Zap, User, Send, X, Clock, Copy, Twitter, Facebook, Linkedin
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
  const [showShareOptions, setShowShareOptions] = useState({})
  const [localShareCount, setLocalShareCount] = useState({})
  const autoPlayRef = useRef(null)
  const shareMenuRef = useRef(null)

  const getSessionId = useCallback(() => {
    if (sessionId) return sessionId
    let id = localStorage.getItem('visitor_id')
    if (!id) {
      id = `v_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
      localStorage.setItem('visitor_id', id)
    }
    return id
  }, [sessionId])

  // Load comment counts
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

  // Initialize share counts
  useEffect(() => {
    const counts = {}
    posts.forEach(post => {
      counts[post.id] = post.shares || 0
    })
    setLocalShareCount(counts)
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

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setShowShareOptions({})
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleComments = (postId) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }))
  }

  // WORKING SHARE FUNCTION
  const handleShare = async (postId, platform) => {
    const url = `${window.location.origin}/live-posts/${postId}`
    const title = encodeURIComponent(currentPost?.content?.substring(0, 100) || 'Check out this post')
    
    let shareWindow = null
    
    switch (platform) {
      case 'twitter':
        shareWindow = window.open(
          `https://twitter.com/intent/tweet?text=${title}&url=${encodeURIComponent(url)}`,
          '_blank',
          'width=550,height=420,left=300,top=100'
        )
        break
      case 'facebook':
        shareWindow = window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank',
          'width=550,height=520,left=300,top=100'
        )
        break
      case 'linkedin':
        shareWindow = window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          '_blank',
          'width=550,height=520,left=300,top=100'
        )
        break
      case 'copy':
        await navigator.clipboard.writeText(url)
        setSuccessMsg(prev => ({ ...prev, [postId]: 'Link copied to clipboard!' }))
        setTimeout(() => setSuccessMsg(prev => ({ ...prev, [postId]: null })), 3000)
        break
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({ title: decodeURIComponent(title), url })
          } catch (e) {}
        }
        break
      default:
        return
    }
    
    // Update share count (only for successful shares)
    if (platform !== 'native' || (platform === 'native' && !shareWindow)) {
      setLocalShareCount(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }))
      
      // Track in background (silent, don't wait)
      try {
        await fetch(`/api/live-posts/${postId}/share`, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platform })
        }).catch(() => {})
        if (onShare) onShare(postId)
      } catch (err) {
        // Silent fail - UI already updated
      }
    }
    
    setShowShareOptions(prev => ({ ...prev, [postId]: false }))
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
  const currentShareCount = localShareCount[currentPost.id] ?? currentPost.shares ?? 0
  const isShareMenuOpen = showShareOptions[currentPost.id]

  // Use interactions hook for likes only
  const {
    likes: liveLikes,
    hasLiked: userHasLiked,
    pendingLike,
    isSyncing: isSyncingInteractions,
    toggleLike,
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

        {/* Actions */}
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
            onClick={() => setShowShareOptions(prev => ({ ...prev, [currentPost.id]: !prev[currentPost.id] }))} 
            className="knot"
          >
            <Share2 size={16} />
            <span>{formatNumber(currentShareCount)}</span>
          </button>
        </div>

        {/* Share Options Dropdown */}
        {isShareMenuOpen && (
          <div className="share-dropdown" ref={shareMenuRef}>
            <button onClick={() => handleShare(currentPost.id, 'native')} className="share-option mobile-only">
              📱 Share via...
            </button>
            <button onClick={() => handleShare(currentPost.id, 'copy')} className="share-option">
              <Copy size={14} />
              Copy link
            </button>
            <button onClick={() => handleShare(currentPost.id, 'twitter')} className="share-option twitter">
              <Twitter size={14} />
              Twitter
            </button>
            <button onClick={() => handleShare(currentPost.id, 'facebook')} className="share-option facebook">
              <Facebook size={14} />
              Facebook
            </button>
            <button onClick={() => handleShare(currentPost.id, 'linkedin')} className="share-option linkedin">
              <Linkedin size={14} />
              LinkedIn
            </button>
          </div>
        )}

        {/* Sync Status */}
        {pendingLike !== undefined && (
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

        {/* Success/Error Messages */}
        {successMsg[currentPost.id] && (
          <div className="success-message">
            <CheckCircle size={14} />
            {successMsg[currentPost.id]}
          </div>
        )}
        {errorMsg[currentPost.id] && (
          <div className="error-message">
            <X size={12} />
            {errorMsg[currentPost.id]}
          </div>
        )}

        {/* Comments Section */}
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

        /* Share Dropdown */
        .share-dropdown {
          position: absolute;
          right: 0;
          top: 100%;
          margin-top: 8px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          padding: 0.5rem;
          min-width: 160px;
          z-index: 30;
          border: 1px solid #eef2f6;
        }

        .share-option {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 0.5rem 0.75rem;
          background: none;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.8rem;
          color: #1e293b;
          transition: all 0.2s;
        }

        .share-option:hover {
          background: #f1f5f9;
        }

        .share-option.twitter:hover { color: #1da1f2; }
        .share-option.facebook:hover { color: #1877f2; }
        .share-option.linkedin:hover { color: #0077b5; }

        .mobile-only {
          display: none;
        }

        @media (max-width: 768px) {
          .mobile-only {
            display: flex;
          }
        }

        /* Sync Status */
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

        /* Messages */
        .success-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #22c55e10;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.7rem;
          color: #22c55e;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #ef444410;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.7rem;
          color: #ef4444;
        }

        /* Navigation */
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
          .nav-prev, .nav-next { border-color: #334155; color: #94a3b8; }
          .share-dropdown {
            background: #1e293b;
            border-color: #334155;
          }
          .share-option {
            color: #e2e8f0;
          }
          .share-option:hover {
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
          .share-dropdown { right: -20px; min-width: 150px; }
        }
      `}</style>
    </div>
  )
}