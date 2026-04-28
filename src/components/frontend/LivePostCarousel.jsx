// src/components/frontend/LivePostCarousel.jsx
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Clock, Heart, MessageCircle, Share2 } from 'lucide-react'

export default function LivePostCarousel({ posts }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [timeLeft, setTimeLeft] = useState({})
  const carouselRef = useRef(null)
  const autoPlayRef = useRef(null)

  const categories = {
    tech: { name: 'Technology', icon: '⚡', color: '#3b82f6' },
    health: { name: 'Wellness', icon: '🌿', color: '#10b981' },
    entertainment: { name: 'Culture', icon: '🎭', color: '#ec4899' },
    wealth: { name: 'Capital', icon: '💰', color: '#f59e0b' },
    world: { name: 'Horizons', icon: '🌍', color: '#06b6d4' },
    lifestyle: { name: 'Aesthetic', icon: '✨', color: '#f97316' },
    growth: { name: 'Evolution', icon: '🌱', color: '#8b5cf6' }
  }

  // Calculate time remaining for each post
  useEffect(() => {
    const updateTimers = () => {
      const newTimeLeft = {}
      posts.forEach(post => {
        const diff = new Date(post.expires_at) - new Date()
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60))
          const minutes = Math.floor((diff % (3600000)) / 60000)
          newTimeLeft[post.id] = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
        } else {
          newTimeLeft[post.id] = 'Expired'
        }
      })
      setTimeLeft(newTimeLeft)
    }

    updateTimers()
    const interval = setInterval(updateTimers, 60000)
    return () => clearInterval(interval)
  }, [posts])

  // Auto-play carousel
  useEffect(() => {
    if (isAutoPlaying && posts.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % posts.length)
      }, 5000)
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    }
  }, [isAutoPlaying, posts.length])

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

  if (!posts || posts.length === 0) return null

  const currentPost = posts[currentIndex]
  const category = categories[currentPost.category] || { name: currentPost.category, icon: '📁', color: '#6b7280' }
  const isUrgent = new Date(currentPost.expires_at) - new Date() < 3600000

  return (
    <div className="live-carousel">
      {/* Main Slide */}
      <div className="carousel-main">
        <div className="carousel-slide">
          {/* Background Media */}
          <div className="carousel-background">
            {currentPost.media_items?.[0] && (
              currentPost.media_items[0].type === 'image' ? (
                <img src={currentPost.media_items[0].url} alt={currentPost.title} />
              ) : (
                <video src={currentPost.media_items[0].url} autoPlay muted loop />
              )
            )}
            <div className="carousel-overlay"></div>
          </div>

          {/* Content Overlay */}
          <div className="carousel-content">
            <div className="content-wrapper">
              <div className="post-meta">
                <span className="category-badge" style={{ background: `${category.color}20`, color: category.color }}>
                  {category.icon} {category.name}
                </span>
                <div className={`time-badge ${isUrgent ? 'urgent' : ''}`}>
                  <Clock size={12} />
                  <span>{timeLeft[currentPost.id] || 'Expiring'}</span>
                </div>
              </div>

              <h2 className="post-title">{currentPost.title}</h2>
              
              <div className="post-description">
                "{currentPost.description?.substring(0, 120)}..."
              </div>

              <div className="post-stats">
                <span><Heart size={14} /> {currentPost.likes || 0}</span>
                <span><MessageCircle size={14} /> {currentPost.comments?.length || 0}</span>
                <span><Share2 size={14} /> {currentPost.shares || 0}</span>
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
            <button className="carousel-nav prev" onClick={prevSlide}>
              <ChevronLeft size={24} />
            </button>
            <button className="carousel-nav next" onClick={nextSlide}>
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        <div className="carousel-dots">
          {posts.map((_, idx) => (
            <button
              key={idx}
              className={`dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(idx)}
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
              <img src={post.media_items?.[0]?.url} alt={post.title} />
              <div className="thumbnail-overlay"></div>
              <div className="thumbnail-title">{post.title.substring(0, 30)}...</div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .live-carousel {
          margin-bottom: 2rem;
        }

        .carousel-main {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          background: #0f0f0f;
        }

        .carousel-slide {
          position: relative;
          height: 500px;
          overflow: hidden;
        }

        .carousel-background {
          position: absolute;
          inset: 0;
        }

        .carousel-background img,
        .carousel-background video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .carousel-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.9) 0%,
            rgba(0, 0, 0, 0.5) 50%,
            rgba(0, 0, 0, 0.3) 100%
          );
        }

        .carousel-content {
          position: relative;
          height: 100%;
          display: flex;
          align-items: flex-end;
          padding: 3rem;
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

        .category-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 40px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .time-badge {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          border-radius: 40px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #fbbf24;
        }

        .time-badge.urgent {
          background: #ef4444;
          color: white;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .post-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .post-description {
          color: #d4d4d8;
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .post-stats {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          color: #a1a1aa;
          font-size: 0.875rem;
        }

        .post-stats span {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .read-more-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          border: none;
          border-radius: 40px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .read-more-btn:hover {
          transform: translateX(4px);
        }

        .carousel-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .carousel-nav:hover {
          background: #8b5cf6;
        }

        .carousel-nav.prev {
          left: 1rem;
        }

        .carousel-nav.next {
          right: 1rem;
        }

        .carousel-dots {
          position: absolute;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 0.75rem;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .dot.active {
          width: 24px;
          border-radius: 4px;
          background: #8b5cf6;
        }

        .thumbnail-strip {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
          overflow-x: auto;
          padding: 0.5rem;
        }

        .thumbnail {
          position: relative;
          width: 120px;
          height: 80px;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          flex-shrink: 0;
          border: 2px solid transparent;
          transition: all 0.2s;
        }

        .thumbnail.active {
          border-color: #8b5cf6;
          transform: scale(1.02);
        }

        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumbnail-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
        }

        .thumbnail.active .thumbnail-overlay {
          background: rgba(139, 92, 246, 0.3);
        }

        .thumbnail-title {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 0.25rem;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          font-size: 0.7rem;
          color: white;
          text-align: center;
        }

        @media (max-width: 768px) {
          .carousel-slide {
            height: 400px;
          }
          .carousel-content {
            padding: 1.5rem;
          }
          .post-title {
            font-size: 1.5rem;
          }
          .post-description {
            font-size: 0.875rem;
          }
          .thumbnail-strip {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}