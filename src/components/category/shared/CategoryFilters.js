// src/components/category/shared/CategoryFilters.js

import { useState, useEffect, useRef } from 'react'

export default function CategoryFilters({ onSearch, onSort, onFilter, color = '#6366f1', totalResults, categoryType = 'general' }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [activeFilters, setActiveFilters] = useState({
    category: 'all',
    dateRange: 'all',
    readTime: 'all'
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const filterRef = useRef(null)
  const sortRef = useRef(null)
  const searchRef = useRef(null)

  // Complete category configurations for all 7 types
  const categoryConfigs = {
    health: {
      title: 'Health & Wellness',
      icon: '🌿',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      categories: [
        'All', 'Fitness & Workouts', 'Diet & Weight Loss', 'Mental Health & Stress',
        'Sleep & Recovery', 'Diseases, Symptoms & Treatments', 'Nutrition & Healthy Eating',
        'Home Remedies', 'Supplements & Vitamins', 'Medical Awareness & Prevention',
        "Women's Health", "Men's Health", 'Fitness Gear & Equipment'
      ],
      categoryIcons: {
        'All': '🎯', 'Fitness & Workouts': '💪', 'Diet & Weight Loss': '🥗',
        'Mental Health & Stress': '🧠', 'Sleep & Recovery': '😴', 'Diseases, Symptoms & Treatments': '🩺',
        'Nutrition & Healthy Eating': '🍎', 'Home Remedies': '🌿', 'Supplements & Vitamins': '💊',
        'Medical Awareness & Prevention': '⚠️', "Women's Health": '👩', "Men's Health": '👨',
        'Fitness Gear & Equipment': '🏋️'
      }
    },
    wealth: {
      title: 'Wealth & Finance',
      icon: '💰',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      categories: [
        'All', 'Make Money Online', 'Side Hustles & Freelancing', 'Investing (Stocks, Crypto)',
        'Saving & Budgeting', 'Financial Freedom', 'Passive Income Ideas',
        'Business & Entrepreneurship', 'Shopping Guides & Product Deals', 'Affiliate & E-commerce Tips',
        'Remote Jobs & Careers', 'Digital Products & SaaS', 'Online Business Case Studies'
      ],
      categoryIcons: {
        'All': '🎯', 'Make Money Online': '💻', 'Side Hustles & Freelancing': '⚡',
        'Investing (Stocks, Crypto)': '📈', 'Saving & Budgeting': '💰', 'Financial Freedom': '🦅',
        'Passive Income Ideas': '💤', 'Business & Entrepreneurship': '🚀', 'Shopping Guides & Product Deals': '🛍️',
        'Affiliate & E-commerce Tips': '🔗', 'Remote Jobs & Careers': '🏠', 'Digital Products & SaaS': '📦',
        'Online Business Case Studies': '📚'
      }
    },
    tech: {
      title: 'Technology',
      icon: '⚡',
      gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      categories: [
        'All', 'AI & Tools', 'Software & Apps', 'Gadgets & Reviews', 'Smartphones & Laptops',
        'How-to Tutorials', 'Tech News & Updates', 'Comparisons (Best vs Best)',
        'Web Tools & Productivity Apps', 'Future Tech & Innovations', 'Programming & Development',
        'Cybersecurity & Privacy', 'Tech Troubleshooting'
      ],
      categoryIcons: {
        'All': '🎯', 'AI & Tools': '🤖', 'Software & Apps': '📱', 'Gadgets & Reviews': '📱',
        'Smartphones & Laptops': '💻', 'How-to Tutorials': '📖', 'Tech News & Updates': '📰',
        'Comparisons (Best vs Best)': '⚖️', 'Web Tools & Productivity Apps': '🛠️', 'Future Tech & Innovations': '🔮',
        'Programming & Development': '💻', 'Cybersecurity & Privacy': '🔒', 'Tech Troubleshooting': '🔧'
      }
    },
    growth: {
      title: 'Personal Growth',
      icon: '🌱',
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      categories: [
        'All', 'Study Methods', 'Online Courses', 'Skill Learning (Coding, Design, Languages)',
        'Productivity & Habits', 'Self-Improvement & Discipline', 'Time Management',
        'Focus & Deep Work', 'Career Skills Development', 'Motivation & Mindset',
        'Goal Setting & Planning', 'Learning Techniques (Memory, Speed Learning)', 'Personal Branding'
      ],
      categoryIcons: {
        'All': '🎯', 'Study Methods': '📚', 'Online Courses': '💻', 'Skill Learning (Coding, Design, Languages)': '🎨',
        'Productivity & Habits': '⚡', 'Self-Improvement & Discipline': '💪', 'Time Management': '⏰',
        'Focus & Deep Work': '🎯', 'Career Skills Development': '📈', 'Motivation & Mindset': '🧠',
        'Goal Setting & Planning': '📋', 'Learning Techniques (Memory, Speed Learning)': '🧩', 'Personal Branding': '✨'
      }
    },
    entertainment: {
      title: 'Entertainment',
      icon: '🎬',
      gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
      categories: [
        'All', 'Movies & Series', 'Gaming', 'Music', 'Celebrities', 'Internet Culture & Influencers',
        'Trending Topics & Viral Content', 'Reviews & Recommendations', 'Streaming Platforms Content',
        'Fun & Humorous Content', 'Behind-the-Scenes & Insights', 'Fan Theories & Discussions',
        'Upcoming Releases & Trailers'
      ],
      categoryIcons: {
        'All': '🎯', 'Movies & Series': '🎬', 'Gaming': '🎮', 'Music': '🎵', 'Celebrities': '⭐',
        'Internet Culture & Influencers': '📱', 'Trending Topics & Viral Content': '🔥', 'Reviews & Recommendations': '⭐',
        'Streaming Platforms Content': '📺', 'Fun & Humorous Content': '😂', 'Behind-the-Scenes & Insights': '🎬',
        'Fan Theories & Discussions': '💭', 'Upcoming Releases & Trailers': '🎥'
      }
    },
    world: {
      title: 'World News',
      icon: '🌍',
      gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      categories: [
        'All', 'Global News', 'Politics', 'Economy', 'Conflicts & Major Events', 'Business News',
        'Technology News', 'Environment & Climate', 'Society & Global Trends', 'Breaking News',
        'International Relations', 'Cultural Insights', 'Human Stories & Features'
      ],
      categoryIcons: {
        'All': '🎯', 'Global News': '🌐', 'Politics': '🏛️', 'Economy': '📊', 'Conflicts & Major Events': '⚠️',
        'Business News': '💼', 'Technology News': '🤖', 'Environment & Climate': '🌱', 'Society & Global Trends': '👥',
        'Breaking News': '🔴', 'International Relations': '🤝', 'Cultural Insights': '🎭', 'Human Stories & Features': '❤️'
      }
    },
    lifestyle: {
      title: 'Lifestyle',
      icon: '✨',
      gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
      categories: [
        'All', 'Travel & Destinations', 'Relationships & Dating', 'Personal Life Advice',
        'Social Media Tips', 'Daily Lifestyle Content', 'Fashion & Style', 'Food & Recipes',
        'Home & Living', 'Minimalism & Modern Living', 'Beauty & Skincare', 'Luxury Lifestyle',
        'Hobbies & Leisure Activities'
      ],
      categoryIcons: {
        'All': '🎯', 'Travel & Destinations': '✈️', 'Relationships & Dating': '💕', 'Personal Life Advice': '💬',
        'Social Media Tips': '📱', 'Daily Lifestyle Content': '📅', 'Fashion & Style': '👗', 'Food & Recipes': '🍳',
        'Home & Living': '🏠', 'Minimalism & Modern Living': '🎨', 'Beauty & Skincare': '💄', 'Luxury Lifestyle': '💎',
        'Hobbies & Leisure Activities': '🎯'
      }
    },
    general: {
      title: 'Categories',
      icon: '📚',
      gradient: `linear-gradient(135deg, ${color}, ${color}80)`,
      categories: ['All', 'Design', 'Development', 'Product', 'Marketing', 'Business', 'Technology', 'Health', 'Lifestyle', 'Education'],
      categoryIcons: {}
    }
  }

  const config = categoryConfigs[categoryType] || categoryConfigs.general
  const categories = config.categories
  const categoryIcons = config.categoryIcons
  
  const dateRanges = [
    { value: 'all', label: 'All Time', icon: '📅', description: 'Show all content' },
    { value: 'today', label: 'Today', icon: '☀️', description: 'Published today' },
    { value: 'week', label: 'This Week', icon: '📆', description: 'Last 7 days' },
    { value: 'month', label: 'This Month', icon: '📊', description: 'Last 30 days' },
    { value: 'year', label: 'This Year', icon: '📈', description: 'Last 12 months' }
  ]
  
  const readTimes = [
    { value: 'all', label: 'Any length', icon: '📖', description: 'All articles' },
    { value: 'short', label: 'Quick read', icon: '⚡', description: 'Under 5 minutes' },
    { value: 'medium', label: 'Medium', icon: '⏱️', description: '5-10 minutes' },
    { value: 'long', label: 'In-depth', icon: '🐢', description: 'Over 10 minutes' }
  ]

  const sortOptions = [
    { value: 'newest', label: 'Latest First', icon: '🆕', description: 'Most recent first' },
    { value: 'oldest', label: 'Oldest First', icon: '📅', description: 'Chronological order' },
    { value: 'popular', label: 'Most Popular', icon: '🔥', description: 'Highest views' },
    { value: 'trending', label: 'Trending', icon: '📈', description: 'Fastest growing' },
    { value: 'title', label: 'A to Z', icon: '🔤', description: 'Alphabetical order' },
    { value: 'readTime', label: 'Shortest First', icon: '⏱️', description: 'Quickest reads first' }
  ]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false)
      }
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (value) => {
    setSearchTerm(value)
    onSearch?.(value)
    
    if (value.length > 1) {
      const suggestions = categories
        .filter(cat => cat.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5)
      setSearchSuggestions(suggestions)
    } else {
      setSearchSuggestions([])
    }
  }

  const handleSort = (value) => {
    setSortBy(value)
    onSort?.(value)
    setIsSortOpen(false)
  }

  const handleFilterChange = (type, value) => {
    const newFilters = { ...activeFilters, [type]: value }
    setActiveFilters(newFilters)
    onFilter?.(newFilters)
    if (window.innerWidth < 768) {
      setIsFilterOpen(false)
    }
  }

  const clearAllFilters = () => {
    const resetFilters = { category: 'all', dateRange: 'all', readTime: 'all' }
    setActiveFilters(resetFilters)
    setSearchTerm('')
    setSortBy('newest')
    onSearch?.('')
    onSort?.('newest')
    onFilter?.(resetFilters)
  }

  const hasActiveFilters = () => {
    return searchTerm !== '' || sortBy !== 'newest' || Object.values(activeFilters).some(v => v !== 'all')
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (searchTerm) count++
    if (sortBy !== 'newest') count++
    count += Object.values(activeFilters).filter(v => v !== 'all').length
    return count
  }

  const getSortLabel = () => {
    const option = sortOptions.find(opt => opt.value === sortBy)
    return option ? option.label : 'Sort by'
  }

  const formatCategoryValue = (category) => {
    if (category === 'All') return 'all'
    return category.toLowerCase()
      .replace(/ & /g, '-')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const getCategoryDisplayName = (categoryValue) => {
    const category = categories.find(c => formatCategoryValue(c) === categoryValue)
    return category || categoryValue
  }

  return (
    <div className="filters-wrapper">
      <div className="filters-container">
        {/* Figma-Style Search Bar */}
        <div className={`search-box ${isSearchFocused ? 'focused' : ''}`}>
          <div className="search-icon-wrapper">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder={`Search ${config.title.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="search-input"
            ref={searchRef}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => handleSearch('')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
          
          {searchSuggestions.length > 0 && isSearchFocused && (
            <div className="search-suggestions">
              <div className="suggestions-header">
                <span>Suggested categories</span>
              </div>
              {searchSuggestions.map(suggestion => (
                <button
                  key={suggestion}
                  className="suggestion-item"
                  onClick={() => handleSearch(suggestion)}
                >
                  <span className="suggestion-icon">🔍</span>
                  <span className="suggestion-text">{suggestion}</span>
                  <span className="suggestion-arrow">→</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Figma-Style Filter Button */}
        <div className="filter-button-wrapper" ref={filterRef}>
          <button 
            className={`filter-trigger ${isFilterOpen ? 'active' : ''}`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16v2.172a2 2 0 0 1-.586 1.414L15 12v7l-6 2v-8.5L4.586 7.586A2 2 0 0 1 4 6.172V4z"/>
            </svg>
            <span>Filters</span>
            {getActiveFilterCount() > 0 && (
              <span className="filter-badge">{getActiveFilterCount()}</span>
            )}
          </button>

          {/* Figma-Style Filter Dropdown */}
          {isFilterOpen && (
            <div className="filter-dropdown">
              <div className="filter-dropdown-header" style={{ background: config.gradient }}>
                <div className="header-left">
                  <span className="header-icon">{config.icon}</span>
                  <h3>Filter {config.title}</h3>
                </div>
                <button onClick={() => setIsFilterOpen(false)} className="close-dropdown">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              
              <div className="filter-dropdown-content">
                {/* Categories Section - Figma Style Vertical List */}
                <div className="filter-section">
                  <div className="filter-section-header">
                    <span className="section-icon">📂</span>
                    <label className="filter-label">Categories</label>
                    <span className="section-count">{categories.length}</span>
                  </div>
                  <div className="categories-list">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        className={`category-list-item ${activeFilters.category === formatCategoryValue(cat) ? 'active' : ''}`}
                        onClick={() => handleFilterChange('category', formatCategoryValue(cat))}
                      >
                        <div className="category-left">
                          <span className="category-icon">{categoryIcons[cat] || '📄'}</span>
                          <span className="category-name">{cat}</span>
                        </div>
                        {activeFilters.category === formatCategoryValue(cat) && (
                          <span className="category-check">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Range Section - Figma Style Chips */}
                <div className="filter-section">
                  <div className="filter-section-header">
                    <span className="section-icon">📅</span>
                    <label className="filter-label">Date Range</label>
                  </div>
                  <div className="filter-chips">
                    {dateRanges.map(range => (
                      <button
                        key={range.value}
                        className={`filter-chip ${activeFilters.dateRange === range.value ? 'active' : ''}`}
                        onClick={() => handleFilterChange('dateRange', range.value)}
                        title={range.description}
                      >
                        <span className="chip-icon">{range.icon}</span>
                        <span className="chip-label">{range.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Read Time Section - Figma Style Chips */}
                <div className="filter-section">
                  <div className="filter-section-header">
                    <span className="section-icon">⏱️</span>
                    <label className="filter-label">Read Time</label>
                  </div>
                  <div className="filter-chips">
                    {readTimes.map(time => (
                      <button
                        key={time.value}
                        className={`filter-chip ${activeFilters.readTime === time.value ? 'active' : ''}`}
                        onClick={() => handleFilterChange('readTime', time.value)}
                        title={time.description}
                      >
                        <span className="chip-icon">{time.icon}</span>
                        <span className="chip-label">{time.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="filter-dropdown-footer">
                <button className="reset-filters-btn" onClick={clearAllFilters}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  Reset all filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Figma-Style Sort Dropdown */}
        <div className="sort-box" ref={sortRef}>
          <button 
            className={`sort-trigger ${isSortOpen ? 'active' : ''}`}
            onClick={() => setIsSortOpen(!isSortOpen)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M6 12h12M10 18h4"/>
            </svg>
            <span className="sort-label-text">{getSortLabel()}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`sort-arrow ${isSortOpen ? 'open' : ''}`}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {isSortOpen && (
            <div className="sort-dropdown">
              <div className="sort-dropdown-header">
                <h3>Sort by</h3>
                <span className="sort-description">Choose how to order results</span>
              </div>
              <div className="sort-options">
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    className={`sort-option ${sortBy === option.value ? 'active' : ''}`}
                    onClick={() => handleSort(option.value)}
                  >
                    <span className="sort-icon">{option.icon}</span>
                    <div className="sort-info">
                      <span className="sort-label">{option.label}</span>
                      <span className="sort-description">{option.description}</span>
                    </div>
                    {sortBy === option.value && (
                      <svg className="sort-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Clear All Button */}
        {hasActiveFilters() && (
          <button className="clear-all-btn" onClick={clearAllFilters}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
            <span>Clear all</span>
          </button>
        )}
      </div>

      {/* Active Filters Display - Figma Style */}
      {hasActiveFilters() && (
        <div className="active-filters">
          <div className="results-info">
            <span className="results-count">{totalResults || 0}</span>
            <span className="results-label">results</span>
          </div>
          <div className="filter-tags">
            {searchTerm && (
              <span className="filter-tag">
                <span className="tag-icon">🔍</span>
                <span className="tag-label">{searchTerm}</span>
                <button onClick={() => handleSearch('')}>×</button>
              </span>
            )}
            {activeFilters.category !== 'all' && (
              <span className="filter-tag">
                <span className="tag-icon">{categoryIcons[getCategoryDisplayName(activeFilters.category)] || '📄'}</span>
                <span className="tag-label">{getCategoryDisplayName(activeFilters.category)}</span>
                <button onClick={() => handleFilterChange('category', 'all')}>×</button>
              </span>
            )}
            {activeFilters.dateRange !== 'all' && (
              <span className="filter-tag">
                <span className="tag-icon">{dateRanges.find(d => d.value === activeFilters.dateRange)?.icon}</span>
                <span className="tag-label">{dateRanges.find(d => d.value === activeFilters.dateRange)?.label}</span>
                <button onClick={() => handleFilterChange('dateRange', 'all')}>×</button>
              </span>
            )}
            {activeFilters.readTime !== 'all' && (
              <span className="filter-tag">
                <span className="tag-icon">{readTimes.find(t => t.value === activeFilters.readTime)?.icon}</span>
                <span className="tag-label">{readTimes.find(t => t.value === activeFilters.readTime)?.label}</span>
                <button onClick={() => handleFilterChange('readTime', 'all')}>×</button>
              </span>
            )}
            {sortBy !== 'newest' && (
              <span className="filter-tag">
                <span className="tag-icon">📊</span>
                <span className="tag-label">{sortOptions.find(s => s.value === sortBy)?.label}</span>
                <button onClick={() => handleSort('newest')}>×</button>
              </span>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .filters-wrapper {
          width: 100%;
          background: rgba(255, 255, 255, 0.98);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(10px);
        }

        :global(html.dark) .filters-wrapper {
          background: rgba(18, 18, 18, 0.98);
          border-bottom-color: rgba(255, 255, 255, 0.05);
        }

        .filters-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0.875rem 2rem;
          display: flex;
          gap: 0.75rem;
          align-items: center;
          flex-wrap: wrap;
        }

        /* Figma-Style Search Box */
        .search-box {
          flex: 1;
          min-width: 260px;
          position: relative;
          transition: all 0.2s ease;
        }

        .search-icon-wrapper {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .search-icon {
          color: #9ca3af;
          transition: color 0.2s;
        }

        .search-input {
          width: 100%;
          height: 42px;
          padding: 0 36px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.875rem;
          background: white;
          transition: all 0.2s ease;
          color: #111827;
          font-weight: 450;
        }

        :global(html.dark) .search-input {
          background: #2a2a2a;
          border-color: #3a3a3a;
          color: #e5e7eb;
        }

        .search-input:focus {
          outline: none;
          border-color: ${color};
          box-shadow: 0 0 0 3px ${color}15;
        }

        .search-box.focused .search-icon {
          color: ${color};
        }

        .clear-search {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          transition: all 0.2s;
          z-index: 1;
        }

        .clear-search:hover {
          background: #f3f4f6;
          color: #374151;
        }

        /* Search Suggestions */
        .search-suggestions {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          background: white;
          border-radius: 14px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.02);
          border: 1px solid #e5e7eb;
          overflow: hidden;
          z-index: 1000;
          animation: fadeInDown 0.2s ease;
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        :global(html.dark) .search-suggestions {
          background: #2a2a2a;
          border-color: #3a3a3a;
        }

        .suggestions-header {
          padding: 0.625rem 1rem;
          background: #f9fafb;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6b7280;
          border-bottom: 1px solid #e5e7eb;
        }

        :global(html.dark) .suggestions-header {
          background: #1a1a1a;
          border-bottom-color: #3a3a3a;
          color: #9ca3af;
        }

        .suggestion-item {
          width: 100%;
          padding: 0.625rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
          color: #374151;
          transition: all 0.2s;
          text-align: left;
        }

        .suggestion-item:hover {
          background: #f9fafb;
        }

        :global(html.dark) .suggestion-item {
          color: #e5e7eb;
        }

        :global(html.dark) .suggestion-item:hover {
          background: #3a3a3a;
        }

        .suggestion-icon {
          font-size: 0.875rem;
          opacity: 0.6;
        }

        .suggestion-text {
          flex: 1;
        }

        .suggestion-arrow {
          opacity: 0;
          transform: translateX(-4px);
          transition: all 0.2s;
        }

        .suggestion-item:hover .suggestion-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        /* Figma-Style Filter Button */
        .filter-button-wrapper {
          position: relative;
        }

        .filter-trigger {
          height: 42px;
          padding: 0 1.125rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        :global(html.dark) .filter-trigger {
          background: #2a2a2a;
          border-color: #3a3a3a;
          color: #e5e7eb;
        }

        .filter-trigger:hover {
          background: #f9fafb;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .filter-trigger.active {
          border-color: ${color};
          color: ${color};
          background: ${color}08;
        }

        .filter-badge {
          background: ${color};
          color: white;
          font-size: 0.65rem;
          font-weight: 600;
          padding: 2px 7px;
          border-radius: 20px;
          margin-left: 4px;
        }

        /* Figma-Style Filter Dropdown */
        .filter-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 380px;
          max-width: calc(100vw - 2rem);
          background: white;
          border-radius: 18px;
          box-shadow: 0 20px 35px -10px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
          overflow: hidden;
          z-index: 1000;
          animation: fadeInDown 0.2s ease;
        }

        :global(html.dark) .filter-dropdown {
          background: #2a2a2a;
          box-shadow: 0 20px 35px -10px rgba(0,0,0,0.3);
        }

        .filter-dropdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          background: ${color}08;
          border-bottom: 1px solid ${color}15;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        .header-icon {
          font-size: 1.25rem;
        }

        .filter-dropdown-header h3 {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        :global(html.dark) .filter-dropdown-header h3 {
          color: #f9fafb;
        }

        .close-dropdown {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          transition: all 0.2s;
        }

        .close-dropdown:hover {
          background: rgba(0,0,0,0.05);
          transform: rotate(90deg);
        }

        .filter-dropdown-content {
          padding: 0.875rem;
          max-height: 60vh;
          overflow-y: auto;
        }

        .filter-section {
          margin-bottom: 1.125rem;
        }

        .filter-section:last-child {
          margin-bottom: 0;
        }

        .filter-section-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.625rem;
          padding: 0 0.25rem;
        }

        .section-icon {
          font-size: 0.875rem;
        }

        .filter-label {
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          color: #6b7280;
          flex: 1;
        }

        .section-count {
          font-size: 0.65rem;
          padding: 2px 7px;
          background: #f3f4f6;
          border-radius: 20px;
          color: #6b7280;
          font-weight: 500;
        }

        :global(html.dark) .section-count {
          background: #3a3a3a;
          color: #9ca3af;
        }

        /* Figma-Style Categories List */
        .categories-list {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
          max-height: 260px;
          overflow-y: auto;
          padding: 0.125rem;
        }

        .categories-list::-webkit-scrollbar {
          width: 4px;
        }

        .categories-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .categories-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }

        .category-list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 0.5rem 0.625rem;
          background: transparent;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }

        .category-list-item:hover {
          background: #f9fafb;
        }

        :global(html.dark) .category-list-item:hover {
          background: #3a3a3a;
        }

        .category-list-item.active {
          background: ${color}08;
        }

        .category-left {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        .category-icon {
          font-size: 1rem;
        }

        .category-name {
          font-size: 0.8125rem;
          font-weight: 450;
          color: #374151;
        }

        :global(html.dark) .category-name {
          color: #e5e7eb;
        }

        .category-list-item.active .category-name {
          color: ${color};
          font-weight: 500;
        }

        .category-check {
          color: ${color};
          font-weight: 600;
          font-size: 0.8125rem;
        }

        /* Figma-Style Filter Chips */
        .filter-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.4375rem 0.875rem;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 30px;
          font-size: 0.75rem;
          font-weight: 450;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        :global(html.dark) .filter-chip {
          background: #333;
          border-color: #4a4a4a;
          color: #e5e7eb;
        }

        .filter-chip:hover {
          background: #f3f4f6;
          transform: translateY(-1px);
        }

        .filter-chip.active {
          background: ${color};
          border-color: ${color};
          color: white;
        }

        .chip-icon {
          font-size: 0.75rem;
        }

        .chip-label {
          font-size: 0.75rem;
        }

        .filter-dropdown-footer {
          padding: 0.75rem 1rem;
          border-top: 1px solid #e5e7eb;
          background: #fafafa;
        }

        :global(html.dark) .filter-dropdown-footer {
          border-top-color: #3a3a3a;
          background: #222;
        }

        .reset-filters-btn {
          width: 100%;
          padding: 0.5625rem;
          background: transparent;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          font-size: 0.8125rem;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .reset-filters-btn:hover {
          background: #f3f4f6;
          border-color: ${color};
          color: ${color};
        }

        /* Figma-Style Sort Dropdown */
        .sort-box {
          position: relative;
          min-width: 150px;
        }

        .sort-trigger {
          height: 42px;
          padding: 0 1rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
          width: 100%;
        }

        :global(html.dark) .sort-trigger {
          background: #2a2a2a;
          border-color: #3a3a3a;
          color: #e5e7eb;
        }

        .sort-trigger:hover {
          background: #f9fafb;
          transform: translateY(-1px);
        }

        .sort-trigger.active {
          border-color: ${color};
          color: ${color};
          background: ${color}08;
        }

        .sort-label-text {
          flex: 1;
          text-align: left;
        }

        .sort-arrow {
          transition: transform 0.2s;
        }

        .sort-arrow.open {
          transform: rotate(180deg);
        }

        .sort-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 260px;
          background: white;
          border-radius: 14px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05);
          overflow: hidden;
          z-index: 1000;
          animation: fadeInDown 0.2s ease;
        }

        :global(html.dark) .sort-dropdown {
          background: #2a2a2a;
        }

        .sort-dropdown-header {
          padding: 0.875rem 1rem;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        :global(html.dark) .sort-dropdown-header {
          background: #1a1a1a;
          border-bottom-color: #3a3a3a;
        }

        .sort-dropdown-header h3 {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.125rem;
        }

        :global(html.dark) .sort-dropdown-header h3 {
          color: #f9fafb;
        }

        .sort-description {
          font-size: 0.6875rem;
          color: #6b7280;
        }

        .sort-options {
          padding: 0.375rem;
          max-height: 300px;
          overflow-y: auto;
        }

        .sort-option {
          width: 100%;
          padding: 0.625rem 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: none;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }

        .sort-option:hover {
          background: #f9fafb;
        }

        :global(html.dark) .sort-option:hover {
          background: #3a3a3a;
        }

        .sort-option.active {
          background: ${color}08;
        }

        .sort-icon {
          font-size: 1rem;
        }

        .sort-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .sort-label {
          font-size: 0.8125rem;
          font-weight: 500;
          color: #374151;
        }

        :global(html.dark) .sort-label {
          color: #e5e7eb;
        }

        .sort-option.active .sort-label {
          color: ${color};
        }

        .sort-description {
          font-size: 0.6875rem;
          color: #9ca3af;
        }

        .sort-check {
          color: ${color};
        }

        /* Clear All Button */
        .clear-all-btn {
          height: 42px;
          padding: 0 1rem;
          background: transparent;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.8125rem;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .clear-all-btn:hover {
          background: #fef2f2;
          border-color: #fca5a5;
          color: #dc2626;
        }

        /* Figma-Style Active Filters */
        .active-filters {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0.625rem 2rem 0.875rem 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          border-top: 1px solid #f0f0f0;
          background: #fafafa;
        }

        :global(html.dark) .active-filters {
          background: #141414;
          border-top-color: #2a2a2a;
        }

        .results-info {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
        }

        .results-count {
          font-size: 0.9375rem;
          font-weight: 700;
          color: #111827;
        }

        :global(html.dark) .results-count {
          color: #f9fafb;
        }

        .results-label {
          font-size: 0.8125rem;
          color: #6b7280;
        }

        .filter-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .filter-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.3125rem 0.75rem;
          background: white;
          border-radius: 30px;
          font-size: 0.75rem;
          font-weight: 450;
          color: #374151;
          border: 1px solid #e5e7eb;
          transition: all 0.2s;
        }

        :global(html.dark) .filter-tag {
          background: #2a2a2a;
          border-color: #3a3a3a;
          color: #e5e7eb;
        }

        .filter-tag:hover {
          border-color: ${color};
          transform: translateY(-1px);
        }

        .tag-icon {
          font-size: 0.75rem;
        }

        .tag-label {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .filter-tag button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          color: #6b7280;
          padding: 0;
          width: 18px;
          height: 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .filter-tag button:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .filters-container {
            padding: 0.75rem 1rem;
            gap: 0.5rem;
          }

          .search-box {
            min-width: 100%;
            order: 1;
          }

          .filter-button-wrapper {
            order: 2;
          }

          .sort-box {
            order: 3;
            flex: 1;
          }

          .clear-all-btn {
            order: 4;
          }

          .filter-dropdown {
            position: fixed;
            top: auto;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            border-radius: 20px 20px 0 0;
            max-height: 80vh;
            animation: slideUp 0.3s ease;
          }

          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }

          .active-filters {
            padding: 0.625rem 1rem 0.75rem 1rem;
          }

          .tag-label {
            max-width: 120px;
          }
        }

        @media (max-width: 480px) {
          .filter-trigger span:not(.filter-badge),
          .sort-label-text {
            display: none;
          }

          .filter-trigger, .sort-trigger {
            padding: 0 0.75rem;
          }

          .clear-all-btn span {
            display: none;
          }

          .clear-all-btn {
            padding: 0 0.75rem;
          }
        }
      `}</style>
    </div>
  )
}