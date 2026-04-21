// src/components/category/health/HealthCategory.js

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getCategoryPosts } from '@/utils/popularityTracker'
import CategoryFilters from '../shared/CategoryFilters'
import HealthHero from './HealthHero'
import HealthGrid from './HealthGrid'

export default function HealthCategory() {
  const [posts, setPosts] = useState([])
  const [filteredPosts, setFilteredPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [activeFilters, setActiveFilters] = useState({
    category: 'all',
    dateRange: 'all',
    readTime: 'all'
  })
  const [viewMode, setViewMode] = useState('grid')
  const [isFilterVisible, setIsFilterVisible] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const color = '#10b981' // Health green color

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark') || 
                     (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
      setIsDarkMode(isDark)
    }
    
    checkDarkMode()
    
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', checkDarkMode)
    
    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener('change', checkDarkMode)
    }
  }, [])

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts()
  }, [])

  // Apply filters and sorting whenever dependencies change
  useEffect(() => {
    filterAndSortPosts()
  }, [posts, searchTerm, sortBy, activeFilters])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCategoryPosts('health', 100)
      
      // Enhance posts with additional metadata
      const enhancedPosts = (data || []).map(post => ({
        ...post,
        readingTime: post.content ? Math.ceil(post.content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200) : 5,
        category: post.category || 'health',
        date: post.published_at || post.created_at || new Date().toISOString(),
        author: post.author || 'Health Expert',
        tags: post.tags || ['wellness', 'health']
      }))
      
      setPosts(enhancedPosts)
    } catch (err) {
      console.error('Error fetching health posts:', err)
      setError('Failed to load health content. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortPosts = useCallback(() => {
    let result = [...posts]

    // Apply search filter
    if (searchTerm) {
      result = result.filter(post =>
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Apply category filter
    if (activeFilters.category !== 'all') {
      result = result.filter(post => 
        post.category?.toLowerCase() === activeFilters.category.toLowerCase()
      )
    }

    // Apply date range filter
    if (activeFilters.dateRange !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      switch(activeFilters.dateRange) {
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          break
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1)
          break
        default:
          break
      }
      result = result.filter(post => new Date(post.date) >= filterDate)
    }

    // Apply read time filter
    if (activeFilters.readTime !== 'all') {
      result = result.filter(post => {
        switch(activeFilters.readTime) {
          case 'short': return post.readingTime < 5
          case 'medium': return post.readingTime >= 5 && post.readingTime <= 10
          case 'long': return post.readingTime > 10
          default: return true
        }
      })
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.date) - new Date(a.date))
        break
      case 'oldest':
        result.sort((a, b) => new Date(a.date) - new Date(b.date))
        break
      case 'popular':
        result.sort((a, b) => (b.views || 0) - (a.views || 0))
        break
      case 'trending':
        result.sort((a, b) => ((b.views || 0) / ((new Date() - new Date(b.date)) / 86400000)) - 
                             ((a.views || 0) / ((new Date() - new Date(a.date)) / 86400000)))
        break
      case 'title':
        result.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
        break
      case 'readTime':
        result.sort((a, b) => (a.readingTime || 0) - (b.readingTime || 0))
        break
      default: 
        break
    }

    setFilteredPosts(result)
  }, [posts, searchTerm, sortBy, activeFilters])

  // Retry handler
  const handleRetry = () => {
    fetchPosts()
  }

  // Toggle filter visibility
  const toggleFilters = () => {
    setIsFilterVisible(prev => !prev)
  }

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('')
    setSortBy('newest')
    setActiveFilters({
      category: 'all',
      dateRange: 'all',
      readTime: 'all'
    })
  }

  // Get filter statistics
  const filterStats = useMemo(() => {
    return {
      total: posts.length,
      filtered: filteredPosts.length,
      activeFilterCount: [
        searchTerm && 1,
        sortBy !== 'newest' && 1,
        ...Object.values(activeFilters).map(v => v !== 'all' && 1)
      ].filter(Boolean).length
    }
  }, [posts.length, filteredPosts.length, searchTerm, sortBy, activeFilters])

  if (loading) {
    return (
      <div className={`loading-container ${isDarkMode ? 'dark-mode' : ''}`}>
        <div className="loading-content">
          <div className="loading-spinner" style={{ borderTopColor: color }}></div>
          <p className="loading-text">Loading health insights...</p>
          <div className="loading-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
        <style jsx>{`
          .loading-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          }
          .loading-container.dark-mode {
            background: linear-gradient(135deg, #065f46 0%, #047857 100%);
          }
          .loading-content {
            text-align: center;
          }
          .loading-spinner {
            width: 64px;
            height: 64px;
            border: 3px solid rgba(255,255,255,0.2);
            border-top-color: ${color};
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 1.5rem;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .loading-text {
            color: white;
            font-size: 1.125rem;
            font-weight: 500;
            margin-bottom: 1rem;
          }
          .loading-dots {
            display: flex;
            gap: 0.5rem;
            justify-content: center;
          }
          .loading-dots span {
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
            animation: bounce 1.4s ease-in-out infinite;
          }
          .loading-dots span:nth-child(1) { animation-delay: 0s; }
          .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
          .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
          @keyframes bounce {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-10px); }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`error-container ${isDarkMode ? 'dark-mode' : ''}`}>
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={handleRetry} className="error-retry-btn">
            Try Again
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
        <style jsx>{`
          .error-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fef2f2;
          }
          .error-container.dark-mode {
            background: #1a1a1a;
          }
          .error-content {
            text-align: center;
            max-width: 400px;
            padding: 2rem;
          }
          .error-icon {
            font-size: 4rem;
            margin-bottom: 1.5rem;
          }
          .error-content h2 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: #dc2626;
          }
          .error-container.dark-mode .error-content h2 {
            color: #f87171;
          }
          .error-content p {
            color: #6b7280;
            margin-bottom: 2rem;
          }
          .error-container.dark-mode .error-content p {
            color: #9ca3af;
          }
          .error-retry-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .error-retry-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(16,185,129,0.4);
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className={`health-category ${isDarkMode ? 'dark-mode' : ''}`}>
      <HealthHero />
      
      {/* Filter Bar with Toggle */}
      <div className="filter-section">
        <div className="filter-header">
          <div className="filter-info">
            <h3>
              {filterStats.filtered} {filterStats.filtered === 1 ? 'Article' : 'Articles'}
            </h3>
            {filterStats.activeFilterCount > 0 && (
              <button onClick={clearAllFilters} className="clear-filters-btn">
                Clear all filters
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>
          
          <div className="filter-actions">
            <button 
              onClick={toggleFilters}
              className="filter-toggle-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16v2.172a2 2 0 0 1-.586 1.414L15 12v7l-6 2v-8.5L4.586 7.586A2 2 0 0 1 4 6.172V4z"/>
              </svg>
              {isFilterVisible ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                </svg>
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {isFilterVisible && (
          <div className="filters-wrapper">
            <CategoryFilters 
              onSearch={setSearchTerm}
              onSort={setSortBy}
              onFilter={setActiveFilters}
              color={color}
              categoryType="health"
              totalResults={filteredPosts.length}
            />
          </div>
        )}
      </div>
      
      {/* Results Grid/List */}
      <HealthGrid 
        posts={filteredPosts} 
        viewMode={viewMode}
        loading={loading}
      />

      <style jsx>{`
        .health-category {
          min-height: 100vh;
          background: #ffffff;
        }

        .health-category.dark-mode {
          background: #0a0a0a;
        }

        .filter-section {
          position: sticky;
          top: 0;
          background: #ffffff;
          z-index: 10;
          border-bottom: 1px solid #f0f0f0;
          transition: all 0.3s ease;
        }

        .health-category.dark-mode .filter-section {
          background: #0a0a0a;
          border-bottom-color: #1a1a1a;
        }

        .filter-header {
          max-width: 1280px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .filter-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .filter-info h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
        }

        .health-category.dark-mode .filter-info h3 {
          color: #f9fafb;
        }

        .clear-filters-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.875rem;
          background: #f3f4f6;
          border: none;
          border-radius: 20px;
          font-size: 0.75rem;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .health-category.dark-mode .clear-filters-btn {
          background: #1a1a1a;
          color: #9ca3af;
        }

        .clear-filters-btn:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        .health-category.dark-mode .clear-filters-btn:hover {
          background: #2a1a1a;
          color: #f87171;
        }

        .filter-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .filter-toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
        }

        .health-category.dark-mode .filter-toggle-btn {
          border-color: #374151;
          color: #e5e7eb;
        }

        .filter-toggle-btn:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .health-category.dark-mode .filter-toggle-btn:hover {
          background: #1a1a1a;
          border-color: #4a4a5a;
        }

        .view-toggle {
          display: flex;
          gap: 0.25rem;
          padding: 0.25rem;
          background: #f3f4f6;
          border-radius: 10px;
        }

        .health-category.dark-mode .view-toggle {
          background: #1a1a1a;
        }

        .view-btn {
          padding: 0.5rem;
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          color: #6b7280;
        }

        .health-category.dark-mode .view-btn {
          color: #9ca3af;
        }

        .view-btn:hover {
          background: #ffffff;
          color: #111827;
        }

        .health-category.dark-mode .view-btn:hover {
          background: #2a2a2a;
          color: #f9fafb;
        }

        .view-btn.active {
          background: #ffffff;
          color: #10b981;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .health-category.dark-mode .view-btn.active {
          background: #2a2a2a;
          color: #34d399;
        }

        .filters-wrapper {
          max-width: 1280px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .filter-header {
            padding: 1rem;
            flex-direction: column;
            align-items: stretch;
          }

          .filter-actions {
            justify-content: space-between;
          }

          .filter-toggle-btn,
          .view-toggle {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}