// src/pages/bookmarks/index.jsx

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import debounce from 'lodash/debounce'
import toast from 'react-hot-toast'

// Icons
import { 
  Search, 
  Filter, 
  Grid3x3, 
  List,
  FolderTree,
  Tag,
  Star,
  Calendar,
  Trash2,
  Share2,
  MoreVertical,
  ChevronDown,
  X,
  Loader2,
  BookOpen,
  TrendingUp,
  Clock
} from 'lucide-react'

export default function BookmarksPage() {
  // State
  const [user, setUser] = useState(null)
  const [bookmarks, setBookmarks] = useState([])
  const [filteredBookmarks, setFilteredBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid') // grid, list
  const [sortBy, setSortBy] = useState('date') // date, title, importance
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTag, setSelectedTag] = useState(null)
  const [importanceFilter, setImportanceFilter] = useState(null)
  const [readStatusFilter, setReadStatusFilter] = useState(null)
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [selectedBookmarks, setSelectedBookmarks] = useState(new Set())
  const [batchMode, setBatchMode] = useState(false)
  const [stats, setStats] = useState({})

  // Fetch user and bookmarks
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        
        if (!data.authenticated) {
          setLoading(false)
          return
        }
        
        setUser(data.user)
        
        // Fetch bookmarks with joins
        const { data: bookmarksData, error } = await supabase
          .from('bookmarks')
          .select(`
            *,
            category:bookmark_categories(name, icon, color),
            tags:bookmark_tag_relations(tag:bookmark_tags(name))
          `)
          .eq('user_id', data.user.id)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        setBookmarks(bookmarksData || [])
        setFilteredBookmarks(bookmarksData || [])
        
        // Fetch categories
        const { data: categoriesData } = await supabase
          .from('bookmark_categories')
          .select('*')
          .eq('user_id', data.user.id)
          .order('position', { ascending: true })
        
        setCategories(categoriesData || [])
        
        // Extract tags
        const allTags = new Set()
        bookmarksData?.forEach(bookmark => {
          bookmark.tags?.forEach(t => allTags.add(t.tag.name))
        })
        setTags(Array.from(allTags))
        
        // Fetch stats
        const { data: statsData } = await supabase
          .from('bookmark_analytics')
          .select('event_type, count')
          .eq('user_id', data.user.id)
          .groupBy('event_type')
        
        setStats({
          total: bookmarksData?.length || 0,
          read: bookmarksData?.filter(b => b.read_status).length || 0,
          unread: bookmarksData?.filter(b => !b.read_status).length || 0,
          highImportance: bookmarksData?.filter(b => b.importance_level >= 4).length || 0
        })
        
      } catch (error) {
        console.error('Error:', error)
        toast.error('Failed to load bookmarks')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Filter and search
  useEffect(() => {
    let filtered = [...bookmarks]
    
    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(b => 
        b.post_title.toLowerCase().includes(term) ||
        b.notes?.toLowerCase().includes(term)
      )
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(b => b.category_id === selectedCategory)
    }
    
    // Tag filter
    if (selectedTag) {
      filtered = filtered.filter(b => 
        b.tags?.some(t => t.tag.name === selectedTag)
      )
    }
    
    // Importance filter
    if (importanceFilter) {
      filtered = filtered.filter(b => b.importance_level === importanceFilter)
    }
    
    // Read status filter
    if (readStatusFilter !== null) {
      filtered = filtered.filter(b => b.read_status === readStatusFilter)
    }
    
    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.created_at) - new Date(a.created_at)
      if (sortBy === 'title') return a.post_title.localeCompare(b.post_title)
      if (sortBy === 'importance') return b.importance_level - a.importance_level
      return 0
    })
    
    setFilteredBookmarks(filtered)
  }, [bookmarks, searchTerm, selectedCategory, selectedTag, importanceFilter, readStatusFilter, sortBy])

  const debouncedSearch = useCallback(
    debounce((value) => setSearchTerm(value), 300),
    []
  )

  const handleMarkAsRead = async (bookmarkId) => {
    const { error } = await supabase
      .from('bookmarks')
      .update({ read_status: true, read_at: new Date().toISOString() })
      .eq('id', bookmarkId)
    
    if (!error) {
      setBookmarks(prev => prev.map(b => 
        b.id === bookmarkId ? { ...b, read_status: true, read_at: new Date() } : b
      ))
      toast.success('Marked as read')
    }
  }

  const handleDeleteBookmark = async (bookmarkId) => {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', bookmarkId)
    
    if (!error) {
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId))
      toast.success('Bookmark removed')
    }
  }

  const handleBatchDelete = async () => {
    const ids = Array.from(selectedBookmarks)
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .in('id', ids)
    
    if (!error) {
      setBookmarks(prev => prev.filter(b => !selectedBookmarks.has(b.id)))
      setSelectedBookmarks(new Set())
      setBatchMode(false)
      toast.success(`${ids.length} bookmarks removed`)
    }
  }

  const handleShareCollection = async () => {
    // Generate shareable link for selected bookmarks
    const shareId = crypto.randomUUID()
    await supabase.from('shared_collections').insert({
      id: shareId,
      user_id: user.id,
      bookmark_ids: Array.from(selectedBookmarks),
      created_at: new Date().toISOString()
    })
    
    const shareUrl = `${window.location.origin}/share/${shareId}`
    await navigator.clipboard.writeText(shareUrl)
    toast.success('Shareable link copied!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-7xl mb-4">🔖</div>
        <h1 className="text-3xl font-bold mb-3">Your Bookmark Library</h1>
        <p className="text-gray-500 mb-8">Sign in to access your saved articles, organized with powerful tools</p>
        <Link href="/login" className="inline-flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition">
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="bookmarks-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Bookmarks</h1>
          <p className="page-subtitle">Organize and discover your saved content</p>
        </div>
        
        {batchMode && (
          <div className="batch-actions">
            <span className="batch-count">{selectedBookmarks.size} selected</span>
            <button onClick={handleShareCollection} className="batch-btn share">
              <Share2 size={16} /> Share
            </button>
            <button onClick={handleBatchDelete} className="batch-btn delete">
              <Trash2 size={16} /> Delete
            </button>
            <button onClick={() => { setBatchMode(false); setSelectedBookmarks(new Set()) }} className="batch-btn cancel">
              <X size={16} /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <BookOpen className="stat-icon" />
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Bookmarks</div>
        </div>
        <div className="stat-card">
          <Clock className="stat-icon" />
          <div className="stat-value">{stats.unread}</div>
          <div className="stat-label">Unread</div>
        </div>
        <div className="stat-card">
          <Star className="stat-icon" />
          <div className="stat-value">{stats.highImportance}</div>
          <div className="stat-label">High Priority</div>
        </div>
        <div className="stat-card">
          <TrendingUp className="stat-icon" />
          <div className="stat-value">{(stats.total > 0 ? (stats.read / stats.total * 100).toFixed(0) : 0)}%</div>
          <div className="stat-label">Read Rate</div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="controls-bar">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by title or notes..."
            onChange={(e) => debouncedSearch(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="controls-group">
          <button onClick={() => setShowFilters(!showFilters)} className="control-btn">
            <Filter size={16} />
            Filters
            <ChevronDown size={14} />
          </button>
          
          <div className="view-toggle">
            <button onClick={() => setViewMode('grid')} className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}>
              <Grid3x3 size={16} />
            </button>
            <button onClick={() => setViewMode('list')} className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}>
              <List size={16} />
            </button>
          </div>
          
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
            <option value="date">Newest First</option>
            <option value="title">Title A-Z</option>
            <option value="importance">Importance</option>
          </select>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="filters-panel"
          >
            <div className="filter-group">
              <label>Category</label>
              <div className="filter-options">
                <button onClick={() => setSelectedCategory('all')} className={`filter-chip ${selectedCategory === 'all' ? 'active' : ''}`}>
                  All
                </button>
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`filter-chip ${selectedCategory === cat.id ? 'active' : ''}`}>
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="filter-group">
              <label>Importance</label>
              <div className="filter-options">
                {[1, 2, 3, 4, 5].map(level => (
                  <button key={level} onClick={() => setImportanceFilter(importanceFilter === level ? null : level)} className={`importance-chip ${importanceFilter === level ? 'active' : ''}`}>
                    {'⭐'.repeat(level)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="filter-group">
              <label>Status</label>
              <div className="filter-options">
                <button onClick={() => setReadStatusFilter(null)} className={`filter-chip ${readStatusFilter === null ? 'active' : ''}`}>
                  All
                </button>
                <button onClick={() => setReadStatusFilter(false)} className={`filter-chip ${readStatusFilter === false ? 'active' : ''}`}>
                  Unread
                </button>
                <button onClick={() => setReadStatusFilter(true)} className={`filter-chip ${readStatusFilter === true ? 'active' : ''}`}>
                  Read
                </button>
              </div>
            </div>
            
            {tags.length > 0 && (
              <div className="filter-group">
                <label>Popular Tags</label>
                <div className="filter-options">
                  {tags.slice(0, 10).map(tag => (
                    <button key={tag} onClick={() => setSelectedTag(selectedTag === tag ? null : tag)} className={`filter-chip ${selectedTag === tag ? 'active' : ''}`}>
                      <Tag size={12} /> {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bookmarks Grid/List */}
      <div className={`bookmarks-container ${viewMode}`}>
        {filteredBookmarks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No bookmarks found</h3>
            <p>Start saving content you love, or try adjusting your filters</p>
          </div>
        ) : (
          filteredBookmarks.map((bookmark) => (
            <motion.div
              key={bookmark.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bookmark-card ${viewMode === 'list' ? 'list-view' : ''} ${!bookmark.read_status ? 'unread' : ''}`}
            >
              {batchMode && (
                <input
                  type="checkbox"
                  checked={selectedBookmarks.has(bookmark.id)}
                  onChange={(e) => {
                    const newSet = new Set(selectedBookmarks)
                    if (e.target.checked) newSet.add(bookmark.id)
                    else newSet.delete(bookmark.id)
                    setSelectedBookmarks(newSet)
                  }}
                  className="bookmark-checkbox"
                />
              )}
              
              <div className="bookmark-content">
                <div className="bookmark-header">
                  <div className="bookmark-category">
                    {bookmark.category?.icon} {bookmark.category?.name || 'Uncategorized'}
                  </div>
                  <div className="importance-stars">
                    {'⭐'.repeat(bookmark.importance_level || 1)}
                  </div>
                </div>
                
                <h3 className="bookmark-title">
                  <Link href={`/blog/${bookmark.post_slug}`}>
                    {bookmark.post_title}
                  </Link>
                </h3>
                
                {bookmark.post_excerpt && (
                  <p className="bookmark-excerpt">{bookmark.post_excerpt}</p>
                )}
                
                {bookmark.notes && (
                  <div className="bookmark-notes">📝 {bookmark.notes}</div>
                )}
                
                <div className="bookmark-meta">
                  <span className="meta-date">
                    <Calendar size={12} />
                    {new Date(bookmark.created_at).toLocaleDateString()}
                  </span>
                  {bookmark.tags && bookmark.tags.length > 0 && (
                    <div className="meta-tags">
                      {bookmark.tags.slice(0, 3).map(t => (
                        <span key={t.tag.name} className="tag">{t.tag.name}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bookmark-actions">
                {!bookmark.read_status && (
                  <button onClick={() => handleMarkAsRead(bookmark.id)} className="action-icon mark-read" title="Mark as read">
                    <BookOpen size={16} />
                  </button>
                )}
                <button onClick={() => handleDeleteBookmark(bookmark.id)} className="action-icon delete" title="Delete">
                  <Trash2 size={16} />
                </button>
                <button className="action-icon more" title="More options">
                  <MoreVertical size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <style jsx>{`
        .bookmarks-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        :global(.dark) .page-title {
          color: white;
        }

        .page-subtitle {
          color: #64748b;
          margin: 0.25rem 0 0;
          font-size: 0.875rem;
        }

        .batch-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          padding: 0.5rem 1rem;
          background: #f1f5f9;
          border-radius: 12px;
        }

        .batch-count {
          font-size: 0.875rem;
          font-weight: 500;
          color: #1e293b;
        }

        .batch-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .batch-btn.share {
          background: #3b82f6;
          color: white;
        }

        .batch-btn.delete {
          background: #ef4444;
          color: white;
        }

        .batch-btn.cancel {
          background: #e2e8f0;
          color: #64748b;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.25rem;
          text-align: center;
        }

        :global(.dark) .stat-card {
          background: #1e293b;
          border-color: #334155;
        }

        .stat-icon {
          width: 32px;
          height: 32px;
          margin: 0 auto 0.75rem;
          color: #8b5cf6;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1e293b;
        }

        :global(.dark) .stat-value {
          color: white;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #64748b;
        }

        /* Controls */
        .controls-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .search-container {
          flex: 1;
          position: relative;
          max-width: 400px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .search-input {
          width: 100%;
          padding: 10px 12px 10px 36px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.875rem;
          background: white;
        }

        :global(.dark) .search-input {
          background: #1e293b;
          border-color: #334155;
          color: white;
        }

        .controls-group {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .control-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 8px 12px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .view-toggle {
          display: flex;
          gap: 0.25rem;
          background: #f1f5f9;
          padding: 0.25rem;
          border-radius: 10px;
        }

        .view-btn {
          padding: 6px 10px;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
        }

        .view-btn.active {
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .sort-select {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: white;
          font-size: 0.875rem;
        }

        /* Filters Panel */
        .filters-panel {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          overflow: hidden;
        }

        :global(.dark) .filters-panel {
          background: #1e293b;
          border-color: #334155;
        }

        .filter-group {
          margin-bottom: 1.25rem;
        }

        .filter-group label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 0.75rem;
        }

        .filter-options {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .filter-chip {
          padding: 6px 12px;
          background: #f1f5f9;
          border: none;
          border-radius: 20px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-chip.active {
          background: #8b5cf6;
          color: white;
        }

        .importance-chip {
          padding: 6px 12px;
          background: #f1f5f9;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .importance-chip.active {
          background: #f59e0b;
          color: white;
        }

        /* Bookmarks Container */
        .bookmarks-container {
          margin-top: 1.5rem;
        }

        .bookmarks-container.grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 1.5rem;
        }

        .bookmarks-container.list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .bookmark-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.25rem;
          transition: all 0.2s;
          display: flex;
          gap: 1rem;
          position: relative;
        }

        .bookmark-card.unread {
          border-left: 3px solid #8b5cf6;
        }

        :global(.dark) .bookmark-card {
          background: #1e293b;
          border-color: #334155;
        }

        .bookmark-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }

        .bookmark-card.list-view {
          flex-direction: row;
        }

        .bookmark-card.list-view .bookmark-content {
          flex: 1;
        }

        .bookmark-checkbox {
          margin-top: 4px;
        }

        .bookmark-content {
          flex: 1;
        }

        .bookmark-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .bookmark-category {
          font-size: 0.7rem;
          text-transform: uppercase;
          font-weight: 600;
          color: #8b5cf6;
        }

        .importance-stars {
          font-size: 0.75rem;
        }

        .bookmark-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0 0 0.5rem;
        }

        .bookmark-title a {
          color: #1e293b;
          text-decoration: none;
        }

        .bookmark-title a:hover {
          color: #8b5cf6;
        }

        :global(.dark) .bookmark-title a {
          color: white;
        }

        .bookmark-excerpt {
          font-size: 0.875rem;
          color: #64748b;
          margin: 0 0 0.75rem;
          line-height: 1.5;
        }

        .bookmark-notes {
          font-size: 0.8rem;
          color: #8b5cf6;
          background: #f3e8ff;
          padding: 0.5rem;
          border-radius: 8px;
          margin: 0.5rem 0;
        }

        .bookmark-meta {
          display: flex;
          gap: 1rem;
          align-items: center;
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .meta-date {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .meta-tags {
          display: flex;
          gap: 0.5rem;
        }

        .tag {
          background: #f1f5f9;
          padding: 0.15rem 0.5rem;
          border-radius: 12px;
          font-size: 0.65rem;
        }

        .bookmark-actions {
          display: flex;
          gap: 0.5rem;
          align-items: flex-start;
        }

        .action-icon {
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          color: #94a3b8;
          transition: all 0.2s;
        }

        .action-icon:hover {
          background: #f1f5f9;
        }

        .action-icon.delete:hover {
          color: #ef4444;
        }

        .action-icon.mark-read:hover {
          color: #10b981;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 4rem;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .bookmarks-page {
            padding: 1rem;
          }

          .page-title {
            font-size: 1.5rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .bookmarks-container.grid {
            grid-template-columns: 1fr;
          }

          .controls-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .search-container {
            max-width: none;
          }

          .controls-group {
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  )
}