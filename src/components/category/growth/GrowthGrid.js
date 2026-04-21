// src/components/category/growth/GrowthGrid.js

import { useState } from 'react'
import PostCard from '@/components/frontend/PostCard'

export default function GrowthGrid({ posts, loading = false }) {
  const [displayCount, setDisplayCount] = useState(9)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const displayedPosts = posts.slice(0, displayCount)
  const hasMore = displayCount < posts.length

  const loadMore = async () => {
    setIsLoadingMore(true)
    await new Promise(resolve => setTimeout(resolve, 600))
    setDisplayCount(prev => Math.min(prev + 6, posts.length))
    setIsLoadingMore(false)
  }

  if (loading) {
    return (
      <div className="growth-grid-loading">
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
          .growth-grid-loading {
            max-width: 1280px;
            margin: 0 auto;
            padding: 2rem;
          }
          .loading-skeleton {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
            gap: 2rem;
          }
          .skeleton-card {
            background: white;
            border-radius: 16px;
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
          @media (max-width: 768px) {
            .loading-skeleton {
              grid-template-columns: 1fr;
              gap: 1.5rem;
            }
          }
        `}</style>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-content">
          <div className="empty-icon">🌱</div>
          <h3>No growth articles found</h3>
          <p>Check back later for new insights and strategies!</p>
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
            max-width: 400px;
          }
          .empty-icon {
            font-size: 4rem;
            margin-bottom: 1.5rem;
            opacity: 0.5;
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
          :global(html.dark) .empty-state-content p {
            color: #9ca3af;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="growth-grid-wrapper">
      {/* Grid Header with Stats */}
      <div className="grid-header">
        <div className="grid-stats">
          <span className="stats-count">{posts.length}</span>
          <span className="stats-label">
            {posts.length === 1 ? 'article' : 'articles'} for your growth journey
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="growth-grid">
        {displayedPosts.map((post, index) => (
          <div 
            key={post.id} 
            className="grid-item"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <PostCard post={post} variant="growth" />
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
                Show More Articles
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M19 12l-7 7-7-7"/>
                </svg>
              </>
            )}
          </button>
          <div className="load-more-info">
            Showing {displayedPosts.length} of {posts.length} articles
          </div>
        </div>
      )}

      <style jsx>{`
        .growth-grid-wrapper {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem;
        }

        /* Header Section */
        .grid-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        :global(html.dark) .grid-header {
          border-bottom-color: #374151;
        }

        .grid-stats {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }

        .stats-count {
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #10b981, #34d399);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .stats-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        :global(html.dark) .stats-label {
          color: #9ca3af;
        }

        /* Grid */
        .growth-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .grid-item {
          opacity: 0;
          animation: fadeInUp 0.5s ease-out forwards;
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

        /* Load More Section */
        .load-more-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          margin-top: 1rem;
          padding-top: 1rem;
        }

        .load-more-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 2rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          font-weight: 600;
          font-size: 0.875rem;
          color: #374151;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        :global(html.dark) .load-more-btn {
          background: #1a1a1a;
          border-color: #374151;
          color: #f9fafb;
        }

        .load-more-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #10b981, #059669);
          border-color: transparent;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16,185,129,0.3);
        }

        .load-more-btn:disabled {
          opacity: 0.6;
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

        /* Responsive */
        @media (max-width: 768px) {
          .growth-grid-wrapper {
            padding: 1rem;
          }

          .growth-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .grid-header {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  )
}