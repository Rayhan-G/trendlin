// src/components/frontend/LivePostCarousel.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { 
  ChevronLeft, ChevronRight, Clock, Heart, MessageCircle, Share2, 
  Play, Pause, Volume2, VolumeX, Maximize2, Bookmark, Flag, 
  TrendingUp, Sparkles, Eye, Send, MoreHorizontal, User, 
  Verified, Repeat2, Twitter, Facebook, Youtube, Instagram,
  Music, Image as ImageIcon, Film, Smile, Gift, MapPin
} from 'lucide-react'

export default function LivePostCarousel({ posts, autoPlayInterval = 5000 }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [timeLeft, setTimeLeft] = useState({})
  const [isHovering, setIsHovering] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [likedPosts, setLikedPosts] = useState({})
  const [savedPosts, setSavedPosts] = useState({})
  const [showComments, setShowComments] = useState({})
  const [commentText, setCommentText] = useState({})
  const [expandedContent, setExpandedContent] = useState({})
  const videoRefs = useRef({})
  const autoPlayRef = useRef(null)

  const categories = {
    tech: { name: 'Technology', icon: '⚡', color: '#3b82f6', gradient: 'from-blue-500 via-blue-600 to-indigo-700', bg: 'bg-blue-500/10' },
    health: { name: 'Wellness', icon: '🌿', color: '#10b981', gradient: 'from-emerald-500 via-green-500 to-teal-700', bg: 'bg-emerald-500/10' },
    entertainment: { name: 'Culture', icon: '🎭', color: '#ec4899', gradient: 'from-pink-500 via-rose-500 to-fuchsia-700', bg: 'bg-pink-500/10' },
    wealth: { name: 'Capital', icon: '💰', color: '#f59e0b', gradient: 'from-amber-500 via-yellow-500 to-orange-700', bg: 'bg-amber-500/10' },
    world: { name: 'Horizons', icon: '🌍', color: '#06b6d4', gradient: 'from-cyan-500 via-sky-500 to-blue-700', bg: 'bg-cyan-500/10' },
    lifestyle: { name: 'Aesthetic', icon: '✨', color: '#f97316', gradient: 'from-orange-500 via-amber-500 to-red-700', bg: 'bg-orange-500/10' },
    growth: { name: 'Evolution', icon: '🌱', color: '#8b5cf6', gradient: 'from-purple-500 via-violet-500 to-indigo-700', bg: 'bg-purple-500/10' }
  }

  // Calculate time remaining
  useEffect(() => {
    const updateTimers = () => {
      const newTimeLeft = {}
      posts.forEach(post => {
        const diff = new Date(post.expires_at) - new Date()
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60))
          const minutes = Math.floor((diff % 3600000) / 60000)
          const seconds = Math.floor((diff % 60000) / 1000)
          if (hours > 0) {
            newTimeLeft[post.id] = `${hours}h ${minutes}m`
          } else if (minutes > 0) {
            newTimeLeft[post.id] = `${minutes}m ${seconds}s`
          } else {
            newTimeLeft[post.id] = `${seconds}s`
          }
        } else {
          newTimeLeft[post.id] = 'Expired'
        }
      })
      setTimeLeft(newTimeLeft)
    }

    updateTimers()
    const interval = setInterval(updateTimers, 1000)
    return () => clearInterval(interval)
  }, [posts])

  // Auto-play carousel
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

  const handleLike = async (postId) => {
    if (likedPosts[postId]) {
      setLikedPosts(prev => ({ ...prev, [postId]: false }))
    } else {
      setLikedPosts(prev => ({ ...prev, [postId]: true }))
      try {
        await fetch(`/api/live-posts/${postId}/like`, { method: 'POST' })
      } catch (error) {}
    }
  }

  const handleSave = (postId) => {
    setSavedPosts(prev => ({ ...prev, [postId]: !prev[postId] }))
  }

  const handleShare = async (postId) => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Check this out!', url })
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(url)
      alert('Link copied!')
    }
  }

  const handleComment = (postId) => {
    if (commentText[postId]?.trim()) {
      // Add comment logic here
      setCommentText(prev => ({ ...prev, [postId]: '' }))
      setShowComments(prev => ({ ...prev, [postId]: true }))
    }
  }

  const toggleComments = (postId) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }))
  }

  const toggleExpand = (postId) => {
    setExpandedContent(prev => ({ ...prev, [postId]: !prev[postId] }))
  }

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [])

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % posts.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [posts.length])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [posts.length])

  if (!posts || posts.length === 0) return null

  const currentPost = posts[currentIndex]
  const category = categories[currentPost.category] || { 
    name: currentPost.category, 
    icon: '📁', 
    color: '#6b7280', 
    gradient: 'from-gray-500 via-gray-600 to-gray-700',
    bg: 'bg-gray-500/10'
  }
  const isUrgent = new Date(currentPost.expires_at) - new Date() < 3600000
  const isExpanded = expandedContent[currentPost.id]
  const displayContent = isExpanded ? currentPost.content : currentPost.content?.substring(0, 300)

  return (
    <div className="live-carousel" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
      {/* Main Card */}
      <div className="carousel-container">
        <div className="carousel-card">
          {/* Header - Twitter-like */}
          <div className="card-header">
            <div className="user-info">
              <div className="avatar" style={{ background: `linear-gradient(135deg, ${category.color}, ${category.color}dd)` }}>
                {category.icon}
              </div>
              <div className="user-details">
                <div className="user-name">
                  Trendlin
                  <Verified size={14} className="verified-badge" />
                </div>
                <div className="post-meta">
                  <span className="category-badge" style={{ color: category.color }}>
                    {category.icon} {category.name}
                  </span>
                  <span className="dot-separator">•</span>
                  <span className={`time-badge ${isUrgent ? 'urgent' : ''}`}>
                    <Clock size={12} />
                    {timeLeft[currentPost.id] || 'Expiring'}
                  </span>
                </div>
              </div>
            </div>
            <button className="more-btn">
              <MoreHorizontal size={18} />
            </button>
          </div>

          {/* Content - Facebook/Twitter hybrid */}
          <div className="card-content">
            <div 
              className={`content-text ${!isExpanded && currentPost.content?.length > 300 ? 'collapsed' : ''}`}
              dangerouslySetInnerHTML={{ __html: displayContent || 'No description' }}
            />
            {currentPost.content?.length > 300 && (
              <button onClick={() => toggleExpand(currentPost.id)} className="expand-btn">
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          {/* Media Gallery - YouTube/Instagram style */}
          {currentPost.media_items && currentPost.media_items.length > 0 && (
            <div className={`media-gallery media-count-${currentPost.media_items.length}`}>
              {currentPost.media_items.map((media, idx) => (
                <div key={idx} className="media-item" onClick={() => {
                  if (media.type === 'video') {
                    const video = videoRefs.current[`${currentPost.id}-${idx}`]
                    if (video) video.paused ? video.play() : video.pause()
                  }
                }}>
                  {media.type === 'image' && (
                    <img src={media.url} alt="" className="media-image" loading="lazy" />
                  )}
                  {media.type === 'video' && (
                    <div className="video-wrapper">
                      <video
                        ref={el => { if (el) videoRefs.current[`${currentPost.id}-${idx}`] = el }}
                        src={media.url}
                        muted={isMuted}
                        loop
                        playsInline
                        className="media-video"
                        poster={media.thumbnail}
                      />
                      <div className="video-overlay">
                        <button className="play-pause-btn" onClick={(e) => {
                          e.stopPropagation()
                          const video = videoRefs.current[`${currentPost.id}-${idx}`]
                          if (video) video.paused ? video.play() : video.pause()
                        }}>
                          <Play size={24} fill="white" />
                        </button>
                      </div>
                      <div className="video-controls">
                        <button onClick={(e) => {
                          e.stopPropagation()
                          const video = videoRefs.current[`${currentPost.id}-${idx}`]
                          if (video) video.muted = !video.muted
                          setIsMuted(!video?.muted)
                        }}>
                          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                      </div>
                    </div>
                  )}
                  {media.type === 'audio' && (
                    <div className="audio-wrapper">
                      <div className="audio-art" style={{ background: `linear-gradient(135deg, ${category.color}, ${category.color}80)` }}>
                        <Music size={32} />
                      </div>
                      <audio src={media.url} controls className="media-audio" />
                    </div>
                  )}
                  {currentPost.media_items.length > 1 && (
                    <div className="media-count-badge">
                      +{currentPost.media_items.length - 1} more
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Stats - Instagram/Facebook style */}
          <div className="card-stats">
            <div className="stats-left">
              <div className="stat">
                <Heart size={16} fill={likedPosts[currentPost.id] ? '#ef4444' : 'none'} color={likedPosts[currentPost.id] ? '#ef4444' : '#6b7280'} />
                <span>{((currentPost.likes || 0) + (likedPosts[currentPost.id] ? 1 : 0)).toLocaleString()}</span>
              </div>
              <div className="stat">
                <MessageCircle size={16} />
                <span>{(currentPost.comments?.length || 0).toLocaleString()}</span>
              </div>
              <div className="stat">
                <Repeat2 size={16} />
                <span>{(currentPost.shares || 0).toLocaleString()}</span>
              </div>
              <div className="stat">
                <Eye size={16} />
                <span>{(currentPost.view_count || 0).toLocaleString()}</span>
              </div>
            </div>
            <div className="stats-right">
              <button onClick={() => handleSave(currentPost.id)} className={`save-btn ${savedPosts[currentPost.id] ? 'saved' : ''}`}>
                <Bookmark size={16} fill={savedPosts[currentPost.id] ? '#8b5cf6' : 'none'} />
              </button>
            </div>
          </div>

          {/* Action Bar - Twitter style */}
          <div className="action-bar">
            <button onClick={() => handleLike(currentPost.id)} className={`action-btn ${likedPosts[currentPost.id] ? 'liked' : ''}`}>
              <Heart size={20} />
              <span>Like</span>
            </button>
            <button onClick={() => toggleComments(currentPost.id)} className="action-btn">
              <MessageCircle size={20} />
              <span>Comment</span>
            </button>
            <button onClick={() => handleShare(currentPost.id)} className="action-btn">
              <Share2 size={20} />
              <span>Share</span>
            </button>
            <button className="action-btn">
              <Send size={20} />
              <span>Send</span>
            </button>
          </div>

          {/* Comments Section - Facebook style */}
          {showComments[currentPost.id] && (
            <div className="comments-section">
              <div className="comment-input-wrapper">
                <div className="comment-avatar" style={{ background: `linear-gradient(135deg, ${category.color}, ${category.color}dd)` }}>
                  U
                </div>
                <div className="comment-input-container">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentText[currentPost.id] || ''}
                    onChange={(e) => setCommentText(prev => ({ ...prev, [currentPost.id]: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && handleComment(currentPost.id)}
                    className="comment-input"
                  />
                  <div className="comment-actions">
                    <button><ImageIcon size={18} /></button>
                    <button><Gift size={18} /></button>
                    <button><Smile size={18} /></button>
                    <button><MapPin size={18} /></button>
                  </div>
                </div>
              </div>
              <div className="comments-list">
                {/* Sample comments - replace with real data */}
                <div className="comment-item">
                  <div className="comment-avatar small">A</div>
                  <div className="comment-content">
                    <div className="comment-author">Alex Chen</div>
                    <div className="comment-text">This is amazing! 🔥</div>
                    <div className="comment-meta">2h ago • Like</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Read More Link */}
          <Link href={`/live-posts/${currentPost.category}`} className="read-more-link">
            Read full story
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* Navigation Arrows */}
        {posts.length > 1 && (
          <>
            <button className="nav-arrow prev" onClick={prevSlide}>
              <ChevronLeft size={24} />
            </button>
            <button className="nav-arrow next" onClick={nextSlide}>
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Progress indicator */}
        {posts.length > 1 && isAutoPlaying && !isHovering && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ animationDuration: `${autoPlayInterval}ms` }} onAnimationEnd={nextSlide} />
          </div>
        )}

        {/* Dot indicators */}
        <div className="dot-indicators">
          {posts.map((_, idx) => (
            <button
              key={idx}
              className={`dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(idx)}
              style={{ background: idx === currentIndex ? category.color : 'rgba(255,255,255,0.3)' }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .live-carousel {
          max-width: 680px;
          margin: 0 auto 2rem;
          position: relative;
        }

        .carousel-container {
          position: relative;
        }

        .carousel-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .carousel-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05);
        }

        /* Header */
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .user-info {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
        }

        .user-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .user-name {
          font-weight: 700;
          font-size: 15px;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .verified-badge {
          color: #3b82f6;
        }

        .post-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #64748b;
        }

        .category-badge {
          font-weight: 500;
        }

        .dot-separator {
          color: #cbd5e1;
        }

        .time-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: monospace;
        }

        .time-badge.urgent {
          color: #ef4444;
          font-weight: 600;
        }

        .more-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .more-btn:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        /* Content */
        .card-content {
          padding: 20px;
        }

        .content-text {
          font-size: 16px;
          line-height: 1.6;
          color: #1e293b;
        }

        .content-text.collapsed {
          max-height: 150px;
          overflow: hidden;
          position: relative;
        }

        .expand-btn {
          margin-top: 8px;
          color: #8b5cf6;
          font-size: 14px;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
        }

        /* Media Gallery */
        .media-gallery {
          display: grid;
          gap: 2px;
          background: #000;
          margin: 0 20px 20px;
          border-radius: 16px;
          overflow: hidden;
        }

        .media-count-1 {
          grid-template-columns: 1fr;
        }

        .media-count-2 {
          grid-template-columns: 1fr 1fr;
        }

        .media-count-3 {
          grid-template-columns: 1fr 1fr;
        }

        .media-count-3 .media-item:first-child {
          grid-row: span 2;
        }

        .media-count-4 {
          grid-template-columns: 1fr 1fr;
        }

        .media-item {
          position: relative;
          aspect-ratio: 16/9;
          cursor: pointer;
          background: #0f0f0f;
        }

        .media-image, .media-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .video-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.3);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .video-wrapper:hover .video-overlay {
          opacity: 1;
        }

        .play-pause-btn {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.7);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .play-pause-btn:hover {
          transform: scale(1.1);
        }

        .video-controls {
          position: absolute;
          bottom: 12px;
          right: 12px;
          display: flex;
          gap: 8px;
        }

        .video-controls button {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.6);
          border: none;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(4px);
        }

        .audio-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          height: 100%;
          background: linear-gradient(135deg, #1e1b4b, #2e1065);
          padding: 20px;
        }

        .audio-art {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .media-audio {
          width: 100%;
        }

        .media-count-badge {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          color: white;
          font-weight: 500;
        }

        /* Stats */
        .card-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .stats-left {
          display: flex;
          gap: 16px;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #64748b;
        }

        .save-btn {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .save-btn.saved {
          color: #8b5cf6;
        }

        /* Action Bar */
        .action-bar {
          display: flex;
          justify-content: space-around;
          padding: 8px 20px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: none;
          border: none;
          border-radius: 40px;
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .action-btn.liked {
          color: #ef4444;
        }

        /* Comments */
        .comments-section {
          padding: 0 20px 20px;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          margin-top: 8px;
        }

        .comment-input-wrapper {
          display: flex;
          gap: 12px;
          padding: 16px 0;
        }

        .comment-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .comment-avatar.small {
          width: 32px;
          height: 32px;
          font-size: 12px;
        }

        .comment-input-container {
          flex: 1;
          position: relative;
        }

        .comment-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .comment-input:focus {
          border-color: #8b5cf6;
        }

        .comment-actions {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          gap: 8px;
        }

        .comment-actions button {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
        }

        .comments-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .comment-item {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .comment-content {
          flex: 1;
        }

        .comment-author {
          font-weight: 600;
          font-size: 13px;
          color: #1e293b;
        }

        .comment-text {
          font-size: 14px;
          color: #334155;
          margin: 4px 0;
        }

        .comment-meta {
          font-size: 11px;
          color: #94a3b8;
        }

        /* Read More Link */
        .read-more-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 16px;
          text-align: center;
          color: #8b5cf6;
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          transition: background 0.2s;
        }

        .read-more-link:hover {
          background: rgba(139, 92, 246, 0.05);
        }

        /* Navigation Arrows */
        .nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: white;
          border: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #1e293b;
          transition: all 0.2s;
          z-index: 10;
        }

        .nav-arrow.prev {
          left: -20px;
        }

        .nav-arrow.next {
          right: -20px;
        }

        .nav-arrow:hover {
          background: #8b5cf6;
          color: white;
          transform: translateY(-50%) scale(1.1);
        }

        /* Progress Bar */
        .progress-bar {
          position: absolute;
          bottom: -4px;
          left: 20px;
          right: 20px;
          height: 3px;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6, #ec4899);
          width: 0%;
          animation: progress linear forwards;
        }

        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }

        /* Dot Indicators */
        .dot-indicators {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          padding: 0;
        }

        .dot.active {
          width: 24px;
          border-radius: 3px;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .carousel-card {
            background: linear-gradient(135deg, #1e1e2e 0%, #1a1a2e 100%);
          }
          .user-name, .content-text, .comment-author {
            color: #f1f5f9;
          }
          .comment-text {
            color: #cbd5e1;
          }
          .nav-arrow {
            background: #1e1e2e;
            color: #f1f5f9;
          }
          .comment-input {
            background: #2d2d3d;
            border-color: #3d3d4d;
            color: #f1f5f9;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .live-carousel {
            margin: 0 12px 1rem;
          }
          .nav-arrow.prev {
            left: -8px;
          }
          .nav-arrow.next {
            right: -8px;
          }
          .action-btn span {
            display: none;
          }
          .media-count-2, .media-count-3, .media-count-4 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}