// src/components/category/health/HealthGrid.js

import { useState } from 'react'
import PostCard from '@/components/frontend/PostCard'

export default function HealthGrid({ posts, viewMode = 'grid', loading = false }) {
  const [displayCount, setDisplayCount] = useState(12)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const displayedPosts = posts.slice(0, displayCount)
  const hasMore = displayCount < posts.length

  const loadMore = async () => {
    setIsLoadingMore(true)
    await new Promise(resolve => setTimeout(resolve, 600))
    setDisplayCount(prev => Math.min(prev + 9, posts.length))
    setIsLoadingMore(false)
  }

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
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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
          <div className="empty-icon">🌿</div>
          <h3>No wellness insights found</h3>
          <p>Check back later for mindfulness, fitness, and nutrition content!</p>
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
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="health-grid-wrapper">
      {/* Results Info */}
      <div className="results-info">
        <span className="results-count">
          Showing <strong>{displayedPosts.length}</strong> of <strong>{posts.length}</strong> wellness practices
        </span>
      </div>

      {/* Main Grid */}
      <div className={`health-grid ${viewMode}`}>
        {displayedPosts.map((post, index) => (
          <div 
            key={post.id} 
            className="grid-item"
            style={{ animationDelay: `${index * 0.03}s` }}
          >
            <PostCard post={post} variant="health" />
          </div>
        ))}
      </div>

      {/* Load More */}
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
                Loading more wellness...
              </>
            ) : (
              <>
                Discover More Practices
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M19 12l-7 7-7-7"/>
                </svg>
              </>
            )}
          </button>
        </div>
      )}

      <style jsx>{`
        .health-grid-wrapper {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem;
        }

        /* Results Info */
        .results-info {
          margin-bottom: 1.5rem;
          text-align: right;
        }

        .results-count {
          font-size: 0.875rem;
          color: #6b7280;
        }

        /* Main Grid */
        .health-grid {
          display: grid;
          gap: 1.5rem;
          transition: all 0.3s ease;
        }

        .health-grid.grid {
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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
          padding-top: 2rem;
          border-top: 1px solid #e5e7eb;
        }

        :global(html.dark) .load-more-container {
          border-top-color: #334155;
        }

        .load-more-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 2rem;
          background: linear-gradient(135deg, #10b981, #059669);
          border: none;
          border-radius: 40px;
          font-weight: 600;
          font-size: 0.875rem;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(16,185,129,0.3);
        }

        .load-more-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(16,185,129,0.4);
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
          box-shadow: 0 6px 16px rgba(16,185,129,0.2);
          border-color: #10b981;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .health-grid-wrapper {
            padding: 1rem;
          }

          .health-grid.grid {
            grid-template-columns: 1fr;
            gap: 1rem;
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