import Link from 'next/link'

export default function PostCard({ post, rank = null }) {
  return (
    <Link href={`/blog/${post.slug}`} className="post-card">
      <div className="post-card-image-wrapper">
        <img src={post.featured_image} alt={post.title} className="post-card-image" />
        {rank && <div className="post-card-rank">#{rank}</div>}
      </div>
      <div className="post-card-content">
        <div className="post-card-category">{post.category}</div>
        <h3 className="post-card-title">{post.title}</h3>
        <div className="post-card-meta">
          <span className="post-card-date">{post.date}</span>
          <span className="post-card-dot">•</span>
          <span className="post-card-author">{post.author}</span>
        </div>
        <div className="post-card-footer">
          <span className="post-card-read">Read article →</span>
        </div>
      </div>

      <style jsx>{`
        .post-card {
          flex: 0 0 300px;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          cursor: pointer;
        }
        
        :global(body.dark) .post-card {
          background: #1e293b;
          border-color: rgba(255, 255, 255, 0.05);
        }
        
        .post-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.15);
        }
        
        .post-card-image-wrapper {
          position: relative;
          height: 180px;
          overflow: hidden;
          background: #f1f5f9;
        }
        
        .post-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        
        .post-card:hover .post-card-image {
          transform: scale(1.05);
        }
        
        .post-card-rank {
          position: absolute;
          top: 12px;
          right: 12px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 700;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }
        
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
          /* Full title visible - no line clamp */
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        
        :global(body.dark) .post-card-title {
          color: #f1f5f9;
        }
        
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
        
        .post-card-date, .post-card-author {
          white-space: nowrap;
        }
        
        .post-card-dot {
          color: #cbd5e1;
        }
        
        .post-card-footer {
          margin-top: 0.5rem;
        }
        
        .post-card-read {
          font-size: 0.75rem;
          font-weight: 500;
          color: #2563eb;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: gap 0.2s;
        }
        
        .post-card-read:hover {
          gap: 8px;
        }
        
        /* Desktop Large */
        @media (min-width: 1280px) {
          .post-card {
            flex: 0 0 320px;
          }
          .post-card-image-wrapper {
            height: 190px;
          }
          .post-card-title {
            font-size: 1.1rem;
          }
        }
        
        /* Desktop */
        @media (max-width: 1279px) and (min-width: 1025px) {
          .post-card {
            flex: 0 0 300px;
          }
          .post-card-image-wrapper {
            height: 170px;
          }
        }
        
        /* Tablet */
        @media (max-width: 1024px) and (min-width: 769px) {
          .post-card {
            flex: 0 0 280px;
          }
          .post-card-image-wrapper {
            height: 160px;
          }
          .post-card-title {
            font-size: 0.95rem;
          }
        }
        
        /* Mobile */
        @media (max-width: 768px) {
          .post-card {
            flex: 0 0 260px;
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
          .post-card-category {
            font-size: 0.65rem;
          }
          .post-card-meta {
            font-size: 0.65rem;
          }
        }
        
        /* Small Mobile */
        @media (max-width: 480px) {
          .post-card {
            flex: 0 0 250px;
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
          .post-card-rank {
            width: 30px;
            height: 30px;
            font-size: 0.75rem;
            top: 8px;
            right: 8px;
          }
        }
      `}</style>
    </Link>
  )
}