// src/components/frontend/PostCard.jsx
import Link from 'next/link'
import { useState, useEffect } from 'react'

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

      <style jsx>{`
        .post-card-container {
          position: relative;
          overflow: visible;
          width: 100%;
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
          border-radius: 20px;
          overflow: hidden;
          height: 100%;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .post-card.light {
          background: white;
          border: 1px solid #eef2ff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.03);
        }
        
        .post-card.dark {
          background: #1e293b;
          border: 1px solid #334155;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .post-card-link:hover .post-card {
          box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.12), 0 4px 8px -4px rgba(0, 0, 0, 0.05);
        }
        
        .rank-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 20;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: linear-gradient(135deg, #f59e0b, #ea580c);
          box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3);
        }
        
        .rank-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent);
          border-radius: 12px;
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
          background: #f1f5f9;
        }
        
        .post-card-image img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }
        
        .post-card-link:hover .post-card-image img {
          transform: scale(1.06);
        }
        
        .post-card-content {
          padding: 1.125rem;
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
          padding: 0.25rem 0.75rem;
          border-radius: 24px;
          background: rgba(139, 92, 246, 0.08);
        }
        
        .post-card.light .post-category {
          background: #f8fafc;
        }
        
        .post-card.dark .post-category {
          background: #334155;
        }
        
        .category-dot {
          width: 5px;
          height: 5px;
          background: currentColor;
          border-radius: 50%;
        }
        
        .read-time {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.65rem;
          font-weight: 500;
        }
        
        .post-card.light .read-time {
          color: #64748b;
        }
        
        .post-card.dark .read-time {
          color: #94a3b8;
        }
        
        .post-title {
          font-size: 1.125rem;
          font-weight: 700;
          line-height: 1.4;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .post-card.light .post-title {
          color: #0f172a;
        }
        
        .post-card.dark .post-title {
          color: #f1f5f9;
        }
        
        .post-excerpt {
          font-size: 0.8125rem;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0;
        }
        
        .post-card.light .post-excerpt {
          color: #475569;
        }
        
        .post-card.dark .post-excerpt {
          color: #94a3b8;
        }
        
        .post-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 0.875rem;
          border-top: 1px solid;
        }
        
        .post-card.light .post-footer {
          border-top-color: #e2e8f0;
        }
        
        .post-card.dark .post-footer {
          border-top-color: #334155;
        }
        
        .post-meta {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          flex-wrap: wrap;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.7rem;
          font-weight: 500;
        }
        
        .post-card.light .meta-item {
          color: #64748b;
        }
        
        .post-card.dark .meta-item {
          color: #94a3b8;
        }
        
        .read-more {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.75rem;
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
          transform: translateX(4px);
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .post-card {
            border-radius: 16px;
          }
          
          .post-card-content {
            padding: 1rem;
            gap: 0.625rem;
          }
          
          .post-title {
            font-size: 1rem;
            -webkit-line-clamp: 3;
          }
          
          .post-excerpt {
            font-size: 0.75rem;
          }
        }
        
        @media (max-width: 480px) {
          .post-card {
            border-radius: 14px;
          }
          
          .post-card-content {
            padding: 0.875rem;
            gap: 0.5rem;
          }
          
          .post-title {
            font-size: 0.9375rem;
            font-weight: 700;
            -webkit-line-clamp: 3;
            line-height: 1.4;
          }
          
          .post-excerpt {
            font-size: 0.7rem;
            -webkit-line-clamp: 2;
            line-height: 1.45;
          }
          
          .post-category {
            font-size: 0.6rem;
            padding: 0.2rem 0.5rem;
          }
          
          .read-time {
            font-size: 0.55rem;
          }
          
          .meta-item {
            font-size: 0.55rem;
          }
          
          .post-card-image {
            aspect-ratio: 16 / 9;
          }
          
          .rank-badge {
            width: 28px;
            height: 28px;
            top: 10px;
            left: 10px;
            border-radius: 10px;
          }
          
          .rank-number {
            font-size: 0.7rem;
          }
        }
        
        /* Landscape mode */
        @media (max-width: 768px) and (orientation: landscape) {
          .post-card-image {
            aspect-ratio: 16 / 9;
          }
          
          .post-title {
            font-size: 0.9rem;
          }
        }
        
        /* Touch-friendly */
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