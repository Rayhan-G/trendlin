// src/pages/admin/posts-manager.js

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

// Simple Admin Navigation Component (no external dependencies)
const AdminNavigation = ({ children }) => {
  const router = useRouter()
  
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link href="/admin/dashboard" className="text-xl font-bold text-purple-600">
                Admin Panel
              </Link>
              <div className="hidden md:flex gap-4">
                <Link href="/admin/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/admin/posts-manager" className="text-sm text-purple-600 font-medium">
                  Posts
                </Link>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}

// Format number helper
const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export default function PostsManager() {
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewPost, setPreviewPost] = useState(null)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  
  // Dropdown states
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)
  const statusDropdownRef = useRef(null)
  const categoryDropdownRef = useRef(null)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [totalPosts, setTotalPosts] = useState(0)
  
  // Selected posts for bulk actions
  const [selectedPosts, setSelectedPosts] = useState(new Set())
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkAction, setBulkAction] = useState('')

  const [stats, setStats] = useState({ all: 0, published: 0, draft: 0, scheduled: 0, archived: 0 })

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false)
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    checkAuth()
    fetchPosts()
  }, [currentPage, itemsPerPage, statusFilter])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (!data.authenticated || !data.user?.is_admin) {
        router.push('/')
      }
    } catch (error) {
      router.push('/')
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000)
  }

  const fetchPosts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Get total count with status filter
      let countQuery = supabase.from('posts').select('*', { count: 'exact', head: true })
      if (statusFilter !== 'all') {
        countQuery = countQuery.eq('status', statusFilter)
      }
      const { count: total, error: countError } = await countQuery
      if (countError) throw countError
      setTotalPosts(total || 0)
      
      // Get paginated posts
      const start = (currentPage - 1) * itemsPerPage
      const end = start + itemsPerPage - 1
      
      let dataQuery = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(start, end)
      
      if (statusFilter !== 'all') {
        dataQuery = dataQuery.eq('status', statusFilter)
      }
      
      const { data, error } = await dataQuery
      if (error) throw error
      
      setPosts(data || [])
      
      // Calculate stats from ALL posts
      const { data: allPosts, error: statsError } = await supabase
        .from('posts')
        .select('status')
      
      if (!statsError && allPosts) {
        setStats({
          all: allPosts.length,
          published: allPosts.filter(p => p.status === 'published').length,
          draft: allPosts.filter(p => p.status === 'draft').length,
          scheduled: allPosts.filter(p => p.status === 'scheduled').length,
          archived: allPosts.filter(p => p.status === 'archived').length
        })
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      setError('Failed to load posts')
      showToast('Failed to load posts', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Apply filters client-side for search and category
  const getFilteredPosts = useCallback(() => {
    let filtered = [...posts]
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category?.toLowerCase() === categoryFilter.toLowerCase())
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(q) || 
        p.excerpt?.toLowerCase().includes(q) ||
        p.content?.toLowerCase().includes(q)
      )
    }
    
    return filtered
  }, [posts, categoryFilter, searchQuery])

  const filteredPosts = getFilteredPosts()

  const handleDelete = async (id) => {
    if (!confirm('Delete this post? This action cannot be undone.')) return
    
    try {
      const { error } = await supabase.from('posts').delete().eq('id', id)
      if (error) throw error
      showToast('Post deleted successfully')
      fetchPosts()
    } catch (error) {
      console.error('Error deleting post:', error)
      showToast('Failed to delete post', 'error')
    }
  }

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedPosts)
    if (!confirm(`Delete ${ids.length} post${ids.length !== 1 ? 's' : ''}? This cannot be undone.`)) return
    
    try {
      const { error } = await supabase.from('posts').delete().in('id', ids)
      if (error) throw error
      showToast(`${ids.length} post${ids.length !== 1 ? 's' : ''} deleted successfully`)
      setSelectedPosts(new Set())
      setShowBulkModal(false)
      fetchPosts()
    } catch (error) {
      console.error('Error bulk deleting posts:', error)
      showToast('Failed to delete posts', 'error')
    }
  }

  const handleBulkStatusChange = async (newStatus) => {
    const ids = Array.from(selectedPosts)
    try {
      const updateData = { 
        status: newStatus, 
        updated_at: new Date().toISOString() 
      }
      if (newStatus === 'published') {
        updateData.published_at = new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('posts')
        .update(updateData)
        .in('id', ids)
      
      if (error) throw error
      showToast(`${ids.length} post${ids.length !== 1 ? 's' : ''} ${newStatus === 'published' ? 'published' : 'moved to draft'}`)
      setSelectedPosts(new Set())
      setShowBulkModal(false)
      fetchPosts()
    } catch (error) {
      console.error('Error bulk updating posts:', error)
      showToast('Failed to update posts', 'error')
    }
  }

  const handleStatusChange = async (post, newStatus) => {
    try {
      const updateData = { 
        status: newStatus, 
        updated_at: new Date().toISOString() 
      }
      
      if (newStatus === 'published' && !post.published_at) {
        updateData.published_at = new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', post.id)
      
      if (error) throw error
      showToast(`Post ${newStatus === 'published' ? 'published' : newStatus === 'draft' ? 'moved to drafts' : 'status updated'}`)
      fetchPosts()
    } catch (error) {
      console.error('Error updating status:', error)
      showToast('Failed to update status', 'error')
    }
  }

  const openScheduleModal = (post) => {
    setSelectedPost(post)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setScheduleDate(tomorrow.toISOString().split('T')[0])
    setScheduleTime('09:00')
    setShowScheduleModal(true)
  }

  const handleSchedule = async () => {
    if (!selectedPost || !scheduleDate || !scheduleTime) return
    
    const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString()
    
    try {
      const { error } = await supabase
        .from('posts')
        .update({ 
          status: 'scheduled', 
          scheduled_for: scheduledDateTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPost.id)
      
      if (error) throw error
      showToast(`Post scheduled for ${new Date(scheduledDateTime).toLocaleString()}`)
      setShowScheduleModal(false)
      fetchPosts()
    } catch (error) {
      console.error('Error scheduling post:', error)
      showToast('Failed to schedule post', 'error')
    }
  }

  const openPreview = (post) => {
    setPreviewPost(post)
    setShowPreviewModal(true)
  }

  const toggleSelectPost = (postId) => {
    const newSelected = new Set(selectedPosts)
    if (newSelected.has(postId)) {
      newSelected.delete(postId)
    } else {
      newSelected.add(postId)
    }
    setSelectedPosts(newSelected)
  }

  const selectAllFiltered = () => {
    if (selectedPosts.size === filteredPosts.length && filteredPosts.length > 0) {
      setSelectedPosts(new Set())
    } else {
      setSelectedPosts(new Set(filteredPosts.map(p => p.id)))
    }
  }

  const exportToCSV = () => {
    const headers = ['Title', 'Status', 'Category', 'Views', 'Created At', 'Published At', 'Scheduled For']
    const rows = filteredPosts.map(post => [
      `"${post.title?.replace(/"/g, '""') || 'Untitled'}"`,
      post.status,
      post.category || 'Uncategorized',
      post.views || 0,
      new Date(post.created_at).toLocaleDateString(),
      post.published_at ? new Date(post.published_at).toLocaleDateString() : '-',
      post.scheduled_for ? new Date(post.scheduled_for).toLocaleString() : '-'
    ])
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `posts_export_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Export complete')
  }

  const formatRelativeDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }

  // Category helpers
  const getCategoryIcon = (categoryId) => {
    const icons = {
      health: '🌿',
      tech: '⚡',
      entertainment: '🎬',
      wealth: '💰',
      world: '🌍',
      lifestyle: '✨',
      growth: '🌱'
    }
    return icons[categoryId] || '📄'
  }

  const getCategoryColor = (categoryId) => {
    const colors = {
      health: '#10b981',
      tech: '#3b82f6',
      entertainment: '#ec4899',
      wealth: '#f59e0b',
      world: '#06b6d4',
      lifestyle: '#f97316',
      growth: '#10b981'
    }
    return colors[categoryId] || '#6b7280'
  }

  // Status helpers
  const getStatusColor = (status) => {
    const colors = {
      published: '#10b981',
      draft: '#f59e0b',
      scheduled: '#8b5cf6',
      archived: '#6b7280'
    }
    return colors[status] || '#6b7280'
  }

  const getStatusIcon = (status) => {
    const icons = {
      published: '✓',
      draft: '✎',
      scheduled: '⏰',
      archived: '📦'
    }
    return icons[status] || '●'
  }

  const statusOptions = [
    { value: 'all', label: 'All Status', icon: '📋', color: '#6b7280' },
    { value: 'published', label: 'Published', icon: '✓', color: '#10b981' },
    { value: 'draft', label: 'Draft', icon: '✎', color: '#f59e0b' },
    { value: 'scheduled', label: 'Scheduled', icon: '⏰', color: '#8b5cf6' },
    { value: 'archived', label: 'Archived', icon: '📦', color: '#6b7280' }
  ]

  const categoryOptions = [
    { value: 'all', label: 'All Categories', icon: '📁', color: '#6b7280' },
    { value: 'health', label: 'Health & Wellness', icon: '🌿', color: '#10b981' },
    { value: 'tech', label: 'Technology', icon: '⚡', color: '#3b82f6' },
    { value: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#ec4899' },
    { value: 'wealth', label: 'Wealth & Finance', icon: '💰', color: '#f59e0b' },
    { value: 'world', label: 'World News', icon: '🌍', color: '#06b6d4' },
    { value: 'lifestyle', label: 'Lifestyle', icon: '✨', color: '#f97316' },
    { value: 'growth', label: 'Personal Growth', icon: '🌱', color: '#10b981' }
  ]

  if (loading && posts.length === 0) {
    return (
      <AdminNavigation>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ width: '40px', height: '40px', border: '2px solid #eaeaea', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
        </div>
      </AdminNavigation>
    )
  }

  return (
    <AdminNavigation>
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Toast */}
        {toast.show && (
          <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 50, background: toast.type === 'error' ? '#ef4444' : '#10b981', color: 'white', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 600, margin: 0 }}>Posts Manager</h1>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>Manage and organize your content</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={exportToCSV} style={{ padding: '10px 20px', background: '#f5f5f5', border: '1px solid #eaeaea', borderRadius: '12px', cursor: 'pointer', fontSize: '14px' }}>
              📥 Export CSV
            </button>
            <Link href="/admin/posts/create">
              <button style={{ padding: '10px 20px', background: '#000', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 500 }}>
                + New Post
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: '#888' }}>Total</div>
            <div style={{ fontSize: '28px', fontWeight: 700 }}>{stats.all}</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: '#888' }}>Published</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#10b981' }}>{stats.published}</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: '#888' }}>Drafts</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#f59e0b' }}>{stats.draft}</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: '#888' }}>Scheduled</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#8b5cf6' }}>{stats.scheduled}</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: '#888' }}>Archived</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#6b7280' }}>{stats.archived}</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="🔍 Search posts by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', border: '1px solid #eaeaea', borderRadius: '12px', marginBottom: '12px', fontSize: '14px' }}
          />
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {/* Status Dropdown */}
            <div className="dropdown-container" ref={statusDropdownRef} style={{ position: 'relative' }}>
              <button 
                className={`dropdown-trigger ${statusFilter !== 'all' ? 'active' : ''}`}
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: '#fff',
                  border: `1px solid ${statusFilter !== 'all' ? getStatusColor(statusFilter) : '#eaeaea'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ color: statusFilter !== 'all' ? getStatusColor(statusFilter) : '#666' }}>
                  {statusFilter !== 'all' ? getStatusIcon(statusFilter) : '📋'}
                </span>
                <span>{statusFilter !== 'all' ? statusOptions.find(s => s.value === statusFilter)?.label : 'All Status'}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isStatusDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              
              {isStatusDropdownOpen && (
                <div className="dropdown-menu" style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '4px',
                  background: '#fff',
                  border: '1px solid #eaeaea',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  minWidth: '160px',
                  zIndex: 100,
                  overflow: 'hidden'
                }}>
                  {statusOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStatusFilter(option.value)
                        setIsStatusDropdownOpen(false)
                        setCurrentPage(1)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '10px 16px',
                        background: statusFilter === option.value ? '#f5f5f5' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '13px',
                        textAlign: 'left',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = statusFilter === option.value ? '#f5f5f5' : 'transparent'}
                    >
                      <span style={{ color: option.color }}>{option.icon}</span>
                      <span>{option.label}</span>
                      {statusFilter === option.value && <span style={{ marginLeft: 'auto', color: '#10b981' }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="dropdown-container" ref={categoryDropdownRef} style={{ position: 'relative' }}>
              <button 
                className={`dropdown-trigger ${categoryFilter !== 'all' ? 'active' : ''}`}
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: '#fff',
                  border: `1px solid ${categoryFilter !== 'all' ? getCategoryColor(categoryFilter) : '#eaeaea'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}
              >
                <span>{categoryFilter !== 'all' ? getCategoryIcon(categoryFilter) : '📁'}</span>
                <span>{categoryFilter !== 'all' ? categoryOptions.find(c => c.value === categoryFilter)?.label : 'All Categories'}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isCategoryDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              
              {isCategoryDropdownOpen && (
                <div className="dropdown-menu" style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '4px',
                  background: '#fff',
                  border: '1px solid #eaeaea',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  minWidth: '200px',
                  zIndex: 100,
                  overflow: 'hidden'
                }}>
                  {categoryOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setCategoryFilter(option.value)
                        setIsCategoryDropdownOpen(false)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '10px 16px',
                        background: categoryFilter === option.value ? '#f5f5f5' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '13px',
                        textAlign: 'left',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = categoryFilter === option.value ? '#f5f5f5' : 'transparent'}
                    >
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                      {categoryFilter === option.value && <span style={{ marginLeft: 'auto', color: '#10b981' }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Bulk Actions */}
            {selectedPosts.size > 0 && (
              <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                <button onClick={() => handleBulkStatusChange('published')} style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  ✓ Publish ({selectedPosts.size})
                </button>
                <button onClick={() => handleBulkStatusChange('draft')} style={{ padding: '8px 16px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  ✎ Draft ({selectedPosts.size})
                </button>
                <button onClick={() => { setBulkAction('delete'); setShowBulkModal(true) }} style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  🗑 Delete ({selectedPosts.size})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Posts Table */}
        <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '16px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eaeaea', background: '#fafafa' }}>
                <th style={{ padding: '16px', textAlign: 'left', width: '40px' }}>
                  <input type="checkbox" checked={selectedPosts.size === filteredPosts.length && filteredPosts.length > 0} onChange={selectAllFiltered} />
                </th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Title</th>
                <th style={{ padding: '16px', textAlign: 'left', width: '100px' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'left', width: '100px' }}>Category</th>
                <th style={{ padding: '16px', textAlign: 'left', width: '80px' }}>Views</th>
                <th style={{ padding: '16px', textAlign: 'left', width: '100px' }}>Date</th>
                <th style={{ padding: '16px', textAlign: 'left', width: '180px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
                    No posts found
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '16px' }}>
                      <input type="checkbox" checked={selectedPosts.has(post.id)} onChange={() => toggleSelectPost(post.id)} />
                    </td>
                    <td style={{ padding: '16px' }}>
                      <Link href={`/admin/posts/edit/${post.id}`} style={{ fontWeight: 500, color: '#000', textDecoration: 'none' }}>
                        {post.title || 'Untitled'}
                      </Link>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px', 
                        borderRadius: '100px', 
                        fontSize: '11px', 
                        fontWeight: 500,
                        background: post.status === 'published' ? '#ecfdf5' : post.status === 'draft' ? '#fffbeb' : post.status === 'scheduled' ? '#f5f3ff' : '#f3f4f6',
                        color: getStatusColor(post.status)
                      }}>
                        <span>{getStatusIcon(post.status)}</span>
                        <span>{post.status || 'draft'}</span>
                      </span>
                      {post.status === 'scheduled' && post.scheduled_for && (
                        <div style={{ fontSize: '10px', color: '#888', marginTop: '4px' }}>{formatDateTime(post.scheduled_for)}</div>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                        <span>{getCategoryIcon(post.category)}</span>
                        <span>{post.category || '-'}</span>
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontWeight: 500 }}>{formatNumber(post.views || 0)}</td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#666' }}>{formatRelativeDate(post.created_at)}</td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <Link href={`/admin/posts/edit/${post.id}`}>
                          <button style={{ padding: '4px 10px', fontSize: '12px', background: '#f5f5f5', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Edit</button>
                        </Link>
                        <button onClick={() => openPreview(post)} style={{ padding: '4px 10px', fontSize: '12px', background: '#ecfdf5', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#10b981' }}>Preview</button>
                        {post.status === 'draft' && (
                          <>
                            <button onClick={() => handleStatusChange(post, 'published')} style={{ padding: '4px 10px', fontSize: '12px', background: '#ecfdf5', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#10b981' }}>Publish</button>
                            <button onClick={() => openScheduleModal(post)} style={{ padding: '4px 10px', fontSize: '12px', background: '#f5f3ff', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#8b5cf6' }}>Schedule</button>
                          </>
                        )}
                        {post.status === 'scheduled' && (
                          <button onClick={() => handleStatusChange(post, 'published')} style={{ padding: '4px 10px', fontSize: '12px', background: '#ecfdf5', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#10b981' }}>Publish Now</button>
                        )}
                        <button onClick={() => handleDelete(post.id)} style={{ padding: '4px 10px', fontSize: '12px', background: '#fef2f2', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#ef4444' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredPosts.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '13px', color: '#888' }}>
              Showing {filteredPosts.length} of {totalPosts} posts
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} style={{ padding: '6px 12px', border: '1px solid #eaeaea', borderRadius: '6px', fontSize: '13px' }}>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>
        )}

        {/* Schedule Modal */}
        {showScheduleModal && selectedPost && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowScheduleModal(false)}>
            <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', maxWidth: '400px', width: '90%' }} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Schedule Post</h3>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>Choose date and time to publish "{selectedPost.title?.substring(0, 50)}"</p>
              <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #eaeaea', borderRadius: '8px', marginBottom: '12px' }} />
              <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #eaeaea', borderRadius: '8px', marginBottom: '20px' }} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowScheduleModal(false)} style={{ flex: 1, padding: '10px', border: '1px solid #eaeaea', borderRadius: '8px', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSchedule} style={{ flex: 1, padding: '10px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Schedule</button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Delete Modal */}
        {showBulkModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowBulkModal(false)}>
            <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', maxWidth: '400px', width: '90%' }} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Confirm Delete</h3>
              <p style={{ color: '#666', marginBottom: '20px' }}>Delete {selectedPosts.size} post{selectedPosts.size !== 1 ? 's' : ''}? This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowBulkModal(false)} style={{ flex: 1, padding: '10px', border: '1px solid #eaeaea', borderRadius: '8px', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleBulkDelete} style={{ flex: 1, padding: '10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreviewModal && previewPost && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflow: 'auto', padding: '20px' }} onClick={() => setShowPreviewModal(false)}>
            <div style={{ background: '#fff', borderRadius: '20px', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
              <div style={{ position: 'sticky', top: 0, background: '#fff', padding: '16px 20px', borderBottom: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Preview: {previewPost.title || 'Untitled'}</h3>
                <button onClick={() => setShowPreviewModal(false)} style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
              </div>
              <div style={{ padding: '24px' }}>
                {previewPost.featured_image && <img src={previewPost.featured_image} alt={previewPost.title} style={{ width: '100%', borderRadius: '12px', marginBottom: '20px' }} />}
                <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>{previewPost.title || 'Untitled'}</h1>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
                  {previewPost.category} • {new Date(previewPost.created_at).toLocaleDateString()}
                </div>
                <div dangerouslySetInnerHTML={{ __html: previewPost.content || '<p>No content</p>' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AdminNavigation>
  )
}