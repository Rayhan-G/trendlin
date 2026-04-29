// src/components/frontend/LivePostCarousel.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Clock, Heart, MessageCircle, Share2, Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react'

export default function LivePostCarousel({ posts, autoPlayInterval = 5000 }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [timeLeft, setTimeLeft] = useState({})
  const [isHovering, setIsHovering] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [likedPosts, setLikedPosts] = useState({})
  const videoRefs = useRef({})
  const autoPlayRef = useRef(null)

  const categories = {
    tech: { name: 'Technology', icon: '⚡', color: '#3b82f6', gradient: 'from-blue-500/20 to-blue-600/10' },
    health: { name: 'Wellness', icon: '🌿', color: '#10b981', gradient: 'from-emerald-500/20 to-emerald-600/10' },
    entertainment: { name: 'Culture', icon: '🎭', color: '#ec4899', gradient: 'from-pink-500/20 to-pink-600/10' },
    wealth: { name: 'Capital', icon: '💰', color: '#f59e0b', gradient: 'from-amber-500/20 to-amber-600/10' },
    world: { name: 'Horizons', icon: '🌍', color: '#06b6d4', gradient: 'from-cyan-500/20 to-cyan-600/10' },
    lifestyle: { name: 'Aesthetic', icon: '✨', color: '#f97316', gradient: 'from-orange-500/20 to-orange-600/10' },
    growth: { name: 'Evolution', icon: '🌱', color: '#8b5cf6', gradient: 'from-purple-500/20 to-purple-600/10' }
  }

  // Calculate time remaining for each post
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

  // Handle video playback when slide changes
  useEffect(() => {
    // Pause all videos
    Object.values(videoRefs.current).forEach(video => {
      if (video) video.pause()
    })
    
    // Play video in current slide if it's a video
    const currentPost = posts[currentIndex]
    if (currentPost?.media_items?.[0]?.type === 'video') {
      const video = videoRefs.current[currentPost.id]
      if (video && !isHovering) {
        video.play().catch(e => console.log('Autoplay prevented:', e))
      }
    }
  }, [currentIndex, posts, isHovering])

  const handleLike = async (postId, currentLikes) => {
    if (likedPosts[postId]) return
    
    try {
      const res = await fetch(`/api/live-posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'anonymous_' + Date.now() })
      })
      if (res.ok) {
        setLikedPosts(prev => ({ ...prev, [postId]: true }))
      }
    } catch (error) {
      console.error('Like failed:', error)
    }
  }

  const handleShare = async (postId) => {
    const url = `${window.location.origin}/live-posts/${posts.find(p => p.id === postId)?.category}`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Check this out!', url })
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(url)
      alert('Link copied!')
    }
    
    try {
      await fetch(`/api/live-posts/${postId}/share`, { method: 'POST' })
    } catch (error) {}
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

  const toggleMute = (postId, e) => {
    e.stopPropagation()
    const video = videoRefs.current[postId]
    if (video) {
      video.muted = !video.muted
      setIsMuted(!video.muted)
    }
  }

  const toggleFullscreen = (postId, e) => {
    e.stopPropagation()
    const video = videoRefs.current[postId]
    if (video) {
      if (video.requestFullscreen) video.requestFullscreen()
    }
  }

  if (!posts || posts.length === 0) return null

  const currentPost = posts[currentIndex]
  const category = categories[currentPost.category] || { name: currentPost.category, icon: '📁', color: '#6b7280', gradient: 'from-gray-500/20 to-gray-600/10' }
  const isUrgent = new Date(currentPost.expires_at) - new Date() < 3600000
  const isVideo = currentPost.media_items?.[0]?.type === 'video'
  const mediaUrl = currentPost.media_items?.[0]?.url

  return (
    <div 
      className="live-carousel"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Main Slide */}
      <div className="carousel-main">
        <div className="carousel-slide">
          {/* Background Media */}
          <div className="carousel-background">
            {mediaUrl && (
              isVideo ? (
                <video
                  ref={el => { if (el) videoRefs.current[currentPost.id] = el }}
                  src={mediaUrl}
                  autoPlay={!isHovering}
                  muted={isMuted}
                  loop
                  playsInline
                  className="background-video"
                />
              ) : (
                <img src={mediaUrl} alt={currentPost.title} className="background-image" />
              )
            )}
            <div className={`carousel-overlay bg-gradient-to-t ${category.gradient}`}></div>
          </div>

          {/* Category Label */}
          <div className="category-label" style={{ background: `${category.color}20`, color: category.color }}>
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </div>

          {/* Content Overlay */}
          <div className="carousel-content">
            <div className="content-wrapper">
              <div className="post-meta">
                <div className={`time-badge ${isUrgent ? 'urgent' : ''}`}>
                  <Clock size={14} />
                  <span>{timeLeft[currentPost.id] || 'Expiring'}</span>
                </div>
                <div className="view-count">👁️ {(currentPost.view_count || 0).toLocaleString()} views</div>
              </div>

              {currentPost.title && (
                <h2 className="post-title">{currentPost.title}</h2>
              )}
              
              {currentPost.content && (
                <div 
                  className="post-description"
                  dangerouslySetInnerHTML={{ 
                    __html: currentPost.content.length > 200 
                      ? currentPost.content.substring(0, 200) + '...' 
                      : currentPost.content 
                  }}
                />
              )}

              <div className="post-stats">
                <button 
                  onClick={() => handleLike(currentPost.id, currentPost.likes)}
                  className={`stat-btn ${likedPosts[currentPost.id] ? 'liked' : ''}`}
                >
                  <Heart size={18} fill={likedPosts[currentPost.id] ? '#ef4444' : 'none'} />
                  <span>{currentPost.likes || 0}</span>
                </button>
                <button className="stat-btn">
                  <MessageCircle size={18} />
                  <span>{currentPost.comments?.length || 0}</span>
                </button>
                <button onClick={() => handleShare(currentPost.id)} className="stat-btn">
                  <Share2 size={18} />
                  <span>{currentPost.shares || 0}</span>
                </button>
                {isVideo && (
                  <>
                    <button onClick={(e) => toggleMute(currentPost.id, e)} className="stat-btn">
                      {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <button onClick={(e) => toggleFullscreen(currentPost.id, e)} className="stat-btn">
                      <Maximize2 size={18} />
                    </button>
                  </>
                )}
              </div>

              <Link href={`/live-posts/${currentPost.category}`}>
                <button className="read-more-btn">
                  Read Full Story
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        {posts.length > 1 && (
          <>
            <button className="carousel-nav prev" onClick={prevSlide} aria-label="Previous">
              <ChevronLeft size={24} />
            </button>
            <button className="carousel-nav next" onClick={nextSlide} aria-label="Next">
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Progress Bar */}
        {posts.length > 1 && isAutoPlaying && !isHovering && (
          <div className="progress-bar-container">
            <div 
              className="progress-bar" 
              style={{ animationDuration: `${autoPlayInterval}ms` }}
              onAnimationEnd={nextSlide}
            />
          </div>
        )}

        {/* Dots Indicator */}
        <div className="carousel-dots">
          {posts.map((_, idx) => (
            <button
              key={idx}
              className={`dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {posts.length > 1 && (
        <div className="thumbnail-strip">
          {posts.map((post, idx) => (
            <div
              key={post.id}
              className={`thumbnail ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(idx)}
            >
              {post.media_items?.[0] && (
                post.media_items[0].type === 'video' ? (
                  <video src={post.media_items[0].url} muted className="thumbnail-media" />
                ) : (
                  <img src={post.media_items[0].url} alt={post.title} className="thumbnail-media" />
                )
              )}
              <div className="thumbnail-overlay"></div>
              <div className="thumbnail-title">{post.title?.substring(0, 30) || 'Untitled'}...</div>
              {timeLeft[post.id] && timeLeft[post.id] !== 'Expired' && (
                <div className="thumbnail-time">{timeLeft[post.id]}</div>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .live-carousel {
          margin-bottom: 2rem;
          position: relative;
        }

        .carousel-main {
          position: relative;
          border-radius: 28px;
          overflow: hidden;
          background: #0a0a0a;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .carousel-slide {
          position: relative;
          height: 560px;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .carousel-slide {
            height: 500px;
          }
        }

        .carousel-background {
          position: absolute;
          inset: 0;
        }

        .background-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .background-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .carousel-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.5) 40%, rgba(0, 0, 0, 0.2) 100%);
        }

        .category-label {
          position: absolute;
          top: 24px;
          left: 24px;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 40px;
          font-size: 0.75rem;
          font-weight: 600;
          backdrop-filter: blur(8px);
        }

        .category-icon {
          font-size: 1rem;
        }

        .carousel-content {
          position: relative;
          height: 100%;
          display: flex;
          align-items: flex-end;
          padding: 3rem;
          z-index: 5;
        }

        @media (max-width: 768px) {
          .carousel-content {
            padding: 1.5rem;
          }
        }

        .content-wrapper {
          max-width: 600px;
        }

        .post-meta {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .time-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 1rem;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          border-radius: 40px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #fbbf24;
          font-family: monospace;
        }

        .time-badge.urgent {
          background: #ef4444;
          color: white;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.02); }
        }

        .view-count {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.375rem 1rem;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(10px);
          border-radius: 40px;
          font-size: 0.75rem;
          color: #a1a1aa;
        }

        .post-title {
          font-size: 3rem;
          font-weight: 800;
          color: white;
          margin-bottom: 1rem;
          line-height: 1.2;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 768px) {
          .post-title {
            font-size: 1.75rem;
          }
        }

        .post-description {
          color: #e4e4e7;
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .post-stats {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .stat-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 0.5rem 1rem;
          border-radius: 40px;
          color: white;
          font-size: 0.875rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .stat-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }

        .stat-btn.liked {
          background: #ef4444;
          color: white;
        }

        .read-more-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.75rem;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          border: none;
          border-radius: 40px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .read-more-btn:hover {
          transform: translateX(4px);
          gap: 0.75rem;
        }

        .carousel-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20;
        }

        .carousel-nav:hover {
          background: #8b5cf6;
          border-color: #8b5cf6;
          transform: translateY(-50%) scale(1.1);
        }

        .carousel-nav.prev {
          left: 1.5rem;
        }

        .carousel-nav.next {
          right: 1.5rem;
        }

        .progress-bar-container {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(255, 255, 255, 0.3);
          z-index: 15;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6, #ec4899);
          width: 0%;
          animation: progress linear forwards;
        }

        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }

        .carousel-dots {
          position: absolute;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 0.75rem;
          z-index: 15;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          padding: 0;
        }

        .dot.active {
          width: 28px;
          border-radius: 4px;
          background: #8b5cf6;
        }

        .thumbnail-strip {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
          overflow-x: auto;
          padding: 0.5rem;
          scrollbar-width: thin;
        }

        .thumbnail-strip::-webkit-scrollbar {
          height: 4px;
        }

        .thumbnail-strip::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 4px;
        }

        .thumbnail-strip::-webkit-scrollbar-thumb {
          background: #8b5cf6;
          border-radius: 4px;
        }

        .thumbnail {
          position: relative;
          width: 140px;
          height: 90px;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          flex-shrink: 0;
          border: 2px solid transparent;
          transition: all 0.2s;
        }

        .thumbnail.active {
          border-color: #8b5cf6;
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        .thumbnail-media {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumbnail-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          transition: background 0.2s;
        }

        .thumbnail:hover .thumbnail-overlay {
          background: rgba(139, 92, 246, 0.3);
        }

        .thumbnail.active .thumbnail-overlay {
          background: rgba(139, 92, 246, 0.2);
        }

        .thumbnail-title {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 0.5rem;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
          font-size: 0.7rem;
          color: white;
          text-align: center;
          font-weight: 500;
        }

        .thumbnail-time {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: rgba(0, 0, 0, 0.7);
          padding: 0.125rem 0.5rem;
          border-radius: 12px;
          font-size: 0.65rem;
          color: #fbbf24;
          font-family: monospace;
        }

        @media (max-width: 768px) {
          .thumbnail-strip {
            display: none;
          }
          .carousel-nav {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>
    </div>
  )
}