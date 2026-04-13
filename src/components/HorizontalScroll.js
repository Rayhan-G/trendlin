import { useRef } from 'react'
import PostCard from './PostCard'

export default function HorizontalScroll({ title, posts, showRank = false }) {
  const scrollRef = useRef(null)

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  if (!posts || posts.length === 0) {
    return null
  }

  return (
    <div className="horizontal-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {posts.length > 3 && (
          <div className="scroll-buttons">
            <button onClick={() => scroll('left')} className="scroll-btn" aria-label="Scroll left">
              ←
            </button>
            <button onClick={() => scroll('right')} className="scroll-btn" aria-label="Scroll right">
              →
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
        .horizontal-section {
          margin: 2.5rem 0;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }
        
        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          border-left: 4px solid #667eea;
          padding-left: 1rem;
        }
        
        :global(body.dark) .section-title {
          color: #f1f5f9;
        }
        
        .scroll-buttons {
          display: flex;
          gap: 0.5rem;
        }
        
        .scroll-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: white;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          font-size: 1rem;
        }
        
        .scroll-btn:hover {
          background: #667eea;
          border-color: #667eea;
          color: white;
        }
        
        :global(body.dark) .scroll-btn {
          background: #1e293b;
          border-color: #334155;
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
          .horizontal-section {
            margin: 1.5rem 0;
          }
          
          .section-title {
            font-size: 1.2rem;
          }
          
          .scroll-buttons {
            display: none;
          }
          
          .horizontal-scroll {
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  )
}