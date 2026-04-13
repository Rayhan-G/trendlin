import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { optimizeImage } from '@/lib/cloudinary'

export default function CategoryLayout({ categoryConfig }) {
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [filteredPosts, setFilteredPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024)
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  useEffect(() => {
    fetchCategoryPosts()
  }, [])

  useEffect(() => {
    filterAndSortPosts()
  }, [posts, searchTerm, sortBy])

  const fetchCategoryPosts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('category', categoryConfig.slug)
      .eq('published', true)
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setPosts(data)
      setFilteredPosts(data)
    }
    setLoading(false)
  }

  const filterAndSortPosts = () => {
    let result = [...posts]

    if (searchTerm) {
      result = result.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        break
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        break
      case 'popular':
        result.sort((a, b) => (b.views || 0) - (a.views || 0))
        break
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        break
    }

    setFilteredPosts(result)
  }

  // Responsive grid columns
  const getGridColumns = () => {
    if (isMobile) return 'repeat(2, 1fr)'
    if (isTablet) return 'repeat(3, 1fr)'
    return 'repeat(4, 1fr)'
  }

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
        <style jsx>{`
          .loading-container {
            min-height: 60vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e2e8f0;
            border-top-color: ${categoryConfig.color};
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="category-page">
        {/* Hero Section - Mobile Optimized */}
        <div className="hero-section" style={{ background: categoryConfig.bgLight }}>
          <div className="hero-content">
            <div className="hero-icon" style={{ color: categoryConfig.color }}>
              {categoryConfig.icon}
            </div>
            <h1 className="hero-title">{categoryConfig.name}</h1>
            <p className="hero-description">{categoryConfig.description}</p>
            <div className="hero-stats">
              <span className="stat-badge" style={{ color: categoryConfig.color }}>
                📝 {posts.length} {posts.length === 1 ? 'Article' : 'Articles'}
              </span>
            </div>
          </div>
        </div>

        {/* Filters Bar - Mobile First */}
        <div className="filters-section">
          <div className="filters-container">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>×</button>
              )}
            </div>

            <div className="sort-box">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
                style={{ borderColor: categoryConfig.color }}
              >
                <option value="newest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
                <option value="title">A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Info */}
        {searchTerm && (
          <div className="results-info">
            <span>🔍 Found <strong>{filteredPosts.length}</strong> results for "{searchTerm}"</span>
            <button onClick={() => setSearchTerm('')} className="clear-results">
              Clear
            </button>
          </div>
        )}

        {/* Posts Grid - Responsive Columns */}
        {filteredPosts.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>No posts found</h3>
            <p>{searchTerm ? `No articles matching "${searchTerm}"` : 'No articles in this category yet'}</p>
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="reset-btn">
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="posts-grid" style={{ gridTemplateColumns: getGridColumns() }}>
            {filteredPosts.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.id} className="post-card">
                <div className="post-card-image">
                  <img 
                    src={optimizeImage(post.image_url || post.featured_image)} 
                    alt={post.title}
                    loading="lazy"
                  />
                  <div className="post-category-badge" style={{ background: categoryConfig.color }}>
                    {categoryConfig.icon}
                  </div>
                </div>
                <div className="post-card-content">
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-excerpt">{post.excerpt?.substring(0, 80)}...</p>
                  <div className="post-meta">
                    <span className="post-date">
                      {new Date(post.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="post-views">👁️ {post.views || 0}</span>
                  </div>
                  <div className="post-read-more" style={{ color: categoryConfig.color }}>
                    Read more <span className="arrow">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .category-page {
          min-height: 100vh;
          background: #ffffff;
        }
        
        :global(body.dark) .category-page {
          background: #0a0a0a;
        }

        /* Hero Section - Mobile Optimized */
        .hero-section {
          padding: 3rem 1rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-icon {
          font-size: 3.5rem;
          margin-bottom: 1rem;
          animation: float 3s ease-in-out infinite;
          display: inline-block;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .hero-title {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 0.75rem;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        :global(body.dark) .hero-title {
          color: #f1f5f9;
        }

        .hero-description {
          font-size: 0.95rem;
          line-height: 1.5;
          color: #475569;
          margin-bottom: 1.5rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        :global(body.dark) .hero-description {
          color: #94a3b8;
        }

        .hero-stats {
          display: inline-block;
        }

        .stat-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1rem;
          background: white;
          border-radius: 40px;
          font-size: 0.8rem;
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        :global(body.dark) .stat-badge {
          background: #1e293b;
        }

        /* Filters Section - Mobile First */
        .filters-section {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 64px;
          z-index: 10;
        }

        :global(body.dark) .filters-section {
          background: #0f172a;
          border-bottom-color: #334155;
        }

        .filters-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0.75rem 1rem;
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 2;
          position: relative;
          min-width: 180px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.85rem;
          opacity: 0.6;
        }

        .search-input {
          width: 100%;
          padding: 0.6rem 2rem 0.6rem 2rem;
          padding-left: 2.25rem;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.85rem;
          background: white;
          transition: all 0.2s;
          -webkit-appearance: none;
        }

        :global(body.dark) .search-input {
          background: #1e293b;
          border-color: #334155;
          color: white;
        }

        .search-input:focus {
          outline: none;
          border-color: ${categoryConfig.color};
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
        }

        .clear-search {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.1rem;
          color: #94a3b8;
          padding: 4px;
        }

        .sort-box {
          min-width: 130px;
        }

        .sort-select {
          width: 100%;
          padding: 0.6rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.85rem;
          background: white;
          cursor: pointer;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          padding-right: 30px;
        }

        :global(body.dark) .sort-select {
          background: #1e293b;
          border-color: #334155;
          color: white;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
        }

        /* Results Info */
        .results-info {
          max-width: 1200px;
          margin: 0.75rem auto;
          padding: 0 1rem;
          font-size: 0.8rem;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .clear-results {
          background: none;
          border: none;
          color: ${categoryConfig.color};
          cursor: pointer;
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
        }

        /* Posts Grid - Responsive */
        .posts-grid {
          max-width: 1200px;
          margin: 1.5rem auto;
          padding: 0 1rem;
          display: grid;
          gap: 1rem;
        }

        /* Post Card - Mobile Optimized */
        .post-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          cursor: pointer;
        }

        .post-card:active {
          transform: scale(0.98);
        }

        :global(body.dark) .post-card {
          background: #1e293b;
        }

        .post-card-image {
          position: relative;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          background: #f1f5f9;
        }

        .post-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .post-card:active .post-card-image img {
          transform: scale(1.05);
        }

        .post-category-badge {
          position: absolute;
          bottom: 8px;
          left: 8px;
          padding: 3px 8px;
          border-radius: 16px;
          font-size: 0.65rem;
          font-weight: 600;
          color: white;
          backdrop-filter: blur(4px);
        }

        .post-card-content {
          padding: 0.75rem;
        }

        .post-title {
          font-size: 0.9rem;
          font-weight: 700;
          line-height: 1.4;
          margin-bottom: 0.4rem;
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
          font-size: 0.75rem;
          line-height: 1.45;
          color: #475569;
          margin-bottom: 0.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        :global(body.dark) .post-excerpt {
          color: #94a3b8;
        }

        .post-meta {
          display: flex;
          gap: 0.75rem;
          font-size: 0.65rem;
          color: #64748b;
          margin-bottom: 0.5rem;
        }

        .post-read-more {
          font-size: 0.7rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: gap 0.2s;
        }

        .arrow {
          transition: transform 0.2s;
        }

        .post-card:active .post-read-more {
          gap: 8px;
        }

        .post-card:active .arrow {
          transform: translateX(4px);
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 3rem 1.5rem;
          background: white;
          border-radius: 20px;
          margin: 2rem auto;
          max-width: 400px;
        }

        :global(body.dark) .empty-state {
          background: #1e293b;
        }

        .empty-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-state h3 {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: #64748b;
          font-size: 0.85rem;
        }

        .reset-btn {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: ${categoryConfig.color};
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.8rem;
        }

        /* Tablet Styles */
        @media (min-width: 768px) {
          .hero-section {
            padding: 4rem 2rem;
          }
          
          .hero-icon {
            font-size: 4rem;
          }
          
          .hero-title {
            font-size: 2.5rem;
          }
          
          .hero-description {
            font-size: 1rem;
          }
          
          .posts-grid {
            gap: 1.25rem;
            margin: 2rem auto;
          }
          
          .post-card-content {
            padding: 1rem;
          }
          
          .post-title {
            font-size: 1rem;
          }
          
          .post-excerpt {
            font-size: 0.8rem;
          }
        }

        /* Desktop Styles */
        @media (min-width: 1024px) {
          .posts-grid {
            gap: 1.5rem;
          }
          
          .post-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
          }
          
          .post-card:hover .post-card-image img {
            transform: scale(1.05);
          }
          
          .post-card:hover .post-read-more {
            gap: 8px;
          }
          
          .post-card:hover .arrow {
            transform: translateX(4px);
          }
          
          .post-card:active {
            transform: translateY(-2px);
          }
        }
      `}</style>
    </Layout>
  )
}