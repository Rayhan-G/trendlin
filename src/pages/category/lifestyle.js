import { useState, useEffect, useRef } from 'react'
import Layout from '@/components/Layout'
import PostCard from '@/components/PostCard'
import blogData from '@/data/blog-posts.json'

export default function LifestyleCategory() {
  const allPosts = blogData.posts || []
  const categoryPosts = allPosts.filter(post => 
    post.category?.toLowerCase() === 'lifestyle'
  )

  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [visibleCount, setVisibleCount] = useState(15)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const sortRef = useRef(null)

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  let filteredPosts = [...categoryPosts]

  // Search filter
  if (searchTerm) {
    filteredPosts = filteredPosts.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  // Date filter
  const now = new Date()
  if (dateFilter === 'week') {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    filteredPosts = filteredPosts.filter(post => new Date(post.date) >= weekAgo)
  } else if (dateFilter === 'month') {
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    filteredPosts = filteredPosts.filter(post => new Date(post.date) >= monthAgo)
  }

  // Sort
  if (sortBy === 'newest') {
    filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date))
  } else if (sortBy === 'oldest') {
    filteredPosts.sort((a, b) => new Date(a.date) - new Date(b.date))
  } else if (sortBy === 'popular') {
    filteredPosts.sort((a, b) => (b.views || 0) - (a.views || 0))
  }

  const visiblePosts = filteredPosts.slice(0, visibleCount)
  const hasMore = visibleCount < filteredPosts.length

  const loadMore = () => {
    setVisibleCount(prev => prev + 15)
  }

  const getSortLabel = () => {
    if (sortBy === 'newest') return 'Newest first'
    if (sortBy === 'oldest') return 'Oldest first'
    return 'Most popular'
  }

  const getSortIcon = () => {
    if (sortBy === 'popular') return '🔥'
    return '📅'
  }

  return (
    <Layout>
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-bg"></div>
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span>✨ Lifestyle</span>
            </div>
            <h1 className="hero-title">
              Live Your Best<br />
              <span className="hero-highlight">Life Everyday</span>
            </h1>
            <p className="hero-text">
              Travel, fashion, home, and everyday living — inspiration for a beautiful life.
            </p>
            <div className="hero-stats">
              <div className="stat">
                <strong>{categoryPosts.length}</strong>
                <span>Articles</span>
              </div>
              <div className="stat">
                <strong>✈️</strong>
                <span>Travel</span>
              </div>
              <div className="stat">
                <strong>🏠</strong>
                <span>Home</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="container">
          <div className="filter-row">
            {/* Search */}
            <div className="search-wrapper">
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21L16.65 16.65"/>
              </svg>
              <input 
                type="text" 
                placeholder="Search lifestyle articles..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button className="search-clear" onClick={() => setSearchTerm('')}>✕</button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="sort-dropdown" ref={sortRef}>
              <button 
                className="sort-trigger"
                onClick={() => setIsSortOpen(!isSortOpen)}
              >
                <span className="sort-icon">{getSortIcon()}</span>
                <span>{getSortLabel()}</span>
                <svg className={`sort-arrow ${isSortOpen ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              
              {isSortOpen && (
                <div className="sort-menu">
                  <button 
                    className={`sort-item ${sortBy === 'newest' ? 'active' : ''}`} 
                    onClick={() => {
                      setSortBy('newest')
                      setIsSortOpen(false)
                    }}
                  >
                    <span>📅</span> Newest first
                  </button>
                  <button 
                    className={`sort-item ${sortBy === 'oldest' ? 'active' : ''}`} 
                    onClick={() => {
                      setSortBy('oldest')
                      setIsSortOpen(false)
                    }}
                  >
                    <span>📅</span> Oldest first
                  </button>
                  <button 
                    className={`sort-item ${sortBy === 'popular' ? 'active' : ''}`} 
                    onClick={() => {
                      setSortBy('popular')
                      setIsSortOpen(false)
                    }}
                  >
                    <span>🔥</span> Most popular
                  </button>
                </div>
              )}
            </div>

            {/* Date Filter Tabs */}
            <div className="date-tabs">
              <button 
                className={`date-tab ${dateFilter === 'all' ? 'active' : ''}`}
                onClick={() => setDateFilter('all')}
              >
                All time
              </button>
              <button 
                className={`date-tab ${dateFilter === 'week' ? 'active' : ''}`}
                onClick={() => setDateFilter('week')}
              >
                This week
              </button>
              <button 
                className={`date-tab ${dateFilter === 'month' ? 'active' : ''}`}
                onClick={() => setDateFilter('month')}
              >
                This month
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || dateFilter !== 'all' || sortBy !== 'newest') && (
            <div className="active-filters">
              {searchTerm && (
                <span className="filter-chip">
                  🔍 {searchTerm}
                  <button onClick={() => setSearchTerm('')}>✕</button>
                </span>
              )}
              {dateFilter !== 'all' && (
                <span className="filter-chip">
                  📅 {dateFilter === 'week' ? 'This week' : 'This month'}
                  <button onClick={() => setDateFilter('all')}>✕</button>
                </span>
              )}
              {sortBy !== 'newest' && (
                <span className="filter-chip">
                  {sortBy === 'popular' ? '🔥 Most popular' : '📅 Oldest first'}
                  <button onClick={() => setSortBy('newest')}>✕</button>
                </span>
              )}
              <button className="clear-all" onClick={() => {
                setSearchTerm('')
                setDateFilter('all')
                setSortBy('newest')
                setVisibleCount(15)
              }}>
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="container">
        <div className="results-header">
          <span className="results-count">
            Showing {visiblePosts.length} of {filteredPosts.length} articles
          </span>
        </div>

        {visiblePosts.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">✨</div>
            <h3>No results found</h3>
            <p>Try adjusting your search or filter</p>
            <button className="empty-btn" onClick={() => {
              setSearchTerm('')
              setDateFilter('all')
              setSortBy('newest')
              setVisibleCount(15)
            }}>Clear all filters</button>
          </div>
        ) : (
          <>
            {/* RESPONSIVE GRID */}
            <div className="posts-grid">
              {visiblePosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* LOAD MORE BUTTON */}
            {hasMore && (
              <div className="load-more">
                <button onClick={loadMore} className="load-more-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                  Load more articles
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        /* Hero Section */
        .hero {
          position: relative;
          background: linear-gradient(135deg, #7c3aed 0%, #c084fc 100%);
          padding: 5rem 0 4rem;
          overflow: hidden;
        }
        
        .hero-bg {
          position: absolute;
          top: -50%;
          right: -20%;
          width: 60%;
          height: 150%;
          background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
          border-radius: 50%;
        }
        
        .hero-container { position: relative; z-index: 2; }
        .hero-content { text-align: center; color: white; }
        
        .hero-badge {
          display: inline-block;
          margin-bottom: 1.5rem;
        }
        
        .hero-badge span {
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(10px);
          padding: 0.4rem 1rem;
          border-radius: 40px;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 1px;
        }
        
        .hero-title {
          font-size: 3rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 1rem;
        }
        
        .hero-highlight {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        .hero-text {
          font-size: 1.1rem;
          opacity: 0.9;
          max-width: 500px;
          margin: 0 auto 2rem;
        }
        
        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 2rem;
        }
        
        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .stat strong { font-size: 1.5rem; font-weight: 700; }
        .stat span { font-size: 0.7rem; opacity: 0.7; text-transform: uppercase; letter-spacing: 1px; }
        
        /* Filter Bar */
        .filter-bar {
          background: white;
          border-bottom: 1px solid #eef2f6;
          padding: 1rem 0;
          margin-bottom: 1rem;
        }
        
        :global(body.dark) .filter-bar {
          background: #0f172a;
          border-bottom-color: #1e293b;
        }
        
        .filter-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        /* Search */
        .search-wrapper {
          position: relative;
          flex: 2;
          min-width: 220px;
        }
        
        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }
        
        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 50px;
          font-size: 0.9rem;
          background: white;
          transition: all 0.2s;
        }
        
        :global(body.dark) .search-input {
          background: #1e293b;
          border-color: #334155;
          color: white;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #c084fc;
          box-shadow: 0 0 0 3px rgba(192, 132, 252, 0.1);
        }
        
        .search-clear {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
        }
        
        /* Sort Dropdown */
        .sort-dropdown {
          position: relative;
          min-width: 160px;
        }
        
        .sort-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 0.75rem 1rem;
          background: white;
          border: 1.5px solid #e2e8f0;
          border-radius: 50px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        :global(body.dark) .sort-trigger {
          background: #1e293b;
          border-color: #334155;
          color: white;
        }
        
        .sort-trigger:hover {
          border-color: #c084fc;
        }
        
        .sort-icon { font-size: 0.9rem; }
        
        .sort-arrow {
          margin-left: auto;
          transition: transform 0.2s;
        }
        
        .sort-arrow.open {
          transform: rotate(180deg);
        }
        
        .sort-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
          overflow: hidden;
          z-index: 20;
        }
        
        :global(body.dark) .sort-menu {
          background: #1e293b;
          border-color: #334155;
        }
        
        .sort-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 0.7rem 1rem;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.85rem;
          text-align: left;
          transition: background 0.2s;
        }
        
        .sort-item:hover {
          background: #f1f5f9;
        }
        
        :global(body.dark) .sort-item:hover {
          background: #334155;
        }
        
        .sort-item.active {
          background: #faf5ff;
          color: #7c3aed;
        }
        
        :global(body.dark) .sort-item.active {
          background: #4c1d95;
          color: #c084fc;
        }
        
        /* Date Tabs */
        .date-tabs {
          display: flex;
          gap: 0.5rem;
          background: #f1f5f9;
          padding: 0.25rem;
          border-radius: 50px;
        }
        
        :global(body.dark) .date-tabs {
          background: #1e293b;
        }
        
        .date-tab {
          padding: 0.65rem 1.2rem;
          border: none;
          background: none;
          border-radius: 50px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s;
          color: #64748b;
        }
        
        :global(body.dark) .date-tab {
          color: #94a3b8;
        }
        
        .date-tab.active {
          background: white;
          color: #7c3aed;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        :global(body.dark) .date-tab.active {
          background: #0f172a;
          color: #c084fc;
        }
        
        /* Active Filters */
        .active-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #eef2f6;
        }
        
        :global(body.dark) .active-filters {
          border-top-color: #1e293b;
        }
        
        .filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.4rem 0.8rem;
          background: #f1f5f9;
          border-radius: 40px;
          font-size: 0.75rem;
          color: #475569;
        }
        
        :global(body.dark) .filter-chip {
          background: #1e293b;
          color: #cbd5e1;
        }
        
        .filter-chip button {
          background: none;
          border: none;
          cursor: pointer;
          color: inherit;
        }
        
        .clear-all {
          background: none;
          border: none;
          color: #7c3aed;
          cursor: pointer;
          font-size: 0.75rem;
          padding: 0.4rem 0.8rem;
        }
        
        /* Results */
        .results-header {
          margin: 1.5rem 0 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .results-count {
          font-size: 0.85rem;
          color: #64748b;
        }
        
        /* ============================================ */
        /* RESPONSIVE GRID */
        /* ============================================ */
        
        /* DESKTOP: 5 COLUMNS */
        .posts-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1.5rem;
          padding-bottom: 2rem;
        }
        
        /* TABLET: 3 COLUMNS */
        @media (max-width: 1024px) {
          .posts-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.25rem;
          }
        }
        
        /* MOBILE: 3 COLUMNS */
        @media (max-width: 768px) {
          .posts-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
          }
          
          .hero {
            padding: 3rem 0;
          }
          .hero-title {
            font-size: 2rem;
          }
          .hero-text {
            font-size: 0.9rem;
          }
          .filter-row {
            flex-direction: column;
            align-items: stretch;
          }
          .search-wrapper {
            width: 100%;
          }
          .sort-dropdown {
            width: 100%;
          }
          .date-tabs {
            justify-content: center;
            flex-wrap: wrap;
          }
        }
        
        /* SMALL MOBILE: 2 COLUMNS */
        @media (max-width: 550px) {
          .posts-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.875rem;
          }
        }
        
        /* EXTRA SMALL: 1 COLUMN */
        @media (max-width: 380px) {
          .posts-grid {
            grid-template-columns: 1fr;
          }
        }
        
        /* Load More */
        .load-more {
          text-align: center;
          padding: 2rem 0 4rem;
        }
        
        .load-more-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 0.85rem 2.2rem;
          background: white;
          border: 1.5px solid #e2e8f0;
          border-radius: 50px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          color: #7c3aed;
        }
        
        :global(body.dark) .load-more-btn {
          background: #1e293b;
          border-color: #334155;
          color: #c084fc;
        }
        
        .load-more-btn:hover {
          background: #7c3aed;
          border-color: #7c3aed;
          color: white;
          transform: translateY(-2px);
        }
        
        /* Empty State */
        .empty {
          text-align: center;
          padding: 4rem 2rem;
          background: #f8fafc;
          border-radius: 24px;
          margin: 2rem 0;
        }
        
        :global(body.dark) .empty {
          background: #1e293b;
        }
        
        .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
        .empty h3 { font-size: 1.2rem; margin-bottom: 0.5rem; color: #0f172a; }
        :global(body.dark) .empty h3 { color: #f1f5f9; }
        .empty p { color: #64748b; margin-bottom: 1.5rem; }
        .empty-btn { padding: 0.6rem 1.5rem; background: #7c3aed; color: white; border: none; border-radius: 40px; cursor: pointer; }
        
        @media (min-width: 1024px) {
          .hero-title {
            font-size: 4rem;
          }
        }
      `}</style>
    </Layout>
  )
}