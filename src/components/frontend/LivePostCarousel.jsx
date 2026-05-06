// components/frontend/LivePostCarousel.jsx - NO AUTO-PLAY
import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useInteractions } from '../../hooks/useInteractions'
import CommentSection from '../comments/CommentSection'
import { 
  ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, 
  Play, Volume2, VolumeX, Maximize2, CheckCircle,
  Zap, User, Send, X, Clock, Copy
} from 'lucide-react'

export default function LivePostCarousel({ posts, onLike, onShare, sessionId }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showComments, setShowComments] = useState({})
  const [commentCounts, setCommentCounts] = useState({})
  const [expandedContent, setExpandedContent] = useState({})
  const [errorMsg, setErrorMsg] = useState({})
  const [successMsg, setSuccessMsg] = useState({})
  const [showShareOptions, setShowShareOptions] = useState({})
  const [localShareCount, setLocalShareCount] = useState({})
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

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutside = Object.keys(shareButtonRef.current).every(postId => {
        const button = shareButtonRef.current[postId]
        const menu = document.getElementById(`share-menu-${postId}`)
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

  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % posts.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length)
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

  return (
    <div className="premium-carousel">
      {/* Main Card */}
      <div className="premium-card">
        {/* Category Header */}
        <div className="category-header">
          <span className="category-dot" />
          <span className="category-name">{currentPost.category}</span>
          {getTimeLeft() && (
            <span className="time-left">
              <Zap size={10} />
              {getTimeLeft()} left
            </span>
          )}
        </div>

        {/* Content */}
        <div className="content-area">
          {currentPost.content ? (
            <>
              <div className="content-text">
                <div dangerouslySetInnerHTML={{ __html: displayContent || currentPost.content }} />
              </div>
              {currentPost.content.length > 280 && (
                <button onClick={() => setExpandedContent(prev => ({ ...prev, [currentPost.id]: !prev[currentPost.id] }))} className="read-more">
                  {isExpanded ? 'Show less' : 'Read more'}
                  <ChevronRight size={14} />
                </button>
              )}
            </>
          ) : (
            <p className="no-content">No description</p>
          )}
        </div>

        {/* Media */}
        {currentPost.media_items && currentPost.media_items.length > 0 && (
          <div className="media-grid">
            {currentPost.media_items.slice(0, 2).map((media, idx) => (
              <div key={idx} className={`media-item ${currentPost.media_items.length === 1 ? 'single' : 'double'}`}>
                <img src={media.url} alt="" loading="lazy" />
                {currentPost.media_items.length > 2 && idx === 0 && (
                  <div className="media-badge">+{currentPost.media_items.length - 2}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="action-bar">
          <button 
            onClick={toggleLike} 
            className={`action-btn like ${userHasLiked ? 'active' : ''}`}
            disabled={isSyncingInteractions}
          >
            <Heart size={18} fill={userHasLiked ? '#ef4444' : 'none'} />
            <span>{formatNumber(liveLikes)}</span>
            {pendingLike !== undefined && <span className="pending-dot" />}
          </button>
          
          <button 
            onClick={() => toggleComments(currentPost.id)} 
            className={`action-btn comment ${isCommentsOpen ? 'active' : ''}`}
          >
            <MessageCircle size={18} />
            <span>{formatNumber(currentCommentCount)}</span>
          </button>
          
          <div className="share-wrapper">
            <button 
              ref={el => shareButtonRef.current[currentPost.id] = el}
              onClick={() => setShowShareOptions(prev => ({ ...prev, [currentPost.id]: !prev[currentPost.id] }))} 
              className="action-btn share"
            >
              <Share2 size={18} />
              <span>{formatNumber(currentShareCount)}</span>
            </button>
            
            {isShareMenuOpen && (
              <div className="share-menu" id={`share-menu-${currentPost.id}`}>
                <button onClick={() => handleShare(currentPost.id, 'copy')} className="share-item">
                  <Copy size={14} /> Copy
                </button>
                <button onClick={() => handleShare(currentPost.id, 'twitter')} className="share-item">🐦 Twitter</button>
                <button onClick={() => handleShare(currentPost.id, 'facebook')} className="share-item">📘 Facebook</button>
                <button onClick={() => handleShare(currentPost.id, 'linkedin')} className="share-item">🔗 LinkedIn</button>
                <button onClick={() => handleShare(currentPost.id, 'whatsapp')} className="share-item">💬 WhatsApp</button>
                <button onClick={() => handleShare(currentPost.id, 'telegram')} className="share-item">✈️ Telegram</button>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        {successMsg[currentPost.id] && (
          <div className="success-msg">
            <CheckCircle size={12} /> {successMsg[currentPost.id]}
          </div>
        )}
        {errorMsg[currentPost.id] && (
          <div className="error-msg">
            <X size={12} /> {errorMsg[currentPost.id]}
          </div>
        )}

        {/* Comments */}
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

        {/* Navigation Arrows */}
        {posts.length > 1 && (
          <div className="nav-arrows">
            <button onClick={prevSlide} className="nav-btn prev">
              <ChevronLeft size={20} />
            </button>
            <div className="nav-dots">
              {posts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`nav-dot ${idx === currentIndex ? 'active' : ''}`}
                />
              ))}
            </div>
            <button onClick={nextSlide} className="nav-btn next">
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .premium-carousel {
          width: 100%;
          max-width: 680px;
          margin: 0 auto;
        }

        .premium-card {
          background: rgba(255, 255, 255, 0.98);
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.12);
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .premium-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.18);
        }

        .category-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 20px 24px 0 24px;
        }

        .category-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #8b5cf6;
        }

        .category-name {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #64748b;
        }

        .time-left {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-left: 12px;
          padding: 2px 8px;
          background: #f1f5f9;
          border-radius: 20px;
          font-size: 10px;
          color: #475569;
        }

        .content-area {
          padding: 12px 24px;
        }

        .content-text {
          font-size: 15px;
          line-height: 1.6;
          color: #1e293b;
        }

        .no-content {
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
        }

        .media-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2px;
          margin: 0 24px 16px 24px;
          border-radius: 20px;
          overflow: hidden;
          background: #f1f5f9;
        }

        .media-item {
          position: relative;
          aspect-ratio: 16/9;
          overflow: hidden;
          background: #f8fafc;
        }

        .media-item.single {
          grid-column: span 2;
        }

        .media-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .media-badge {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(0, 0, 0, 0.7);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          color: white;
        }

        .action-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 24px 20px 24px;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: none;
          border: none;
          border-radius: 40px;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: #f8fafc;
          color: #1e293b;
        }

        .like.active {
          color: #ef4444;
        }

        .comment.active {
          color: #8b5cf6;
        }

        .share-wrapper {
          position: relative;
          margin-left: auto;
        }

        .share-menu {
          position: absolute;
          bottom: calc(100% + 8px);
          right: 0;
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
          padding: 8px;
          min-width: 150px;
          z-index: 10;
        }

        .share-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 12px;
          background: none;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 13px;
          color: #1e293b;
        }

        .share-item:hover {
          background: #f1f5f9;
        }

        .pending-dot {
          width: 6px;
          height: 6px;
          background: #f59e0b;
          border-radius: 50%;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .success-msg, .error-msg {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 24px 16px 24px;
          padding: 8px 12px;
          border-radius: 12px;
          font-size: 12px;
        }

        .success-msg {
          background: #22c55e10;
          color: #22c55e;
        }

        .error-msg {
          background: #ef444410;
          color: #ef4444;
        }

        .nav-arrows {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          padding: 0 24px 24px 24px;
        }

        .nav-btn {
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

        .nav-btn:hover {
          background: #8b5cf6;
          border-color: #8b5cf6;
          color: white;
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
          .content-text {
            color: #e2e8f0;
          }
          .action-btn:hover {
            background: #334155;
            color: #f1f5f9;
          }
          .share-menu {
            background: #1e293b;
          }
          .share-item {
            color: #e2e8f0;
          }
          .share-item:hover {
            background: #334155;
          }
          .nav-btn {
            border-color: #334155;
            color: #94a3b8;
          }
          .time-left {
            background: #334155;
            color: #cbd5e1;
          }
        }

        @media (max-width: 640px) {
          .category-header, .content-area, .media-grid {
            padding-left: 16px;
            padding-right: 16px;
          }
          .action-bar {
            padding-left: 16px;
            padding-right: 16px;
          }
          .action-btn span:first-child {
            display: none;
          }
          .action-btn {
            padding: 6px 10px;
          }
          .share-menu {
            right: -10px;
            min-width: 140px;
          }
        }
      `}</style>
    </div>
  )
}