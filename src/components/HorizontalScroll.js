import { useRef } from 'react'
import PostCard from './PostCard'

export default function HorizontalScroll({ title, posts, showRank = false }) {
  const scrollRef = useRef(null)

  const scroll = (direction) => {
    if (scrollRef.current) {
      const cardWidth = window.innerWidth >= 1280 ? 320 : window.innerWidth >= 768 ? 280 : 260
      const scrollAmount = direction === 'left' ? -cardWidth * 3 : cardWidth * 3
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
        </div>
        <div className="empty-state">No posts available. Check back soon!</div>
        <style jsx>{`
          .section { margin: 3rem 0; }
          .section-header { margin-bottom: 1.5rem; }
          .section-title {
            font-size: 1.6rem;
            font-weight: 700;
            border-left: 4px solid #2563eb;
            padding-left: 1rem;
          }
          .empty-state {
            text-align: center;
            padding: 2rem;
            background: #f8fafc;
            border-radius: 16px;
            color: #64748b;
          }
          @media (max-width: 768px) {
            .section-title { font-size: 1.3rem; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {posts.length > 4 && (
          <div className="scroll-controls">
            <button className="scroll-btn" onClick={() => scroll('left')} aria-label="Scroll left">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <button className="scroll-btn" onClick={() => scroll('right')} aria-label="Scroll right">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="horizontal-scroll" ref={scrollRef}>
        {posts.map((post, index) => (
          <PostCard key={post.id} post={post} rank={showRank ? index + 1 : null} />
        ))}
      </div>

      <style jsx>{`
        .section {
          margin: 3rem 0;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          padding: 0 0.25rem;
        }
        
        .section-title {
          font-size: 1.6rem;
          font-weight: 700;
          border-left: 4px solid #2563eb;
          padding-left: 1rem;
        }
        
        :global(body.dark) .section-title {
          color: #f1f5f9;
        }
        
        .scroll-controls {
          display: flex;
          gap: 0.5rem;
        }
        
        .scroll-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: white;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        :global(body.dark) .scroll-btn {
          background: #1e293b;
          border-color: #334155;
          color: white;
        }
        
        .scroll-btn:hover {
          background: #2563eb;
          border-color: #2563eb;
          color: white;
        }
        
        .horizontal-scroll {
          display: flex;
          overflow-x: auto;
          gap: 1.25rem;
          padding: 0.5rem 0.25rem;
          scroll-behavior: smooth;
          scroll-snap-type: x mandatory;
        }
        
        .horizontal-scroll::-webkit-scrollbar {
          display: none;
        }
        
        @media (max-width: 768px) {
          .section {
            margin: 2rem 0;
          }
          .section-title {
            font-size: 1.3rem;
          }
          .scroll-controls {
            display: none;
          }
          .horizontal-scroll {
            gap: 1rem;
          }
        }
        
        @media (max-width: 480px) {
          .section-title {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  )
}