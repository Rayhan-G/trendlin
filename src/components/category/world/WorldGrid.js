// src/components/category/world/WorldGrid.js

import { useState } from 'react'
import PostCard from '@/components/frontend/PostCard'

export default function WorldGrid({ posts, loading = false, viewMode = 'grid' }) {
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
      <div className="masonry-loading">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-title"></div>
            <div className="skeleton-text"></div>
          </div>
        ))}
        <style jsx>{`
          .masonry-loading {
            column-count: 3;
            column-gap: 1.5rem;
            max-width: 1280px;
            margin: 0 auto;
            padding: 2rem;
          }
          .skeleton-card {
            break-inside: avoid;
            margin-bottom: 1.5rem;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          :global(html.dark) .skeleton-card {
            background: #1e293b;
          }
          .skeleton-image {
            height: 200px;
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
          @media (max-width: 1024px) {
            .masonry-loading { column-count: 2; }
          }
          @media (max-width: 640px) {
            .masonry-loading { column-count: 1; }
          }
        `}</style>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="empty-masonry">
        <div className="empty-content">
          <div className="empty-icon">📰</div>
          <h3>No posts found</h3>
          <p>Check back later for new content</p>
        </div>
        <style jsx>{`
          .empty-masonry {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 400px;
            padding: 3rem;
          }
          .empty-content {
            text-align: center;
          }
          .empty-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
          }
          .empty-content h3 {
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
            color: #111827;
          }
          :global(html.dark) .empty-content h3 {
            color: #f9fafb;
          }
          .empty-content p {
            color: #6b7280;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="masonry-grid-wrapper">
      {viewMode === 'grid' ? (
        <div className="masonry-grid">
          {displayedPosts.map((post, index) => (
            <div 
              key={post.id} 
              className="masonry-item"
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <PostCard post={post} variant="world" />
            </div>
          ))}
        </div>
      ) : (
        <div className="list-view">
          {displayedPosts.map((post, index) => (
            <div 
              key={post.id} 
              className="list-item"
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <PostCard post={post} variant="world" layout="horizontal" />
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="load-more">
          <button 
            className="load-more-btn"
            onClick={loadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <span className="spinner"></span>
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}

      <style jsx>{`
        .masonry-grid-wrapper {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem;
        }

        .masonry-grid {
          column-count: 3;
          column-gap: 1.5rem;
        }

        .masonry-item {
          break-inside: avoid;
          margin-bottom: 1.5rem;
          opacity: 0;
          animation: fadeInUp 0.4s ease-out forwards;
        }

        .list-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .list-item {
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

        .load-more {
          display: flex;
          justify-content: center;
          margin-top: 2rem;
          padding-top: 1rem;
        }

        .load-more-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 2rem;
          background: linear-gradient(135deg, #06b6d4, #0891b2);
          border: none;
          border-radius: 40px;
          font-weight: 600;
          font-size: 0.875rem;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .load-more-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(6,182,212,0.3);
        }

        .load-more-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
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

        /* Responsive */
        @media (max-width: 1024px) {
          .masonry-grid {
            column-count: 2;
          }
        }

        @media (max-width: 640px) {
          .masonry-grid-wrapper {
            padding: 1rem;
          }
          
          .masonry-grid {
            column-count: 1;
            column-gap: 0;
          }
          
          .masonry-item {
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </div>
  )
}