// src/components/frontend/PostCard.js

import Link from 'next/link'
import { useState, useEffect } from 'react'
import BookmarkButton from './BookmarkButton'

export default function PostCard({ post, rank = null }) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark') || 
                     (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
      setIsDarkMode(isDark)
    }
    
    checkDarkMode()
    
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', checkDarkMode)
    
    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener('change', checkDarkMode)
    }
  }, [])

  if (!post) return null

  const getCategoryColor = (category) => {
    const colors = {
      health: '#10b981',
      wealth: '#f59e0b',
      tech: '#3b82f6',
      growth: '#22c55e',
      entertainment: '#ec4899',
      world: '#06b6d4',
      lifestyle: '#f97316'
    }
    return colors[category?.toLowerCase()] || '#8b5cf6'
  }

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const renderStars = (rating) => {
    if (!rating || rating === 0) return null
    
    const stars = []
    const fullStars = Math.floor(rating)
    const fractionalPart = rating - fullStars
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`full-${i}`} width="12" height="12" viewBox="0 0 24 24" style={{ marginRight: '2px' }}>
          <polygon 
            points="12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21" 
            fill="#f59e0b"
            stroke="#f59e0b"
            strokeWidth="1"
          />
        </svg>
      )
    }
    
    if (fractionalPart > 0 && fullStars < 5) {
      stars.push(
        <svg key="fractional" width="12" height="12" viewBox="0 0 24 24" style={{ marginRight: '2px' }}>
          <defs>
            <clipPath id={`clip-${post.id || Math.random()}`}>
              <rect x="0" y="0" width={fractionalPart * 24} height="24" />
            </clipPath>
          </defs>
          <polygon 
            points="12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21" 
            fill={isDarkMode ? '#4b5563' : '#d1d5db'}
            stroke={isDarkMode ? '#4b5563' : '#d1d5db'}
            strokeWidth="1"
          />
          <polygon 
            points="12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21" 
            fill="#f59e0b"
            stroke="#f59e0b"
            strokeWidth="1"
            clipPath={`url(#clip-${post.id || Math.random()})`}
          />
        </svg>
      )
    }
    
    const emptyStarsCount = 5 - stars.length
    for (let i = 0; i < emptyStarsCount; i++) {
      stars.push(
        <svg key={`empty-${i}`} width="12" height="12" viewBox="0 0 24 24" style={{ marginRight: '2px' }}>
          <polygon 
            points="12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21" 
            fill={isDarkMode ? '#4b5563' : '#d1d5db'}
            stroke={isDarkMode ? '#4b5563' : '#d1d5db'}
            strokeWidth="1"
          />
        </svg>
      )
    }
    
    return stars
  }

  const getImageUrl = () => {
    if (imageError) return '/images/placeholder.jpg'
    return post.image_url || post.featured_image || '/images/placeholder.jpg'
  }

  return (
    <div className="post-card-container">
      <Link href={`/blog/${post.slug}`} className="post-card-link">
        <div className={`post-card ${isDarkMode ? 'dark' : 'light'}`}>
          {rank && (
            <div className="rank-badge">
              <div className="rank-glow"></div>
              <span className="rank-number">{rank}</span>
            </div>
          )}
          
          <div className="post-card-image">
            <img 
              src={getImageUrl()} 
              alt={post.title || 'Post image'}
              loading="lazy"
              onError={() => setImageError(true)}
            />
          </div>
          
          <div className="post-card-content">
            <div className="post-header">
              <div 
                className="post-category"
                style={{ '--category-color': getCategoryColor(post.category) }}
              >
                <span className="category-dot"></span>
                <span>{post.category || 'General'}</span>
              </div>
              {post.read_time && (
                <div className="read-time">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>{post.read_time} min</span>
                </div>
              )}
            </div>
            
            <h3 className="post-title">{post.title || 'Untitled Post'}</h3>
            
            <p className="post-excerpt">
              {post.excerpt ? `${post.excerpt.substring(0, 100)}...` : 'No description available'}
            </p>
            
            {post.avg_rating > 0 && (
              <div className="rating-wrapper">
                <div className="stars-container">
                  {renderStars(post.avg_rating)}
                </div>
                <span className="rating-number">
                  {post.avg_rating.toFixed(1)}
                </span>
                {post.total_ratings > 0 && (
                  <span className="rating-count">
                    ({formatNumber(post.total_ratings)})
                  </span>
                )}
              </div>
            )}
            
            <div className="post-footer">
              <div className="post-meta">
                <div className="meta-item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>
                    {post.created_at 
                      ? new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Recent'}
                  </span>
                </div>
                <div className="meta-item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <span>{formatNumber(post.views)}</span>
                </div>
              </div>
              
              <div className="read-more">
                <span>Read</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Bookmark Button */}
      <div className="bookmark-wrapper">
        <BookmarkButton 
          postId={post.id}
          postTitle={post.title}
          postSlug={post.slug}
        />
      </div>

      <style jsx>{`
        .post-card-container {
          position: relative;
          overflow: visible;
          width: 100%;
        }
        
        .bookmark-wrapper {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 100;
          opacity: 0;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        
        .post-card-container:hover .bookmark-wrapper {
          opacity: 1;
        }
        
        .bookmark-wrapper:hover {
          transform: scale(1.05);
        }
        
        @media (max-width: 768px) {
          .bookmark-wrapper {
            opacity: 1;
          }
        }
        
        .post-card-link {
          text-decoration: none;
          color: inherit;
          display: block;
          width: 100%;
          transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }
        
        .post-card-link:hover {
          transform: translateY(-4px);
        }
        
        .post-card {
          border-radius: 16px;
          overflow: hidden;
          height: 100%;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .post-card.light {
          background: white;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .post-card.dark {
          background: #1f2937;
          border: 1px solid #374151;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        
        .post-card-link:hover .post-card {
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.02);
        }
        
        .rank-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          z-index: 10;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: linear-gradient(135deg, #f59e0b, #ea580c);
          box-shadow: 0 2px 8px rgba(245,158,11,0.3);
        }
        
        .rank-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent);
          border-radius: 10px;
        }
        
        .rank-number {
          font-size: 0.9rem;
          font-weight: 800;
          color: white;
          position: relative;
          z-index: 2;
        }
        
        .post-card-image {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background: #f3f4f6;
        }
        
        .post-card-image img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        
        .post-card-link:hover .post-card-image img {
          transform: scale(1.05);
        }
        
        .post-card-content {
          padding: 1rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .post-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .post-category {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--category-color);
          padding: 0.25rem 0.6rem;
          border-radius: 20px;
        }
        
        .post-card.light .post-category {
          background: #f3f4f6;
        }
        
        .post-card.dark .post-category {
          background: #374151;
        }
        
        .category-dot {
          width: 4px;
          height: 4px;
          background: currentColor;
          border-radius: 50%;
        }
        
        .read-time {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.65rem;
        }
        
        .post-card.light .read-time {
          color: #6b7280;
        }
        
        .post-card.dark .read-time {
          color: #9ca3af;
        }
        
        .post-title {
          font-size: 1.1rem;
          font-weight: 700;
          line-height: 1.35;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .post-card.light .post-title {
          color: #111827;
        }
        
        .post-card.dark .post-title {
          color: #f9fafb;
        }
        
        .post-excerpt {
          font-size: 0.8rem;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0;
        }
        
        .post-card.light .post-excerpt {
          color: #6b7280;
        }
        
        .post-card.dark .post-excerpt {
          color: #9ca3af;
        }
        
        .rating-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .stars-container {
          display: flex;
          align-items: center;
        }
        
        .rating-number {
          font-size: 0.75rem;
          font-weight: 600;
          color: #f59e0b;
        }
        
        .rating-count {
          font-size: 0.65rem;
          color: #6b7280;
        }
        
        .post-card.dark .rating-count {
          color: #9ca3af;
        }
        
        .post-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 0.75rem;
          border-top: 1px solid;
        }
        
        .post-card.light .post-footer {
          border-top-color: #e5e7eb;
        }
        
        .post-card.dark .post-footer {
          border-top-color: #374151;
        }
        
        .post-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.65rem;
        }
        
        .post-card.light .meta-item {
          color: #6b7280;
        }
        
        .post-card.dark .meta-item {
          color: #9ca3af;
        }
        
        .read-more {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.7rem;
          font-weight: 600;
          transition: gap 0.3s ease;
        }
        
        .post-card.light .read-more {
          color: #8b5cf6;
        }
        
        .post-card.dark .read-more {
          color: #a78bfa;
        }
        
        .read-more svg {
          transition: transform 0.3s ease;
        }
        
        .post-card-link:hover .read-more svg {
          transform: translateX(3px);
        }
        
        /* ========== IMPROVED MOBILE STYLES ========== */
        @media (max-width: 768px) {
          .post-card {
            border-radius: 12px;
          }
          
          .post-card-content {
            padding: 0.875rem;
            gap: 0.625rem;
          }
          
          .post-title {
            font-size: 1rem;
            -webkit-line-clamp: 3;
            line-height: 1.4;
          }
        }
        
        @media (max-width: 480px) {
          .post-card {
            border-radius: 10px;
          }
          
          .post-card-content {
            padding: 0.75rem;
            gap: 0.5rem;
          }
          
          .post-title {
            font-size: 0.95rem;
            font-weight: 700;
            -webkit-line-clamp: 3;
            line-height: 1.4;
          }
          
          .post-excerpt {
            font-size: 0.75rem;
            -webkit-line-clamp: 2;
            line-height: 1.4;
          }
          
          .post-category {
            font-size: 0.6rem;
            padding: 0.2rem 0.5rem;
          }
          
          .read-time {
            font-size: 0.6rem;
          }
          
          .meta-item {
            font-size: 0.6rem;
          }
          
          .post-card-image {
            aspect-ratio: 16 / 9;
          }
          
          .rank-badge {
            width: 26px;
            height: 26px;
            top: 6px;
            left: 6px;
          }
          
          .rank-number {
            font-size: 0.75rem;
          }
        }
        
        /* Landscape mode on mobile */
        @media (max-width: 768px) and (orientation: landscape) {
          .post-card-image {
            aspect-ratio: 16 / 9;
          }
          
          .post-title {
            font-size: 0.9rem;
          }
        }
        
        /* Touch-friendly improvements */
        @media (hover: none) and (pointer: coarse) {
          .read-more {
            gap: 0.5rem;
          }
          
          .meta-item {
            gap: 0.35rem;
          }
        }
      `}</style>
    </div>
  )
}