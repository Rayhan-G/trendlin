import Link from 'next/link'
import { optimizeImage } from '@/lib/cloudinary'

export default function PostCard({ post, rank = null }) {
  if (!post) return null

  return (
    <Link href={`/blog/${post.slug}`} className="post-card-link">
      <div className="post-card">
        {rank && (
          <div className="rank-badge">
            <span className="rank-number">#{rank}</span>
          </div>
        )}
        
        <div className="post-card-image">
          <img 
            src={optimizeImage(post.image_url || post.featured_image || '/images/placeholder.jpg')} 
            alt={post.title}
            loading="lazy"
          />
        </div>
        
        <div className="post-card-content">
          <div className="post-category">{post.category || 'General'}</div>
          <h3 className="post-title">{post.title}</h3>
          <p className="post-excerpt">{post.excerpt?.substring(0, 100)}...</p>
          <div className="post-meta">
            <span className="post-date">
              {new Date(post.created_at).toLocaleDateString()}
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
          transition: transform 0.2s ease;
        }
        
        .post-card-link:hover {
          transform: translateY(-4px);
        }
        
        .post-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        
        :global(body.dark) .post-card {
          background: #1e293b;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        .rank-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 2;
          background: linear-gradient(135deg, #f59e0b, #ea580c);
          border-radius: 12px;
          padding: 4px 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        
        .rank-number {
          font-size: 0.9rem;
          font-weight: 700;
          color: white;
        }
        
        .post-card-image {
          position: relative;
          width: 100%;
          height: 180px;
          overflow: hidden;
          background: #f1f5f9;
        }
        
        .post-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        .post-card-link:hover .post-card-image img {
          transform: scale(1.05);
        }
        
        .post-card-content {
          padding: 1rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .post-category {
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #2563eb;
          margin-bottom: 0.5rem;
        }
        
        .post-title {
          font-size: 1rem;
          font-weight: 700;
          line-height: 1.4;
          margin-bottom: 0.5rem;
          color: #0f172a;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        :global(body.dark) .post-title {
          color: #f1f5f9;
        }
        
        .post-excerpt {
          font-size: 0.85rem;
          line-height: 1.5;
          color: #475569;
          margin-bottom: 0.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .post-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          color: #64748b;
          margin-top: auto;
        }
        
        @media (max-width: 768px) {
          .post-card-link {
            width: 260px;
          }
          
          .post-card-image {
            height: 160px;
          }
        }
      `}</style>
    </Link>
  )
}