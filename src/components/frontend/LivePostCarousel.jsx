// components/frontend/LivePostCarousel.jsx - PREMIUM SIMPLIFIED

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useInteractions } from '../../hooks/useInteractions'
import CommentSection from '../comments/CommentSection'
import { 
  ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, 
  CheckCircle, X, Copy, Link2, MoreHorizontal
} from 'lucide-react'

export default function LivePostCarousel({ posts, sessionId }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showComments, setShowComments] = useState({})
  const [commentCounts, setCommentCounts] = useState({})
  const [expandedContent, setExpandedContent] = useState({})
  const [errorMsg, setErrorMsg] = useState({})
  const [successMsg, setSuccessMsg] = useState({})
  const [showShareOptions, setShowShareOptions] = useState({})
  const [showMoreMenu, setShowMoreMenu] = useState({})
  const [localShareCount, setLocalShareCount] = useState({})
  const [isAnimating, setIsAnimating] = useState(false)
  const [slideDirection, setSlideDirection] = useState('right')
  const shareButtonRef = useRef({})
  const moreMenuRef = useRef({})

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

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(shareButtonRef.current).forEach(postId => {
        const button = shareButtonRef.current[postId]
        const menu = document.getElementById(`share-menu-${postId}`)
        if (button && !button.contains(event.target) && menu && !menu.contains(event.target)) {
          setShowShareOptions(prev => ({ ...prev, [postId]: false }))
        }
      })
      Object.keys(moreMenuRef.current).forEach(postId => {
        const button = moreMenuRef.current[postId]
        const menu = document.getElementById(`more-menu-${postId}`)
        if (button && !button.contains(event.target) && menu && !menu.contains(event.target)) {
          setShowMoreMenu(prev => ({ ...prev, [postId]: false }))
        }
      })
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleShare = async (postId, platform) => {
    const currentPostData = posts.find(p => p.id === postId)
    if (!currentPostData) return
    
    const url = `${window.location.origin}/live-posts/${postId}`
    const title = encodeURIComponent(currentPostData?.content?.substring(0, 100) || 'Check out this post')
    
    if (platform === 'copy') {
      await navigator.clipboard.writeText(url)
      setSuccessMsg(prev => ({ ...prev, [postId]: 'Link copied!' }))
      setTimeout(() => setSuccessMsg(prev => ({ ...prev, [postId]: null })), 3000)
      setShowShareOptions(prev => ({ ...prev, [postId]: false }))
      return
    }
    
    window.open(`https://twitter.com/intent/tweet?text=${title}&url=${encodeURIComponent(url)}`, '_blank')
    
    setLocalShareCount(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }))
    try { await fetch(`/api/live-posts/${postId}/share`, { method: 'POST' }).catch(() => {}) } catch (err) {}
    setShowShareOptions(prev => ({ ...prev, [postId]: false }))
  }

  const goToSlide = (index) => {
    if (isAnimating) return
    const direction = index > currentIndex ? 'right' : 'left'
    setSlideDirection(direction)
    setIsAnimating(true)
    setCurrentIndex(index)
    setTimeout(() => setIsAnimating(false), 400)
  }

  const nextSlide = () => {
    if (isAnimating) return
    setSlideDirection('right')
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev + 1) % posts.length)
    setTimeout(() => setIsAnimating(false), 400)
  }

  const prevSlide = () => {
    if (isAnimating) return
    setSlideDirection('left')
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length)
    setTimeout(() => setIsAnimating(false), 400)
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

  return (
    <div className="carousel">
      {/* Card */}
      <div className={`card ${isAnimating ? `animating-${slideDirection}` : ''}`}>
        
        {/* More Options (Three Dots) */}
        <div className="more-wrapper">
          <button 
            ref={el => moreMenuRef.current[currentPost.id] = el}
            onClick={() => setShowMoreMenu(prev => ({ ...prev, [currentPost.id]: !prev[currentPost.id] }))}
            className="more-btn"
          >
            <MoreHorizontal size={20} />
          </button>
          
          {showMoreMenu[currentPost.id] && (
            <div className="more-menu" id={`more-menu-${currentPost.id}`}>
              <button className="more-item">Report</button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="content">
          <div className="content-text">
            <div dangerouslySetInnerHTML={{ __html: displayContent || currentPost.content }} />
          </div>
          {currentPost.content?.length > 280 && (
            <button 
              onClick={() => setExpandedContent(prev => ({ ...prev, [currentPost.id]: !prev[currentPost.id] }))} 
              className="read-more"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Image */}
        {currentPost.media_items && currentPost.media_items.length > 0 && (
          <div className="image-container">
            <img 
              src={currentPost.media_items[0].url} 
              alt=""
              className="post-image"
            />
            {currentPost.media_items.length > 1 && (
              <div className="image-count">
                +{currentPost.media_items.length}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="actions">
          <button 
            onClick={toggleLike} 
            className={`action like ${userHasLiked ? 'active' : ''}`}
            disabled={isSyncingInteractions}
          >
            <Heart size={22} fill={userHasLiked ? '#ef4444' : 'none'} />
            <span>{formatNumber(liveLikes)}</span>
            {pendingLike !== undefined && <span className="pending" />}
          </button>
          
          <button 
            onClick={() => setShowComments(prev => ({ ...prev, [currentPost.id]: !prev[currentPost.id] }))} 
            className={`action comment ${showComments[currentPost.id] ? 'active' : ''}`}
          >
            <MessageCircle size={22} />
            <span>{formatNumber(currentCommentCount)}</span>
          </button>
          
          <div className="share-wrapper">
            <button 
              ref={el => shareButtonRef.current[currentPost.id] = el}
              onClick={() => setShowShareOptions(prev => ({ ...prev, [currentPost.id]: !prev[currentPost.id] }))} 
              className="action share"
            >
              <Share2 size={22} />
              <span>{formatNumber(currentShareCount)}</span>
            </button>
            
            {isShareMenuOpen && (
              <div className="share-menu" id={`share-menu-${currentPost.id}`}>
                <button onClick={() => handleShare(currentPost.id, 'copy')} className="share-item">
                  <Copy size={14} /> Copy link
                </button>
                <button onClick={() => handleShare(currentPost.id, 'twitter')} className="share-item">
                  𝕏 Twitter
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        {successMsg[currentPost.id] && (
          <div className="message success">
            <CheckCircle size={14} />
            <span>{successMsg[currentPost.id]}</span>
          </div>
        )}
        {errorMsg[currentPost.id] && (
          <div className="message error">
            <X size={14} />
            <span>{errorMsg[currentPost.id]}</span>
          </div>
        )}

        {/* Comments Section */}
        {showComments[currentPost.id] && (
          <div className="comments">
            <CommentSection 
              postId={currentPost.id}
              sessionId={getSessionId()}
              commentCount={currentCommentCount}
              onCommentCountChange={(newCount) => {
                setCommentCounts(prev => ({ ...prev, [currentPost.id]: newCount }))
              }}
            />
          </div>
        )}

        {/* Navigation Arrows */}
        {posts.length > 1 && (
          <div className="navigation">
            <button onClick={prevSlide} className="nav prev">
              <ChevronLeft size={24} />
            </button>
            <div className="dots">
              {posts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`dot ${idx === currentIndex ? 'active' : ''}`}
                />
              ))}
            </div>
            <button onClick={nextSlide} className="nav next">
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .carousel {
          max-width: 600px;
          margin: 0 auto;
        }

        .card {
          background: var(--card-bg);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          position: relative;
          transition: all 0.3s ease;
        }

        .card:hover {
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
        }

        /* Animations */
        .animating-right {
          animation: slideRight 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }

        .animating-left {
          animation: slideLeft 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }

        @keyframes slideRight {
          0% {
            opacity: 0;
            transform: translateX(40px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideLeft {
          0% {
            opacity: 0;
            transform: translateX(-40px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* More Button */
        .more-wrapper {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 10;
        }

        .more-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.05);
          backdrop-filter: blur(8px);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all 0.2s;
        }

        .more-btn:hover {
          background: rgba(0, 0, 0, 0.1);
          transform: scale(1.05);
        }

        .more-menu {
          position: absolute;
          top: 48px;
          right: 0;
          background: var(--dropdown-bg);
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
          padding: 8px;
          min-width: 120px;
          z-index: 100;
          border: 1px solid var(--border-color);
        }

        .more-item {
          width: 100%;
          padding: 8px 12px;
          background: none;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          color: var(--text-secondary);
          text-align: left;
        }

        .more-item:hover {
          background: var(--hover-bg);
        }

        /* Content */
        .content {
          padding: 20px 20px 0 20px;
        }

        .content-text {
          font-size: 15px;
          line-height: 1.6;
          color: var(--text-primary);
        }

        .read-more {
          display: inline-block;
          margin-top: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #8b5cf6;
          background: none;
          border: none;
          cursor: pointer;
        }

        /* Image */
        .image-container {
          position: relative;
          margin: 16px 20px;
          border-radius: 16px;
          overflow: hidden;
          background: #f1f5f9;
        }

        .post-image {
          width: 100%;
          max-height: 400px;
          object-fit: cover;
          display: block;
        }

        .image-count {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          color: white;
        }

        /* Actions */
        .actions {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 8px 20px 16px 20px;
          border-top: 1px solid var(--border-color);
          margin-top: 8px;
        }

        .action {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          padding: 8px 12px;
          border-radius: 40px;
          transition: all 0.2s;
        }

        .action:hover {
          background: var(--hover-bg);
          transform: scale(1.02);
        }

        .action:active {
          transform: scale(0.98);
        }

        .like.active {
          color: #ef4444;
        }

        .comment.active {
          color: #8b5cf6;
        }

        .pending {
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

        .share-wrapper {
          position: relative;
          margin-left: auto;
        }

        .share-menu {
          position: absolute;
          bottom: calc(100% + 8px);
          right: 0;
          background: var(--dropdown-bg);
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
          padding: 8px;
          min-width: 140px;
          z-index: 100;
          border: 1px solid var(--border-color);
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .share-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 12px;
          background: none;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          color: var(--text-primary);
        }

        .share-item:hover {
          background: var(--hover-bg);
        }

        /* Messages */
        .message {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 20px 16px 20px;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 12px;
        }

        .message.success {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }

        .message.error {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        /* Comments */
        .comments {
          border-top: 1px solid var(--border-color);
          margin-top: 8px;
        }

        /* Navigation */
        .navigation {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px 20px 20px;
          border-top: 1px solid var(--border-color);
        }

        .nav {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--btn-bg);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all 0.2s;
        }

        .nav:hover {
          background: #8b5cf6;
          border-color: #8b5cf6;
          color: white;
          transform: scale(1.05);
        }

        .dots {
          display: flex;
          gap: 8px;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--border-color);
          border: none;
          cursor: pointer;
          transition: all 0.3s;
        }

        .dot.active {
          width: 24px;
          border-radius: 3px;
          background: #8b5cf6;
        }

        /* CSS Variables */
        :root {
          --card-bg: #ffffff;
          --text-primary: #1e293b;
          --text-secondary: #64748b;
          --border-color: #e2e8f0;
          --btn-bg: #f8fafc;
          --hover-bg: #f1f5f9;
          --dropdown-bg: #ffffff;
        }

        :global(.dark) {
          --card-bg: #1e293b;
          --text-primary: #f1f5f9;
          --text-secondary: #94a3b8;
          --border-color: #334155;
          --btn-bg: #334155;
          --hover-bg: #475569;
          --dropdown-bg: #1e293b;
        }

        /* Mobile */
        @media (max-width: 640px) {
          .content, .image-container, .actions, .navigation {
            padding-left: 16px;
            padding-right: 16px;
          }
          
          .image-container {
            margin-left: 16px;
            margin-right: 16px;
          }
          
          .action span {
            display: none;
          }
          
          .action {
            padding: 8px;
          }
        }
      `}</style>
    </div>
  )
}