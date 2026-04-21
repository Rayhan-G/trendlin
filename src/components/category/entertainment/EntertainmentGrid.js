// src/components/category/entertainment/EntertainmentGrid.js

import { useState, useEffect } from 'react'
import PostCard from '@/components/frontend/PostCard'

export default function EntertainmentGrid({ posts, viewMode = 'grid', loading = false }) {
  const [displayCount, setDisplayCount] = useState(12)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const displayedPosts = posts.slice(0, displayCount)
  const hasMore = displayCount < posts.length

  // Reset display count when posts change
  useEffect(() => {
    setDisplayCount(12)
  }, [posts])

  const loadMore = async () => {
    setIsLoadingMore(true)
    await new Promise(resolve => setTimeout(resolve, 600))
    setDisplayCount(prev => Math.min(prev + 8, posts.length))
    setIsLoadingMore(false)
  }

  // Get featured posts (top 3 by views/rating)
  const featuredPosts = posts.slice(0, 3)

  if (loading) {
    return (
      <div className="grid-loading">
        <div className="loading-skeleton">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-image"></div>
              <div className="skeleton-title"></div>
              <div className="skeleton-text"></div>
            </div>
          ))}
        </div>
        <style jsx>{`
          .grid-loading {
            max-width: 1280px;
            margin: 0 auto;
            padding: 2rem;
          }
          .loading-skeleton {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
          }
          .skeleton-card {
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }
          :global(html.dark) .skeleton-card {
            background: #1e293b;
          }
          .skeleton-image {
            aspect-ratio: 16/9;
            background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
          .skeleton-title {
            height: 20px;
            background: #e2e8f0;
            margin: 1rem;
            border-radius: 4px;
          }
          .skeleton-text {
            height: 60px;
            background: #e2e8f0;
            margin: 0 1rem 1rem 1rem;
            border-radius: 4px;
          }
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-content">
          <div className="empty-icon">🎬</div>
          <h3>No entertainment content found</h3>
          <p>Check back later for the latest movies, music, and gaming news!</p>
        </div>
        <style jsx>{`
          .empty-state {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 500px;
            padding: 3rem 2rem;
          }
          .empty-state-content {
            text-align: center;
            max-width: 500px;
          }
          .empty-icon {
            font-size: 5rem;
            margin-bottom: 1.5rem;
            animation: float 3s ease-in-out infinite;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .empty-state-content h3 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.75rem;
            color: #111827;
          }
          :global(html.dark) .empty-state-content h3 {
            color: #f9fafb;
          }
          .empty-state-content p {
            color: #6b7280;
            margin-bottom: 1.5rem;
            line-height: 1.5;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="entertainment-grid-wrapper">
      {/* Featured Section */}
      {viewMode === 'grid' && posts.length >= 3 && (
        <div className="featured-section">
          <div className="featured-header">
            <h2 className="featured-title">
              <span className="featured-icon">⭐</span>
              Editor's Picks
            </h2>
          </div>
          <div className="featured-grid">
            {featuredPosts.map((post, index) => (
              <div key={post.id} className={`featured-item ${index === 0 ? 'featured-large' : ''}`}>
                <PostCard post={post} variant="entertainment" featured={index === 0} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid Header */}
      <div className="grid-header">
        <div className="grid-title">
          <h2>
            {viewMode === 'grid' ? 'Latest Entertainment' : 'All Content'}
            <span className="grid-count">({displayedPosts.length} {displayedPosts.length === 1 ? 'item' : 'items'})</span>
          </h2>
        </div>
      </div>

      {/* Main Grid */}
      <div className={`entertainment-grid ${viewMode}`}>
        {displayedPosts.map((post, index) => (
          <div 
            key={post.id} 
            className="grid-item"
            style={{ animationDelay: `${index * 0.03}s` }}
          >
            <PostCard post={post} variant="entertainment" />
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="load-more-container">
          <button 
            className="load-more-btn"
            onClick={loadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <div className="btn-spinner"></div>
                Loading more...
              </>
            ) : (
              <>
                Show More Entertainment
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 13l-7 7-7-7M12 4v16"/>
                </svg>
              </>
            )}
          </button>
          <div className="load-more-info">
            Showing {displayedPosts.length} of {posts.length} articles
          </div>
        </div>
      )}

      {/* Back to Top Button */}
      {displayedPosts.length > 12 && (
        <button 
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
        </button>
      )}

      <style jsx>{`
        .entertainment-grid-wrapper {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem;
          position: relative;
        }

        /* Featured Section */
        .featured-section {
          margin-bottom: 3rem;
        }

        .featured-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .featured-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
        }

        :global(html.dark) .featured-title {
          color: #f9fafb;
        }

        .featured-icon {
          font-size: 1.5rem;
        }

        .featured-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .featured-large {
          grid-row: span 2;
        }

        .featured-item {
          transition: all 0.3s ease;
        }

        /* Grid Header */
        .grid-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .grid-title h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
        }

        :global(html.dark) .grid-title h2 {
          color: #f9fafb;
        }

        .grid-count {
          font-size: 0.875rem;
          font-weight: 400;
          color: #6b7280;
          margin-left: 0.5rem;
        }

        /* Main Grid */
        .entertainment-grid {
          display: grid;
          gap: 1.5rem;
          transition: all 0.3s ease;
        }

        .entertainment-grid.grid {
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }

        .entertainment-grid.list {
          grid-template-columns: 1fr;
        }

        .grid-item {
          opacity: 0;
          animation: fadeInUp 0.4s ease-out forwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Load More */
        .load-more-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          margin-top: 3rem;
          padding-top: 1rem;
        }

        .load-more-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 2rem;
          background: linear-gradient(135deg, #ec4899, #f43f5e);
          border: none;
          border-radius: 40px;
          font-weight: 600;
          font-size: 0.875rem;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(236,72,153,0.3);
        }

        .load-more-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(236,72,153,0.4);
        }

        .load-more-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .load-more-info {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        /* Back to Top */
        .back-to-top {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 48px;
          height: 48px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 100;
        }

        :global(html.dark) .back-to-top {
          background: #1e293b;
          border-color: #334155;
          color: #f9fafb;
        }

        .back-to-top:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(236,72,153,0.2);
          border-color: #ec4899;
        }

        /* Responsive */
        @media (max-width: 968px) {
          .featured-grid {
            grid-template-columns: 1fr;
          }
          
          .featured-large {
            grid-row: auto;
          }
        }

        @media (max-width: 768px) {
          .entertainment-grid-wrapper {
            padding: 1rem;
          }

          .entertainment-grid.grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .featured-header {
            flex-direction: column;
            align-items: stretch;
          }

          .grid-header {
            flex-direction: column;
            align-items: stretch;
          }

          .back-to-top {
            bottom: 1rem;
            right: 1rem;
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
    </div>
  )
}