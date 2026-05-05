// components/frontend/LivePostCarousel.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../../lib/supabase'
import { useInteractions } from '../../hooks/useInteractions'
import CommentSection from '../comments/CommentSection'
import { 
  ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, 
  Play, Volume2, VolumeX, Maximize2, CheckCircle,
  Zap, User, Send, X, Clock, Copy
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LivePostCarousel({ posts, autoPlayInterval = 5000, onLike, onShare, sessionId }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isHovering, setIsHovering] = useState(false)
  const [showComments, setShowComments] = useState({})
  const [commentCounts, setCommentCounts] = useState({})
  const [expandedContent, setExpandedContent] = useState({})
  const [errorMsg, setErrorMsg] = useState({})
  const [successMsg, setSuccessMsg] = useState({})
  const [showShareOptions, setShowShareOptions] = useState({})
  const [localShareCount, setLocalShareCount] = useState({})
  const [shareMenuPosition, setShareMenuPosition] = useState({ top: 0, left: 0, direction: 'up' })
  const autoPlayRef = useRef(null)
  const shareButtonRef = useRef({})

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
        setDirection(1)
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
      const isOutside = Object.keys(shareButtonRef.current).every(postId => {
        const button = shareButtonRef.current[postId]
        const menu = document.getElementById(`share-menu-portal-${postId}`)
        return button && !button.contains(event.target) && menu && !menu.contains(event.target)
      })
      if (isOutside) setShowShareOptions({})
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleComments = (postId) => setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }))

  const handleShare = async (postId, platform) => {
    const currentPostData = posts.find(p => p.id === postId)
    if (!currentPostData) return
    
    const url = `${window.location.origin}/live-posts/${postId}`
    const title = encodeURIComponent(currentPostData?.content?.substring(0, 100) || 'Check out this post')
    const text = encodeURIComponent(currentPostData?.content?.substring(0, 200) || 'Check out this post on Trendlin')
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${title}&url=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420,left=300,top=100')
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=550,height=520,left=300,top=100')
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=550,height=520,left=300,top=100')
        break
      case 'whatsapp':
        window.open(`https://wa.me/?text=${title}%20${encodeURIComponent(url)}`, '_blank', 'width=550,height=420,left=300,top=100')
        break
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${title}`, '_blank', 'width=550,height=420,left=300,top=100')
        break
      case 'email':
        window.location.href = `mailto:?subject=${title}&body=${text}%0A%0A${encodeURIComponent(url)}`
        break
      case 'copy':
        await navigator.clipboard.writeText(url)
        setSuccessMsg(prev => ({ ...prev, [postId]: 'Link copied!' }))
        setTimeout(() => setSuccessMsg(prev => ({ ...prev, [postId]: null })), 3000)
        setShowShareOptions(prev => ({ ...prev, [postId]: false }))
        return
      default:
        return
    }
    
    setLocalShareCount(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }))
    try { await fetch(`/api/live-posts/${postId}/share`, { method: 'POST' }).catch(() => {}) } catch (err) {}
    setShowShareOptions(prev => ({ ...prev, [postId]: false }))
  }

  const openShareMenu = (postId) => {
    const button = shareButtonRef.current[postId]
    if (button) {
      const rect = button.getBoundingClientRect()
      const spaceAbove = rect.top
      const spaceBelow = window.innerHeight - rect.bottom
      const direction = spaceAbove > spaceBelow ? 'up' : 'down'
      
      setShareMenuPosition({
        top: direction === 'up' ? rect.top - 10 : rect.bottom + 10,
        left: rect.right - 180,
        direction
      })
    }
    setShowShareOptions(prev => ({ ...prev, [postId]: true }))
  }

  const goToSlide = (index, dir = index > currentIndex ? 1 : -1) => {
    setDirection(dir)
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const nextSlide = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % posts.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const prevSlide = () => {
    setDirection(-1)
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

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 400 : -400,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
    },
    exit: (direction) => ({
      x: direction > 0 ? -400 : 400,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    })
  }

  return (
    <div className="million-dollar-carousel">
      {/* Main Carousel */}
      <div className="carousel-viewport">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="carousel-slide"
          >
            <div className="premium-card">
              {/* Category Badge */}
              <div className="category-badge">
                <span className="badge-dot" />
                <span className="badge-text">{currentPost.category}</span>
                {getTimeLeft() && (
                  <div className="time-chip">
                    <Zap size={10} />
                    <span>{getTimeLeft()}</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="content-area">
                {currentPost.content ? (
                  <>
                    <div className="rich-content">
                      <div dangerouslySetInnerHTML={{ __html: displayContent || currentPost.content }} />
                    </div>
                    {currentPost.content.length > 280 && (
                      <button onClick={() => setExpandedContent(prev => ({ ...prev, [currentPost.id]: !prev[currentPost.id] }))} className="read-more">
                        {isExpanded ? 'Show less' : 'Read more'}
                        <ChevronRight size={14} className="read-more-icon" />
                      </button>
                    )}
                  </>
                ) : (
                  <p className="empty-state">No description provided</p>
                )}
              </div>

              {/* Media Grid */}
              {currentPost.media_items && currentPost.media_items.length > 0 && (
                <div className={`media-grid ${currentPost.media_items.length === 1 ? 'single' : 'grid-2'}`}>
                  {currentPost.media_items.slice(0, 2).map((media, idx) => (
                    <div key={idx} className="media-frame">
                      <img src={media.url} alt="" loading="lazy" />
                      {currentPost.media_items.length > 2 && idx === 0 && (
                        <div className="media-overlay">
                          <span>+{currentPost.media_items.length - 2}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Action Bar */}
              <div className="action-bar-premium">
                <button 
                  onClick={toggleLike} 
                  className={`action-premium like ${userHasLiked ? 'active' : ''}`}
                  disabled={isSyncingInteractions}
                >
                  <Heart size={18} fill={userHasLiked ? '#ef4444' : 'none'} />
                  <span>{formatNumber(liveLikes)}</span>
                </button>
                
                <button 
                  onClick={() => toggleComments(currentPost.id)} 
                  className={`action-premium comment ${isCommentsOpen ? 'active' : ''}`}
                >
                  <MessageCircle size={18} />
                  <span>{formatNumber(currentCommentCount)}</span>
                </button>
                
                <div className="share-wrapper">
                  <button 
                    ref={el => shareButtonRef.current[currentPost.id] = el}
                    onClick={() => openShareMenu(currentPost.id)} 
                    className="action-premium share"
                  >
                    <Share2 size={18} />
                    <span>{formatNumber(currentShareCount)}</span>
                  </button>
                </div>
              </div>

              {/* Status Messages */}
              {successMsg[currentPost.id] && (
                <div className="status-chip success">
                  <CheckCircle size={12} />
                  {successMsg[currentPost.id]}
                </div>
              )}
              {errorMsg[currentPost.id] && (
                <div className="status-chip error">
                  <X size={12} />
                  {errorMsg[currentPost.id]}
                </div>
              )}

              {/* Comments Section */}
              <AnimatePresence>
                {isCommentsOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="comments-wrapper"
                  >
                    <CommentSection 
                      postId={currentPost.id}
                      sessionId={getSessionId()}
                      commentCount={currentCommentCount}
                      onCommentCountChange={(newCount) => {
                        setCommentCounts(prev => ({ ...prev, [currentPost.id]: newCount }))
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {posts.length > 1 && (
        <div className="nav-premium">
          <button onClick={prevSlide} className="nav-btn-premium prev">
            <ChevronLeft size={20} />
          </button>
          <div className="nav-dots">
            {posts.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx, idx > currentIndex ? 1 : -1)}
                className={`nav-dot ${idx === currentIndex ? 'active' : ''}`}
              />
            ))}
          </div>
          <button onClick={nextSlide} className="nav-btn-premium next">
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Portal Share Menu - Renders at body level, never gets cut off */}
      {isShareMenuOpen && typeof document !== 'undefined' && createPortal(
        <motion.div 
          id={`share-menu-portal-${currentPost.id}`}
          className={`share-menu-portal ${shareMenuPosition.direction}`}
          style={{
            position: 'fixed',
            top: shareMenuPosition.top,
            left: shareMenuPosition.left,
            zIndex: 99999,
          }}
          initial={{ opacity: 0, scale: 0.95, y: shareMenuPosition.direction === 'up' ? 10 : -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: shareMenuPosition.direction === 'up' ? 10 : -10 }}
          transition={{ duration: 0.15 }}
        >
          <div className="share-menu-arrow" />
          <button onClick={() => handleShare(currentPost.id, 'copy')} className="share-option-portal">
            <Copy size={14} />
            <span>Copy link</span>
          </button>
          <button onClick={() => handleShare(currentPost.id, 'twitter')} className="share-option-portal">
            <span>🐦</span>
            <span>Twitter</span>
          </button>
          <button onClick={() => handleShare(currentPost.id, 'facebook')} className="share-option-portal">
            <span>📘</span>
            <span>Facebook</span>
          </button>
          <button onClick={() => handleShare(currentPost.id, 'linkedin')} className="share-option-portal">
            <span>🔗</span>
            <span>LinkedIn</span>
          </button>
          <button onClick={() => handleShare(currentPost.id, 'whatsapp')} className="share-option-portal">
            <span>💬</span>
            <span>WhatsApp</span>
          </button>
          <button onClick={() => handleShare(currentPost.id, 'telegram')} className="share-option-portal">
            <span>✈️</span>
            <span>Telegram</span>
          </button>
          <button onClick={() => handleShare(currentPost.id, 'email')} className="share-option-portal">
            <span>📧</span>
            <span>Email</span>
          </button>
        </motion.div>,
        document.body
      )}

      <style jsx>{`
        .million-dollar-carousel {
          width: 100%;
          max-width: 720px;
          margin: 0 auto;
          position: relative;
        }

        .carousel-viewport {
          position: relative;
          overflow: hidden;
          border-radius: 32px;
        }

        .carousel-slide {
          width: 100%;
        }

        .premium-card {
          background: rgba(255, 255, 255, 0.98);
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.02);
          transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.4, 1), box-shadow 0.4s cubic-bezier(0.2, 0.8, 0.4, 1);
        }

        .premium-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(139, 92, 246, 0.15);
        }

        .category-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 20px 24px 0 24px;
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #8b5cf6;
        }

        .badge-text {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #64748b;
        }

        .time-chip {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-left: 12px;
          padding: 2px 8px;
          background: #f1f5f9;
          border-radius: 20px;
          font-size: 10px;
          font-family: monospace;
          color: #475569;
        }

        .content-area {
          padding: 12px 24px;
        }

        .rich-content {
          font-size: 15px;
          line-height: 1.6;
          color: #1e293b;
        }

        .empty-state {
          color: #94a3b8;
          font-style: italic;
        }

        .read-more {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          font-size: 13px;
          font-weight: 500;
          color: #8b5cf6;
          background: none;
          border: none;
          cursor: pointer;
          transition: gap 0.2s;
        }

        .read-more:hover {
          gap: 10px;
        }

        .media-grid {
          margin: 0 24px 16px 24px;
          border-radius: 20px;
          overflow: hidden;
          background: #f1f5f9;
        }

        .media-grid.single {
          display: block;
        }

        .media-grid.grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2px;
        }

        .media-frame {
          position: relative;
          aspect-ratio: 16/9;
          overflow: hidden;
          background: #f8fafc;
        }

        .media-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .media-frame:hover img {
          transform: scale(1.03);
        }

        .media-overlay {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          color: white;
        }

        .action-bar-premium {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 24px 20px 24px;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }

        .action-premium {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: transparent;
          border: none;
          border-radius: 40px;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.2, 0.8, 0.4, 1);
        }

        .action-premium:hover {
          background: #f8fafc;
          color: #1e293b;
        }

        .action-premium.like.active {
          color: #ef4444;
        }

        .action-premium.comment.active {
          color: #8b5cf6;
        }

        .share-wrapper {
          position: relative;
          margin-left: auto;
        }

        .status-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin: 0 24px 16px 24px;
          padding: 8px 14px;
          border-radius: 40px;
          font-size: 12px;
        }

        .status-chip.success {
          background: #22c55e10;
          color: #22c55e;
        }

        .status-chip.error {
          background: #ef444410;
          color: #ef4444;
        }

        .comments-wrapper {
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          margin-top: 8px;
        }

        .nav-premium {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-top: 24px;
        }

        .nav-btn-premium {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: white;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          transition: all 0.2s;
        }

        .nav-btn-premium:hover {
          background: #8b5cf6;
          border-color: #8b5cf6;
          color: white;
          transform: scale(1.05);
        }

        .nav-dots {
          display: flex;
          gap: 10px;
        }

        .nav-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #cbd5e1;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
        }

        .nav-dot.active {
          width: 24px;
          border-radius: 3px;
          background: #8b5cf6;
        }

        @media (prefers-color-scheme: dark) {
          .premium-card {
            background: rgba(30, 41, 59, 0.98);
          }
          .rich-content {
            color: #e2e8f0;
          }
          .action-premium:hover {
            background: #334155;
            color: #f1f5f9;
          }
          .time-chip {
            background: #334155;
            color: #cbd5e1;
          }
          .nav-btn-premium {
            background: #1e293b;
            border-color: #334155;
            color: #94a3b8;
          }
          .action-bar-premium {
            border-top-color: rgba(255, 255, 255, 0.05);
          }
          .media-grid {
            background: #334155;
          }
          .media-frame {
            background: #0f172a;
          }
        }

        @media (max-width: 768px) {
          .million-dollar-carousel {
            padding: 0 12px;
          }
          .premium-card {
            border-radius: 24px;
          }
          .category-badge {
            padding: 16px 20px 0 20px;
          }
          .content-area {
            padding: 8px 20px;
          }
          .rich-content {
            font-size: 14px;
          }
          .media-grid {
            margin: 0 20px 12px 20px;
          }
          .action-bar-premium {
            padding: 6px 20px 16px 20px;
          }
          .action-premium {
            padding: 6px 12px;
          }
          .nav-premium {
            margin-top: 16px;
          }
        }

        @media (max-width: 480px) {
          .action-premium span:first-child {
            display: none;
          }
          .action-premium {
            gap: 4px;
            padding: 6px 10px;
          }
        }
      `}</style>

      <style jsx global>{`
        .share-menu-portal {
          background: white;
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          padding: 8px;
          min-width: 170px;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .share-menu-portal.up .share-menu-arrow {
          position: absolute;
          bottom: -6px;
          right: 20px;
          width: 12px;
          height: 12px;
          background: white;
          border-right: 1px solid rgba(0, 0, 0, 0.05);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          transform: rotate(45deg);
        }

        .share-menu-portal.down .share-menu-arrow {
          position: absolute;
          top: -6px;
          right: 20px;
          width: 12px;
          height: 12px;
          background: white;
          border-left: 1px solid rgba(0, 0, 0, 0.05);
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          transform: rotate(45deg);
        }

        .share-option-portal {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 14px;
          background: none;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #1e293b;
          transition: all 0.2s ease;
          text-align: left;
        }

        .share-option-portal:hover {
          background: #f1f5f9;
        }

        @media (prefers-color-scheme: dark) {
          .share-menu-portal {
            background: #1e293b;
            border-color: #334155;
          }
          .share-menu-portal.up .share-menu-arrow {
            background: #1e293b;
            border-right-color: #334155;
            border-bottom-color: #334155;
          }
          .share-menu-portal.down .share-menu-arrow {
            background: #1e293b;
            border-left-color: #334155;
            border-top-color: #334155;
          }
          .share-option-portal {
            color: #e2e8f0;
          }
          .share-option-portal:hover {
            background: #334155;
          }
        }

        @media (max-width: 640px) {
          .share-menu-portal {
            min-width: 150px;
          }
          .share-option-portal {
            padding: 8px 12px;
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  )
}