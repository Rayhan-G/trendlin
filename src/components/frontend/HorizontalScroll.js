// src/components/frontend/HorizontalScroll.js

import PostCard from './PostCard'

export default function HorizontalScroll({ title, posts, showRank = false }) {
  if (!posts || posts.length === 0) return null

  // Show ALL posts (no slicing)
  const displayPosts = posts

  return (
    <div className="vertical-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <div className="section-line"></div>
      </div>
      
      <div className="vertical-grid">
        {displayPosts.map((post, index) => (
          <div key={post.id} className="grid-item">
            <PostCard post={post} rank={showRank ? index + 1 : null} />
          </div>
        ))}
      </div>

      <style jsx>{`
        .vertical-section {
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
        
        .vertical-grid {
          display: grid;
          gap: 1.5rem;
          max-height: 800px;
          overflow-y: auto;
          padding: 0.25rem 0.25rem 1rem 0.25rem;
        }
        
        /* Custom scrollbar styling */
        .vertical-grid::-webkit-scrollbar {
          width: 8px;
        }
        
        .vertical-grid::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .vertical-grid::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        
        .vertical-grid::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        :global(html.dark) .vertical-grid::-webkit-scrollbar-track {
          background: #1e293b;
        }
        
        :global(html.dark) .vertical-grid::-webkit-scrollbar-thumb {
          background: #475569;
        }
        
        /* Mobile: 2 columns, unlimited rows */
        .vertical-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        
        /* Tablet: 3 columns */
        @media (min-width: 768px) {
          .vertical-grid {
            grid-template-columns: repeat(3, 1fr);
            max-height: 700px;
          }
        }
        
        /* Desktop: 4 columns */
        @media (min-width: 1024px) {
          .vertical-grid {
            grid-template-columns: repeat(4, 1fr);
            max-height: 650px;
          }
        }
        
        /* Large Desktop: 5 columns */
        @media (min-width: 1280px) {
          .vertical-grid {
            grid-template-columns: repeat(5, 1fr);
            max-height: 600px;
          }
        }
        
        /* Extra Large Desktop: 6 columns */
        @media (min-width: 1536px) {
          .vertical-grid {
            grid-template-columns: repeat(6, 1fr);
            max-height: 550px;
          }
        }
        
        .grid-item {
          min-width: 0; /* Prevents overflow */
          width: 100%;
        }
        
        /* Ensure PostCard text doesn't get cut off */
        .grid-item :global(.post-card),
        .grid-item :global(.post-title),
        .grid-item :global(h3),
        .grid-item :global(p) {
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: normal;
        }
        
        /* Adjust gap for different screen sizes */
        @media (max-width: 768px) {
          .vertical-section {
            margin-bottom: 2rem;
          }
          
          .vertical-grid {
            gap: 1rem;
          }
          
          .section-title {
            font-size: 1.1rem;
          }
        }
        
        @media (min-width: 768px) and (max-width: 1023px) {
          .vertical-grid {
            gap: 1.25rem;
          }
        }
        
        @media (min-width: 1024px) {
          .vertical-grid {
            gap: 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}