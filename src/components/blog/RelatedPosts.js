import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function RelatedPosts({ currentPostId, currentCategory }) {
  const [relatedPosts, setRelatedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
          .limit(isMobile ? 2 : 4)

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
  }, [currentPostId, currentCategory, isMobile])

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
          <svg width={isMobile ? 12 : 16} height={isMobile ? 12 : 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </Link>
      </div>
      
      <div className="related-grid">
        {relatedPosts.map((post, index) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="related-card">
            {post.image_url && (
              <div className="related-img">
                <img src={post.image_url} alt={post.title} loading="lazy" />
              </div>
            )}
            <div className="related-content">
              <div className="related-cat-wrapper">
                <span className="related-cat">{post.category}</span>
                {post.ratingValue >= 4.5 && (
                  <span className="trending-badge">🔥</span>
                )}
              </div>
              <h4>{post.title}</h4>
              <div className="related-meta">
                <div className="meta-date">
                  <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>{post.formattedDate}</span>
                </div>
                <div className="meta-views">
                  <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                Read
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .related-posts {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e9ecef;
          position: relative;
        }
        @media (min-width: 768px) {
          .related-posts {
            margin-top: 4rem;
            padding-top: 3rem;
          }
        }
        .related-posts::before {
          content: '';
          position: absolute;
          top: -1px;
          left: 0;
          width: 40px;
          height: 2px;
          background: linear-gradient(90deg, #0056b3, #00a6ff);
          border-radius: 2px;
        }
        @media (min-width: 768px) {
          .related-posts::before {
            width: 60px;
            height: 3px;
          }
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
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        @media (min-width: 768px) {
          .related-header {
            margin-bottom: 2rem;
            gap: 1rem;
          }
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        @media (min-width: 768px) {
          .header-left {
            gap: 0.75rem;
          }
        }
        .header-icon {
          font-size: 1.2rem;
        }
        @media (min-width: 768px) {
          .header-icon {
            font-size: 1.5rem;
          }
        }
        h3 {
          font-size: 1rem;
          font-weight: 700;
          margin: 0;
          color: #1a1a2e;
        }
        @media (min-width: 768px) {
          h3 {
            font-size: 1.35rem;
          }
        }
        .related-posts.dark h3 {
          color: #ffffff;
        }
        .view-all {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.7rem;
          color: #0056b3;
          text-decoration: none;
          font-weight: 500;
          padding: 0.3rem 0.6rem;
          border-radius: 20px;
          background: rgba(0, 86, 179, 0.05);
        }
        @media (min-width: 768px) {
          .view-all {
            gap: 0.5rem;
            font-size: 0.85rem;
            padding: 0.5rem 1rem;
            border-radius: 40px;
          }
        }
        .view-all:active {
          transform: scale(0.95);
        }
        .related-posts.dark .view-all {
          color: #66b0ff;
          background: rgba(102, 176, 255, 0.1);
        }

        .related-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }
        @media (min-width: 768px) {
          .related-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }
        }
        
        .related-card {
          text-decoration: none;
          display: flex;
          gap: 0.75rem;
          transition: all 0.3s ease;
          padding: 0.75rem;
          border-radius: 16px;
          background: #ffffff;
          border: 1px solid #e9ecef;
        }
        @media (min-width: 768px) {
          .related-card {
            gap: 1.25rem;
            padding: 1rem;
            border-radius: 20px;
          }
        }
        .related-card:active {
          transform: scale(0.98);
        }
        .related-posts.dark .related-card {
          background: #1a2632;
          border-color: #2c3e50;
        }

        .related-img {
          width: 80px;
          height: 65px;
          flex-shrink: 0;
          overflow: hidden;
          border-radius: 12px;
          background: #f0f0f0;
        }
        @media (min-width: 768px) {
          .related-img {
            width: 110px;
            height: 80px;
            border-radius: 14px;
          }
        }
        .related-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .related-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        @media (min-width: 768px) {
          .related-content {
            gap: 0.5rem;
          }
        }
        .related-cat-wrapper {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          flex-wrap: wrap;
        }
        .related-cat {
          font-size: 0.6rem;
          color: #0056b3;
          text-transform: uppercase;
          font-weight: 700;
          background: rgba(0, 86, 179, 0.1);
          padding: 0.15rem 0.5rem;
          border-radius: 12px;
        }
        @media (min-width: 768px) {
          .related-cat {
            font-size: 0.7rem;
            padding: 0.2rem 0.6rem;
            border-radius: 20px;
          }
        }
        .related-posts.dark .related-cat {
          color: #66b0ff;
          background: rgba(102, 176, 255, 0.15);
        }
        .trending-badge {
          font-size: 0.6rem;
        }
        h4 {
          font-size: 0.8rem;
          font-weight: 600;
          margin: 0;
          color: #1a1a2e;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @media (min-width: 768px) {
          h4 {
            font-size: 0.95rem;
          }
        }
        .related-posts.dark h4 {
          color: #e9ecef;
        }

        .related-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .meta-date, .meta-views, .meta-rating {
          display: flex;
          align-items: center;
          gap: 0.2rem;
          font-size: 0.55rem;
          color: #6c757d;
        }
        @media (min-width: 768px) {
          .meta-date, .meta-views, .meta-rating {
            gap: 0.25rem;
            font-size: 0.65rem;
          }
        }
        .rating-stars {
          color: #f59e0b;
          letter-spacing: 1px;
          font-size: 0.6rem;
        }

        .read-more {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.6rem;
          font-weight: 600;
          color: #0056b3;
        }
        @media (min-width: 768px) {
          .read-more {
            gap: 0.5rem;
            font-size: 0.7rem;
          }
        }
        .related-posts.dark .read-more {
          color: #66b0ff;
        }
      `}</style>
    </div>
  )
}