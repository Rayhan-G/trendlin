import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function RelatedPosts({ currentPostId, currentCategory }) {
  const [relatedPosts, setRelatedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    checkDarkMode()
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    async function fetchRelatedPosts() {
      try {
        setLoading(true)
        
        const { data: categoryPosts, error } = await supabase
          .from('posts')
          .select('id, title, slug, image_url, category, views, created_at, average_rating, total_ratings')
          .eq('category', currentCategory)
          .eq('status', 'published')
          .neq('id', currentPostId)
          .order('views', { ascending: false })
          .limit(4)

        if (error) throw error

        const formattedPosts = (categoryPosts || []).map(post => ({
          ...post,
          formattedDate: new Date(post.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          ratingStars: '★'.repeat(Math.round(post.average_rating || 0)),
          ratingValue: post.average_rating || 0
        }))

        setRelatedPosts(formattedPosts)
      } catch (err) {
        console.error('Error fetching related posts:', err)
      } finally {
        setLoading(false)
      }
    }

    if (currentPostId && currentCategory) {
      fetchRelatedPosts()
    }
  }, [currentPostId, currentCategory])

  if (loading || relatedPosts.length === 0) return null

  return (
    <div className={`related-posts ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="related-header">
        <div className="header-left">
          <span className="header-icon">📚</span>
          <h3>More from {currentCategory}</h3>
        </div>
        <Link href={`/category/${currentCategory.toLowerCase()}`} className="view-all">
          Browse all
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </Link>
      </div>
      
      <div className="related-grid">
        {relatedPosts.map((post, index) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="related-card" style={{ animationDelay: `${index * 0.1}s` }}>
            {post.image_url && (
              <div className="related-img">
                <img src={post.image_url} alt={post.title} loading="lazy" />
                <div className="img-overlay"></div>
              </div>
            )}
            <div className="related-content">
              <div className="related-cat-wrapper">
                <span className="related-cat">{post.category}</span>
                {post.ratingValue >= 4.5 && (
                  <span className="trending-badge">🔥 Trending</span>
                )}
              </div>
              <h4>{post.title}</h4>
              <div className="related-meta">
                <div className="meta-date">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>{post.formattedDate}</span>
                </div>
                <div className="meta-views">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <span>{post.views?.toLocaleString() || 0}</span>
                </div>
                {post.ratingValue > 0 && (
                  <div className="meta-rating">
                    <span className="rating-stars">{post.ratingStars}</span>
                    <span>{post.ratingValue.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <div className="read-more">
                Read article
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .related-posts {
          margin-top: 4rem;
          padding-top: 3rem;
          border-top: 1px solid #e9ecef;
          position: relative;
        }
        .related-posts::before {
          content: '';
          position: absolute;
          top: -1px;
          left: 0;
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #0056b3, #00a6ff);
          border-radius: 3px;
        }
        .related-posts.dark {
          border-top-color: #2c3e50;
        }
        .related-posts.dark::before {
          background: linear-gradient(90deg, #66b0ff, #00a6ff);
        }

        .related-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .header-icon {
          font-size: 1.5rem;
        }
        h3 {
          font-size: 1.35rem;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(135deg, #1a1a2e, #2c3e50);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .related-posts.dark h3 {
          background: linear-gradient(135deg, #ffffff, #e9ecef);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .view-all {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #0056b3;
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 40px;
          transition: all 0.2s ease;
          background: rgba(0, 86, 179, 0.05);
        }
        .related-posts.dark .view-all {
          color: #66b0ff;
          background: rgba(102, 176, 255, 0.1);
        }
        .view-all:hover {
          background: rgba(0, 86, 179, 0.1);
          transform: translateX(4px);
        }
        .view-all svg {
          transition: transform 0.2s;
        }
        .view-all:hover svg {
          transform: translateX(2px);
        }

        .related-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }
        .related-card {
          text-decoration: none;
          display: flex;
          gap: 1.25rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 1rem;
          border-radius: 20px;
          background: #ffffff;
          border: 1px solid #e9ecef;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          opacity: 0;
          animation: fadeInUp 0.5s ease forwards;
        }
        .related-posts.dark .related-card {
          background: #1a2632;
          border-color: #2c3e50;
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
        .related-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.1);
          border-color: #0056b3;
        }
        .related-posts.dark .related-card:hover {
          border-color: #66b0ff;
          box-shadow: 0 12px 24px rgba(102,176,255,0.1);
        }

        .related-img {
          position: relative;
          width: 110px;
          height: 80px;
          flex-shrink: 0;
          overflow: hidden;
          border-radius: 14px;
          background: linear-gradient(135deg, #f0f0f0, #e0e0e0);
        }
        .related-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .related-card:hover .related-img img {
          transform: scale(1.1);
        }
        .img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,0,0,0), rgba(0,0,0,0.1));
          opacity: 0;
          transition: opacity 0.3s;
        }
        .related-card:hover .img-overlay {
          opacity: 1;
        }

        .related-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .related-cat-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .related-cat {
          font-size: 0.7rem;
          color: #0056b3;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.5px;
          background: rgba(0, 86, 179, 0.1);
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
        }
        .related-posts.dark .related-cat {
          color: #66b0ff;
          background: rgba(102, 176, 255, 0.15);
        }
        .trending-badge {
          font-size: 0.65rem;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
          padding: 0.2rem 0.5rem;
          border-radius: 20px;
        }
        h4 {
          font-size: 0.95rem;
          font-weight: 600;
          margin: 0;
          color: #1a1a2e;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color 0.2s;
        }
        .related-card:hover h4 {
          color: #0056b3;
        }
        .related-posts.dark h4 {
          color: #e9ecef;
        }
        .related-posts.dark .related-card:hover h4 {
          color: #66b0ff;
        }

        .related-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .meta-date, .meta-views, .meta-rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.65rem;
          color: #6c757d;
        }
        .meta-date svg, .meta-views svg {
          stroke: currentColor;
        }
        .rating-stars {
          color: #f59e0b;
          letter-spacing: 1px;
          font-size: 0.7rem;
        }

        .read-more {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          font-weight: 600;
          color: #0056b3;
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s ease;
        }
        .related-posts.dark .read-more {
          color: #66b0ff;
        }
        .related-card:hover .read-more {
          opacity: 1;
          transform: translateX(0);
        }
        .read-more svg {
          transition: transform 0.2s;
        }
        .read-more:hover svg {
          transform: translateX(4px);
        }

        @media (max-width: 768px) {
          .related-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .related-card {
            padding: 0.75rem;
          }
          .related-img {
            width: 90px;
            height: 70px;
          }
          h4 {
            font-size: 0.85rem;
          }
          .read-more {
            opacity: 1;
            transform: translateX(0);
            font-size: 0.65rem;
          }
        }
      `}</style>
    </div>
  )
}