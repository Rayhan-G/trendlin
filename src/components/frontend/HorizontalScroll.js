// src/components/frontend/HorizontalScroll.js

import PostCard from './PostCard'

export default function HorizontalScroll({ title, posts, showRank = false }) {
  if (!posts || posts.length === 0) return null

  return (
    <div className="horizontal-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <div className="section-line"></div>
      </div>
      
      <div className="horizontal-scroll">
        {posts.map((post, index) => (
          <div key={post.id} className="scroll-item">
            <PostCard post={post} rank={showRank ? index + 1 : null} />
          </div>
        ))}
      </div>

      <style jsx>{`
        .horizontal-section {
          margin-bottom: 3rem;
        }
        
        .section-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
          white-space: nowrap;
        }
        
        :global(html.dark) .section-title {
          color: #f9fafb;
        }
        
        .section-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, #e5e7eb, transparent);
        }
        
        :global(html.dark) .section-line {
          background: linear-gradient(90deg, #374151, transparent);
        }
        
        .horizontal-scroll {
          display: flex;
          overflow-x: auto;
          gap: 1.5rem;
          padding-bottom: 1rem;
          scrollbar-width: none;
          -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch;
        }
        
        .horizontal-scroll::-webkit-scrollbar {
          display: none;
        }
        
        .scroll-item {
          flex-shrink: 0;
          width: auto;
          min-width: 240px;
          max-width: 320px;
        }
        
        @media (max-width: 768px) {
          .horizontal-scroll {
            gap: 1rem;
          }
          
          .scroll-item {
            min-width: 220px;
            max-width: 280px;
          }
          
          .section-title {
            font-size: 1.1rem;
          }
        }
        
        @media (max-width: 640px) {
          .scroll-item {
            min-width: 200px;
            max-width: 260px;
          }
        }
      `}</style>
    </div>
  )
}