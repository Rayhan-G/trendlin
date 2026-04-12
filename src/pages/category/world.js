import { useState, useEffect, useRef } from 'react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { optimizeImage } from '@/lib/cloudinary'

export default function WorldCategory() {
  const [posts, setPosts] = useState([])
  const [displayedPosts, setDisplayedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [totalPosts, setTotalPosts] = useState(0)
  const lastPostRef = useRef()
  const dropdownRef = useRef()

  const POSTS_PER_LOAD = 15

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    if (posts.length > 0) {
      filterAndDisplayPosts()
    }
  }, [posts, searchTerm, sortBy])

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('category', 'world')
      .eq('published', true)
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setPosts(data)
    }
    setLoading(false)
  }

  const getFilteredAndSortedPosts = () => {
    let filtered = [...posts]

    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        break
      case 'popular':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0))
        break
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        break
    }

    return filtered
  }

  const filterAndDisplayPosts = () => {
    const filtered = getFilteredAndSortedPosts()
    setTotalPosts(filtered.length)
    setDisplayedPosts(filtered.slice(0, POSTS_PER_LOAD))
    setHasMore(filtered.length > POSTS_PER_LOAD)
  }

  const loadMorePosts = () => {
    if (loadingMore) return
    
    setLoadingMore(true)
    
    setTimeout(() => {
      const currentLength = displayedPosts.length
      const filtered = getFilteredAndSortedPosts()
      const nextPosts = filtered.slice(currentLength, currentLength + POSTS_PER_LOAD)
      
      setDisplayedPosts(prev => [...prev, ...nextPosts])
      setHasMore(currentLength + POSTS_PER_LOAD < filtered.length)
      setLoadingMore(false)
    }, 500)
  }

  useEffect(() => {
    if (loadingMore || !hasMore) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMorePosts()
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    )
    
    if (lastPostRef.current) {
      observer.observe(lastPostRef.current)
    }
    
    return () => observer.disconnect()
  }, [displayedPosts, hasMore, loadingMore])

  const clearFilters = () => {
    setSearchTerm('')
    setSortBy('newest')
    setIsDropdownOpen(false)
  }

  const sortOptions = [
    { value: 'newest', label: 'Latest First', icon: '🕒' },
    { value: 'oldest', label: 'Oldest First', icon: '📅' },
    { value: 'popular', label: 'Most Viewed', icon: '👁️' },
    { value: 'title', label: 'A to Z', icon: '📝' }
  ]

  const getCurrentSortLabel = () => {
    const option = sortOptions.find(opt => opt.value === sortBy)
    return option ? option.label : 'Sort by'
  }

  if (loading) {
    return (
      <Layout>
        <div className="skeleton-container">
          <div className="skeleton-hero"></div>
          <div className="skeleton-grid">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="skeleton-card"></div>
            ))}
          </div>
        </div>
        <style jsx>{`
          .skeleton-container {
            min-height: 100vh;
            background: #fafafa;
          }
          :global(body.dark) .skeleton-container {
            background: #0f0f0f;
          }
          .skeleton-hero {
            height: 60vh;
            background: linear-gradient(135deg, #e0e0e0, #d0d0d0);
            animation: pulse 1.5s ease-in-out infinite;
          }
          .skeleton-grid {
            max-width: 1400px;
            margin: 0 auto;
            padding: 3rem 2rem;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: 2rem;
          }
          .skeleton-card {
            height: 320px;
            background: #e8e8e8;
            border-radius: 24px;
            animation: pulse 1.5s ease-in-out infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
          :global(body.dark) .skeleton-hero {
            background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
          }
          :global(body.dark) .skeleton-card {
            background: #1a1a1a;
          }
        `}</style>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="category-page">
        {/* Hero Section - World Theme (Cyan/Teal) */}
        <div className="hero">
          <div className="hero-bg">
            <div className="hero-bg-gradient"></div>
            <div className="hero-bg-pattern"></div>
          </div>
          <div className="hero-container">
            <div className="hero-content">
              <div className="hero-badge">
                <span className="hero-badge-dot"></span>
                <span>Global Affairs</span>
              </div>
              <h1 className="hero-title">
                World &<br />
                <span className="hero-title-accent">Global News</span>
              </h1>
              <p className="hero-description">
                Breaking news, international affairs, and global perspectives from around the world.
              </p>
              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="hero-stat-value">{totalPosts}</span>
                  <span className="hero-stat-label">Articles</span>
                </div>
                <div className="hero-stat-divider"></div>
                <div className="hero-stat">
                  <span className="hero-stat-value">{posts.reduce((sum, p) => sum + (p.views || 0), 0).toLocaleString()}</span>
                  <span className="hero-stat-label">Total Reads</span>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-wave">
            <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
              <path d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="white"/>
            </svg>
          </div>
        </div>

        {/* Filter Section */}
        <div className="filter-section">
          <div className="filter-container">
            <div className="search-wrapper">
              <div className="search-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="10" cy="10" r="7"/>
                  <line x1="21" y1="21" x2="15" y2="15"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search world news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button className="search-clear" onClick={() => setSearchTerm('')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>

            <div className="sort-wrapper" ref={dropdownRef}>
              <button 
                className={`sort-trigger ${isDropdownOpen ? 'open' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>Sort: <strong>{getCurrentSortLabel()}</strong></span>
                <svg className={`sort-arrow ${isDropdownOpen ? 'rotate' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              
              {isDropdownOpen && (
                <div className="sort-dropdown">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`sort-option ${sortBy === option.value ? 'active' : ''}`}
                      onClick={() => {
                        setSortBy(option.value)
                        setIsDropdownOpen(false)
                      }}
                    >
                      <span className="sort-option-icon">{option.icon}</span>
                      <span>{option.label}</span>
                      {sortBy === option.value && (
                        <svg className="sort-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {(searchTerm || sortBy !== 'newest') && (
              <button onClick={clearFilters} className="reset-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Reset
              </button>
            )}
          </div>

          <div className="results-info">
            <div className="results-left">
              <span className="results-number">{displayedPosts.length}</span>
              <span className="results-text">of {totalPosts} articles</span>
            </div>
            {searchTerm && (
              <div className="results-query">
                <span className="results-query-label">Searching for:</span>
                <span className="results-query-term">"{searchTerm}"</span>
              </div>
            )}
          </div>
        </div>

        {/* Articles Grid */}
        {displayedPosts.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
              </svg>
            </div>
            <h3 className="empty-title">No articles found</h3>
            <p className="empty-text">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="empty-btn">Clear all filters</button>
          </div>
        ) : (
          <>
            <div className="grid">
              {displayedPosts.map((post, index) => (
                <article 
                  key={post.id} 
                  className="card"
                  ref={index === displayedPosts.length - 1 ? lastPostRef : null}
                >
                  <Link href={`/blog/${post.slug}`} className="card-link">
                    <div className="card-media">
                      <img 
                        src={optimizeImage(post.image_url || post.featured_image)} 
                        alt={post.title}
                        loading="lazy"
                      />
                      <div className="card-overlay"></div>
                      <div className="card-category">
                        <span>World</span>
                      </div>
                    </div>
                    <div className="card-content">
                      <h3 className="card-title">{post.title}</h3>
                      <p className="card-excerpt">{post.excerpt?.substring(0, 100)}...</p>
                      <div className="card-footer">
                        <div className="card-meta">
                          <span className="card-date">
                            {new Date(post.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="card-views">{post.views || 0} reads</span>
                        </div>
                        <span className="card-arrow">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12"/>
                            <polyline points="12 5 19 12 12 19"/>
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            {loadingMore && (
              <div className="loading-more">
                <div className="loading-spinner"></div>
                <span>Loading more articles...</span>
              </div>
            )}

            {!hasMore && displayedPosts.length > 0 && (
              <div className="end-content">
                <div className="end-line"></div>
                <span>You've reached the end</span>
                <div className="end-line"></div>
              </div>
            )}
          </>
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
        
        /* Hero Section - World Theme (Cyan/Teal) */
        .hero {
          position: relative;
          min-height: 70vh;
          display: flex;
          align-items: center;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
          overflow: hidden;
        }
        
        .hero-bg {
          position: absolute;
          inset: 0;
        }
        
        .hero-bg-gradient {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 30%, rgba(6, 182, 212, 0.15), transparent 50%);
        }
        
        .hero-bg-pattern {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          opacity: 0.5;
        }
        
        .hero-container {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 4rem 2rem;
        }
        
        .hero-content {
          max-width: 700px;
        }
        
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1rem;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          border-radius: 100px;
          font-size: 0.8rem;
          color: #67e8f9;
          margin-bottom: 1.5rem;
        }
        
        .hero-badge-dot {
          width: 6px;
          height: 6px;
          background: #06b6d4;
          border-radius: 50%;
        }
        
        .hero-title {
          font-size: 4rem;
          font-weight: 800;
          line-height: 1.2;
          color: white;
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
        }
        
        .hero-title-accent {
          background: linear-gradient(135deg, #06b6d4, #22d3ee);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        .hero-description {
          font-size: 1.125rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.7);
          max-width: 500px;
          margin-bottom: 2rem;
        }
        
        .hero-stats {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        
        .hero-stat {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }
        
        .hero-stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: white;
        }
        
        .hero-stat-label {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.5);
        }
        
        .hero-stat-divider {
          width: 1px;
          height: 30px;
          background: rgba(255, 255, 255, 0.2);
        }
        
        .hero-wave {
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
        }
        
        .hero-wave svg {
          width: 100%;
          height: auto;
          fill: #ffffff;
        }
        
        :global(body.dark) .hero-wave svg {
          fill: #0a0a0a;
        }
        
        /* Filter Section */
        .filter-section {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .filter-container {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .search-wrapper {
          flex: 2;
          position: relative;
          min-width: 260px;
        }
        
        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
        }
        
        .search-icon svg {
          width: 18px;
          height: 18px;
          color: #94a3b8;
        }
        
        .search-input {
          width: 100%;
          padding: 0.9rem 1rem 0.9rem 2.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
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
          border-color: #06b6d4;
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
        }
        
        .search-clear {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
        }
        
        .search-clear svg {
          width: 16px;
          height: 16px;
          color: #94a3b8;
        }
        
        .sort-wrapper {
          position: relative;
          min-width: 180px;
        }
        
        .sort-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          width: 100%;
          padding: 0.9rem 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        :global(body.dark) .sort-trigger {
          background: #1e293b;
          border-color: #334155;
          color: white;
        }
        
        .sort-trigger:hover {
          border-color: #06b6d4;
        }
        
        .sort-trigger.open {
          border-color: #06b6d4;
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
        }
        
        .sort-arrow {
          width: 14px;
          height: 14px;
          transition: transform 0.2s;
        }
        
        .sort-arrow.rotate {
          transform: rotate(180deg);
        }
        
        .sort-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          z-index: 100;
          animation: fadeIn 0.2s ease;
        }
        
        :global(body.dark) .sort-dropdown {
          background: #1e293b;
          border-color: #334155;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .sort-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.8rem 1rem;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          font-size: 0.85rem;
          transition: background 0.2s;
        }
        
        .sort-option:hover {
          background: #f1f5f9;
        }
        
        :global(body.dark) .sort-option:hover {
          background: #334155;
        }
        
        .sort-option.active {
          color: #06b6d4;
        }
        
        .sort-option-icon {
          width: 20px;
        }
        
        .sort-check {
          margin-left: auto;
          width: 16px;
          height: 16px;
        }
        
        .reset-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.9rem 1.25rem;
          background: #f1f5f9;
          border: none;
          border-radius: 16px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .reset-btn svg {
          width: 14px;
          height: 14px;
        }
        
        .reset-btn:hover {
          background: #e2e8f0;
        }
        
        :global(body.dark) .reset-btn {
          background: #1e293b;
          color: white;
        }
        
        /* Results Info */
        .results-info {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }
        
        :global(body.dark) .results-info {
          border-top-color: #1e293b;
        }
        
        .results-left {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }
        
        .results-number {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
        }
        
        :global(body.dark) .results-number {
          color: #f1f5f9;
        }
        
        .results-text {
          font-size: 0.85rem;
          color: #64748b;
        }
        
        .results-query {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
        }
        
        .results-query-label {
          color: #64748b;
        }
        
        .results-query-term {
          color: #06b6d4;
          font-weight: 500;
        }
        
        /* Grid - Responsive: Mobile 3, Tablet 4, Desktop 5 */
        .grid {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          display: grid;
          gap: 1.5rem;
        }
        
        @media (max-width: 767px) {
          .grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.75rem;
            padding: 1rem;
          }
        }
        
        @media (min-width: 768px) and (max-width: 1023px) {
          .grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
          }
        }
        
        @media (min-width: 1024px) {
          .grid {
            grid-template-columns: repeat(5, 1fr);
            gap: 1.5rem;
          }
        }
        
        /* Card */
        .card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }
        
        .card:hover {
          transform: translateY(-8px);
          box-shadow: 0 30px 40px -15px rgba(0, 0, 0, 0.15);
        }
        
        :global(body.dark) .card {
          background: #1e293b;
        }
        
        .card-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }
        
        .card-media {
          position: relative;
          aspect-ratio: 4 / 3;
          overflow: hidden;
        }
        
        .card-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }
        
        .card:hover .card-media img {
          transform: scale(1.05);
        }
        
        .card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        .card:hover .card-overlay {
          opacity: 1;
        }
        
        .card-category {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
        }
        
        .card-category span {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: rgba(6, 182, 212, 0.9);
          backdrop-filter: blur(4px);
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
          color: white;
        }
        
        .card-content {
          padding: 1rem;
        }
        
        .card-title {
          font-size: 0.9rem;
          font-weight: 700;
          line-height: 1.4;
          margin-bottom: 0.5rem;
          color: #0f172a;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        :global(body.dark) .card-title {
          color: #f1f5f9;
        }
        
        .card-excerpt {
          font-size: 0.75rem;
          line-height: 1.5;
          color: #64748b;
          margin-bottom: 0.75rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .card-meta {
          display: flex;
          gap: 0.5rem;
          font-size: 0.65rem;
          color: #94a3b8;
        }
        
        .card-arrow svg {
          width: 16px;
          height: 16px;
          color: #06b6d4;
          transition: transform 0.2s;
        }
        
        .card:hover .card-arrow svg {
          transform: translateX(4px);
        }
        
        /* Loading More */
        .loading-more {
          text-align: center;
          padding: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          color: #64748b;
        }
        
        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #e2e8f0;
          border-top-color: #06b6d4;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* End Content */
        .end-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 2rem;
          color: #64748b;
          font-size: 0.85rem;
        }
        
        .end-line {
          width: 60px;
          height: 1px;
          background: #e2e8f0;
        }
        
        :global(body.dark) .end-line {
          background: #334155;
        }
        
        /* Empty State */
        .empty {
          text-align: center;
          padding: 4rem 2rem;
          max-width: 500px;
          margin: 2rem auto;
        }
        
        .empty-icon {
          margin-bottom: 1.5rem;
        }
        
        .empty-icon svg {
          width: 64px;
          height: 64px;
          color: #cbd5e1;
        }
        
        .empty-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #0f172a;
        }
        
        :global(body.dark) .empty-title {
          color: #f1f5f9;
        }
        
        .empty-text {
          color: #64748b;
          margin-bottom: 1.5rem;
        }
        
        .empty-btn {
          padding: 0.6rem 1.25rem;
          background: #06b6d4;
          color: white;
          border: none;
          border-radius: 40px;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        
        .empty-btn:hover {
          background: #0891b2;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .hero-container {
            padding: 3rem 1.5rem;
          }
          
          .hero-title {
            font-size: 2.5rem;
          }
          
          .hero-description {
            font-size: 1rem;
          }
          
          .hero-stats {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }
          
          .hero-stat-divider {
            display: none;
          }
          
          .filter-section {
            padding: 1.5rem;
          }
          
          .filter-container {
            flex-direction: column;
          }
          
          .search-wrapper, .sort-wrapper {
            width: 100%;
          }
          
          .results-info {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </Layout>
  )
}