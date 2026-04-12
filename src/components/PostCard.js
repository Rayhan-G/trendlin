import Link from 'next/link'

export default function PostCard({ post, rank = null }) {
  if (!post) return null

  return (
    <Link href={`/blog/${post.slug}`} className="post-card-link">
      <div className="post-card">
        {/* Rank Badge - Top Left */}
        {rank && (
          <div className="rank-badge">
            <span className="rank-number">#{rank}</span>
          </div>
        )}
        
        {/* Image Section */}
        <div className="post-card-image-wrapper">
          <img 
            src={post.featured_image || post.image_url || '/images/placeholder.jpg'} 
            alt={post.title}
            className="post-card-image"
            onError={(e) => {
              e.target.src = '/images/placeholder.jpg'
            }}
          />
        </div>
        
        {/* Content Section */}
        <div className="post-card-content">
          <div className="post-card-category">{post.category || 'General'}</div>
          <h3 className="post-card-title">{post.title}</h3>
          
          {/* Excerpt - Only show if available */}
          {(post.excerpt || post.content) && (
            <p className="post-card-excerpt">
              {post.excerpt || post.content?.substring(0, 100) || ''}
            </p>
          )}
          
          {/* Meta Information */}
          <div className="post-card-meta">
            <span className="post-card-date">
              {new Date(post.created_at || post.date || Date.now()).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            {post.author && (
              <>
                <span className="post-card-dot">•</span>
                <span className="post-card-author">{post.author}</span>
              </>
            )}
            {post.read_time && (
              <>
                <span className="post-card-dot">•</span>
                <span className="post-card-read-time">{post.read_time}</span>
              </>
            )}
          </div>
          
          {/* Footer with Read More */}
          <div className="post-card-footer">
            <span className="post-card-read">
              Read article <span className="arrow">→</span>
            </span>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .post-card-link {
          text-decoration: none;
          color: inherit;
          flex-shrink: 0;
          width: 300px;
          scroll-snap-align: start;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .post-card-link:hover {
          transform: translateY(-6px);
        }
        
        .post-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        :global(body.dark) .post-card {
          background: #1e293b;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          border-color: rgba(255, 255, 255, 0.05);
        }
        
        .post-card:hover {
          box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.15);
        }
        
        /* Rank Badge */
        .rank-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 2;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border-radius: 12px;
          padding: 6px 12px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }
        
        .rank-number {
          font-size: 0.85rem;
          font-weight: 700;
          color: white;
        }
        
        /* Image Section */
        .post-card-image-wrapper {
          position: relative;
          height: 180px;
          overflow: hidden;
          background: #f1f5f9;
        }
        
        :global(body.dark) .post-card-image-wrapper {
          background: #0f172a;
        }
        
        .post-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        
        .post-card-link:hover .post-card-image {
          transform: scale(1.05);
        }
        
        /* Content Section */
        .post-card-content {
          padding: 1rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .post-card-category {
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #2563eb;
        }
        
        :global(body.dark) .post-card-category {
          color: #60a5fa;
        }
        
        .post-card-title {
          font-size: 1rem;
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
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        :global(body.dark) .post-card-excerpt {
          color: #94a3b8;
        }
        
        /* Meta Section */
        .post-card-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          color: #64748b;
          flex-wrap: wrap;
        }
        
        :global(body.dark) .post-card-meta {
          color: #94a3b8;
        }
        
        .post-card-date, 
        .post-card-author, 
        .post-card-read-time {
          white-space: nowrap;
        }
        
        .post-card-dot {
          color: #cbd5e1;
        }
        
        /* Footer */
        .post-card-footer {
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid #e2e8f0;
        }
        
        :global(body.dark) .post-card-footer {
          border-top-color: #334155;
        }
        
        .post-card-read {
          font-size: 0.75rem;
          font-weight: 600;
          color: #2563eb;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: gap 0.2s ease;
        }
        
        .arrow {
          transition: transform 0.2s ease;
        }
        
        .post-card-read:hover {
          gap: 8px;
        }
        
        .post-card-read:hover .arrow {
          transform: translateX(4px);
        }
        
        /* Responsive Design */
        @media (min-width: 1280px) {
          .post-card-link {
            width: 320px;
          }
          .post-card-image-wrapper {
            height: 190px;
          }
          .post-card-title {
            font-size: 1.1rem;
          }
        }
        
        @media (max-width: 1024px) and (min-width: 769px) {
          .post-card-link {
            width: 280px;
          }
          .post-card-image-wrapper {
            height: 160px;
          }
          .post-card-title {
            font-size: 0.95rem;
          }
        }
        
        @media (max-width: 768px) {
          .post-card-link {
            width: 260px;
          }
          .post-card-image-wrapper {
            height: 150px;
          }
          .post-card-content {
            padding: 0.875rem;
          }
          .post-card-title {
            font-size: 0.9rem;
          }
          .post-card-excerpt {
            font-size: 0.8rem;
          }
          .rank-badge {
            top: 8px;
            right: 8px;
            padding: 4px 10px;
          }
          .rank-number {
            font-size: 0.75rem;
          }
        }
        
        @media (max-width: 480px) {
          .post-card-link {
            width: 250px;
          }
          .post-card-image-wrapper {
            height: 140px;
          }
          .post-card-content {
            padding: 0.75rem;
          }
          .post-card-title {
            font-size: 0.85rem;
          }
          .post-card-excerpt {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </Link>
  )
}