import Link from 'next/link'
import { useState } from 'react'
import { optimizeImage } from '@/lib/cloudinary'

export default function PostCard({ post, rank = null, featured = false }) {
  const [imageLoaded, setImageLoaded] = useState(false)

  if (!post) return null

  // Get rank badge class based on position
  const getRankClass = () => {
    if (rank === 1) return 'rank-badge rank-1'
    if (rank === 2) return 'rank-badge rank-2'
    if (rank === 3) return 'rank-badge rank-3'
    return 'rank-badge'
  }

  return (
    <Link href={`/blog/${post.slug}`} className={`post-card-link ${featured ? 'featured' : ''}`}>
      <div className="post-card">
        {/* Rank Badge with special styling for top 3 */}
        {rank && (
          <div className={getRankClass()}>
            <span className="rank-number">#{rank}</span>
          </div>
        )}
        
        {/* Featured Badge */}
        {featured && (
          <div className="featured-badge">
            <span className="featured-icon">⭐</span>
            <span>Editor's Pick</span>
          </div>
        )}
        
        {/* Image Section */}
        <div className="post-card-image-wrapper">
          <div className={`image-skeleton ${imageLoaded ? 'hidden' : ''}`}></div>
          <img 
            src={optimizeImage(post.featured_image || post.image_url || '/images/placeholder.jpg')}
            alt={post.title}
            className={`post-card-image ${imageLoaded ? 'loaded' : ''}`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
        </div>
        
        {/* Content Section */}
        <div className="post-card-content">
          <div className="post-card-category">
            <span className="category-icon">{getCategoryIcon(post.category)}</span>
            {post.category || 'General'}
          </div>
          
          <h3 className="post-card-title">{post.title}</h3>
          
          <p className="post-card-excerpt">
            {post.excerpt?.substring(0, 100) || post.content?.substring(0, 100) || 'No excerpt available'}...
          </p>
          
          <div className="post-card-footer">
            <div className="post-card-meta">
              <span className="post-card-date">
                📅 {new Date(post.created_at || post.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              {post.author && (
                <>
                  <span className="post-card-dot">•</span>
                  <span className="post-card-author">✍️ {post.author}</span>
                </>
              )}
            </div>
            
            <div className="post-card-read">
              Read more
              <svg className="read-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .post-card-link {
          text-decoration: none;
          color: inherit;
          flex-shrink: 0;
          width: 320px;
          scroll-snap-align: start;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .post-card-link.featured {
          width: 380px;
        }
        
        .post-card-link:hover {
          transform: translateY(-6px);
        }
        
        .post-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        
        .post-card-link:hover .post-card {
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
        }
        
        :global(body.dark) .post-card {
          background: #1e293b;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        
        /* Rank Badges - Premium Styling */
        .rank-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 2;
          border-radius: 30px;
          padding: 6px 14px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(4px);
          transition: all 0.2s ease;
        }
        
        .rank-number {
          font-size: 0.85rem;
          font-weight: 800;
          color: white;
          letter-spacing: 0.5px;
        }
        
        /* Default rank style (4th and beyond) */
        .rank-badge {
          background: linear-gradient(135deg, #475569, #334155);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        /* Gold Medal - 1st Place */
        .rank-badge.rank-1 {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          border: 1px solid rgba(255, 215, 0, 0.5);
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
        }
        
        .rank-badge.rank-1 .rank-number {
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }
        
        /* Silver Medal - 2nd Place */
        .rank-badge.rank-2 {
          background: linear-gradient(135deg, #cbd5e1, #94a3b8);
          border: 1px solid rgba(203, 213, 225, 0.5);
          box-shadow: 0 4px 15px rgba(148, 163, 184, 0.3);
        }
        
        /* Bronze Medal - 3rd Place */
        .rank-badge.rank-3 {
          background: linear-gradient(135deg, #d97706, #b45309);
          border: 1px solid rgba(217, 119, 6, 0.5);
          box-shadow: 0 4px 15px rgba(217, 119, 6, 0.3);
        }
        
        /* Featured Badge */
        .featured-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 2;
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
          border-radius: 30px;
          padding: 6px 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          font-weight: 600;
          color: white;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
          backdrop-filter: blur(4px);
        }
        
        .featured-icon {
          font-size: 0.8rem;
        }
        
        /* Image Section */
        .post-card-image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background: #f1f5f9;
        }
        
        .image-skeleton {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        .image-skeleton.hidden {
          display: none;
        }
        
        .post-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
        }
        
        .post-card-image.loaded {
          opacity: 1;
        }
        
        .post-card-link:hover .post-card-image {
          transform: scale(1.05);
        }
        
        /* Content Section */
        .post-card-content {
          padding: 1.25rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .post-card-category {
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #6366f1;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .category-icon {
          font-size: 0.8rem;
        }
        
        :global(body.dark) .post-card-category {
          color: #818cf8;
        }
        
        .post-card-title {
          font-size: 1.1rem;
          font-weight: 700;
          line-height: 1.4;
          color: #0f172a;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        :global(body.dark) .post-card-title {
          color: #f1f5f9;
        }
        
        .post-card-excerpt {
          font-size: 0.85rem;
          line-height: 1.5;
          color: #475569;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        :global(body.dark) .post-card-excerpt {
          color: #94a3b8;
        }
        
        /* Footer */
        .post-card-footer {
          margin-top: auto;
          padding-top: 0.75rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          border-top: 1px solid #e2e8f0;
        }
        
        :global(body.dark) .post-card-footer {
          border-top-color: #334155;
        }
        
        .post-card-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          color: #64748b;
        }
        
        .post-card-read {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          font-weight: 600;
          color: #6366f1;
          transition: gap 0.2s ease;
        }
        
        .read-arrow {
          width: 14px;
          height: 14px;
          transition: transform 0.2s ease;
        }
        
        .post-card-link:hover .post-card-read {
          gap: 8px;
        }
        
        .post-card-link:hover .read-arrow {
          transform: translateX(2px);
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .post-card-link {
            width: 280px;
          }
          
          .post-card-link.featured {
            width: 300px;
          }
          
          .post-card-title {
            font-size: 1rem;
          }
          
          .post-card-excerpt {
            font-size: 0.8rem;
          }
          
          .rank-badge {
            padding: 4px 10px;
          }
          
          .rank-number {
            font-size: 0.75rem;
          }
        }
        
        @media (max-width: 480px) {
          .post-card-link {
            width: 260px;
          }
        }
      `}</style>
    </Link>
  )
}

// Helper function for category icons
function getCategoryIcon(category) {
  const icons = {
    tech: '⚡',
    technology: '⚡',
    wealth: '💰',
    health: '🌿',
    growth: '🌱',
    entertainment: '🎬',
    world: '🌍',
    lifestyle: '✨'
  }
  return icons[category?.toLowerCase()] || '📄'
}