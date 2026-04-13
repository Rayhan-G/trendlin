import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import MediaUploader from '@/components/MediaUploader'
import UltimateEditor from '@/components/UltimateEditor'

export default function PostsManager() {
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [historyEntries, setHistoryEntries] = useState([])
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  const [selectedPosts, setSelectedPosts] = useState([])
  const [activeTab, setActiveTab] = useState('write')
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)
  const [mediaLibrary, setMediaLibrary] = useState([])
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [readingTime, setReadingTime] = useState(0)
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved')
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'tech',
    author: 'Admin',
    image_url: '',
    status: 'draft',
    scheduled_for: '',
    seo_title: '',
    seo_description: '',
    is_featured: false,
    tags: ''
  })

  const autoSaveTimerRef = useRef(null)

  // Check screen size for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    checkAuth()
    fetchPosts()
    fetchMediaLibrary()
    
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        savePost()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        setShowPreview(true)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current)
    autoSaveTimerRef.current = setInterval(() => {
      if (formData.content && formData.id) {
        autoSave()
      }
    }, 30000)
    return () => clearInterval(autoSaveTimerRef.current)
  }, [formData.content, formData.id])

  useEffect(() => {
    const text = formData.content.replace(/<[^>]*>/g, '')
    const words = text.trim().split(/\s+/).filter(w => w.length > 0)
    setWordCount(words.length)
    setCharCount(text.length)
    setReadingTime(Math.ceil(words.length / 200))
  }, [formData.content])

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000)
  }

  const checkAuth = () => {
    const sessionToken = localStorage.getItem('admin_session_token')
    const sessionExpiry = localStorage.getItem('admin_session_expiry')
    
    if (!sessionToken || !sessionExpiry) {
      router.push('/')
      return
    }
    
    const now = Date.now()
    if (now > parseInt(sessionExpiry)) {
      localStorage.removeItem('admin_session_token')
      localStorage.removeItem('admin_session_expiry')
      router.push('/')
    }
  }

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    
    setPosts(data || [])
    setLoading(false)
  }

  const fetchMediaLibrary = async () => {
    const { data } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    
    setMediaLibrary(data || [])
  }

  const autoSave = async () => {
    if (!formData.id) return
    
    setAutoSaveStatus('saving')
    const { error } = await supabase
      .from('posts')
      .update({ content: formData.content, updated_at: new Date().toISOString() })
      .eq('id', formData.id)
    
    if (!error) {
      setAutoSaveStatus('saved')
      setTimeout(() => setAutoSaveStatus('idle'), 2000)
    } else {
      setAutoSaveStatus('error')
    }
  }

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const insertMedia = (url, type) => {
    let mediaTag = ''
    if (type === 'image') {
      mediaTag = `<img src="${url}" alt="Image" style="max-width:100%; border-radius:12px; margin:1rem 0;" />`
    } else if (type === 'video') {
      mediaTag = `<video src="${url}" controls style="max-width:100%; border-radius:12px; margin:1rem 0;"></video>`
    } else if (type === 'pdf') {
      mediaTag = `<a href="${url}" target="_blank" style="display:inline-flex; align-items:center; gap:0.5rem; padding:0.5rem 1rem; background:linear-gradient(135deg, #667eea, #764ba2); color:white; border-radius:8px; text-decoration:none; margin:1rem 0;">📄 Download PDF</a>`
    }
    
    const newContent = formData.content + '\n\n' + mediaTag
    setFormData({...formData, content: newContent})
    setShowMediaLibrary(false)
  }

  const createNewPost = () => {
    setSelectedPost(null)
    setIsEditing(true)
    setShowEditor(true)
    setActiveTab('write')
    setFormData({
      id: null,
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'tech',
      author: 'Admin',
      image_url: '',
      status: 'draft',
      scheduled_for: '',
      seo_title: '',
      seo_description: '',
      is_featured: false,
      tags: ''
    })
  }

  const editPost = (post) => {
    setSelectedPost(post)
    setIsEditing(true)
    setShowEditor(true)
    setActiveTab('write')
    setFormData({
      id: post.id,
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      category: post.category || 'tech',
      author: post.author || 'Admin',
      image_url: post.image_url || '',
      status: post.status || 'draft',
      scheduled_for: post.scheduled_for || '',
      seo_title: post.seo_title || '',
      seo_description: post.seo_description || '',
      is_featured: post.is_featured || false,
      tags: post.tags ? post.tags.join(', ') : ''
    })
  }

  const savePost = async () => {
    setSaving(true)
    
    const postData = {
      title: formData.title.trim(),
      slug: formData.slug || generateSlug(formData.title),
      excerpt: formData.excerpt.trim(),
      content: formData.content,
      category: formData.category,
      author: formData.author.trim(),
      image_url: formData.image_url,
      status: formData.status,
      scheduled_for: formData.scheduled_for || null,
      seo_title: formData.seo_title,
      seo_description: formData.seo_description,
      is_featured: formData.is_featured,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
      updated_at: new Date().toISOString()
    }
    
    let error
    
    if (formData.id) {
      const { error: updateError } = await supabase
        .from('posts')
        .update(postData)
        .eq('id', formData.id)
      
      error = updateError
    } else {
      postData.created_at = new Date().toISOString()
      const { error: insertError } = await supabase
        .from('posts')
        .insert([postData])
      
      error = insertError
    }
    
    if (error) {
      showToast('Error: ' + error.message, 'error')
    } else {
      showToast(formData.id ? 'Post updated successfully!' : 'Post created successfully!')
      await fetchPosts()
    }
    
    setSaving(false)
  }

  const duplicatePost = async (post) => {
    const newTitle = `${post.title} (Copy)`
    const newSlug = `${post.slug}-copy-${Date.now()}`
    
    const { error } = await supabase.from('posts').insert([{
      title: newTitle,
      slug: newSlug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      author: post.author,
      image_url: post.image_url,
      status: 'draft',
      tags: post.tags,
      created_at: new Date().toISOString()
    }])
    
    if (!error) {
      await fetchPosts()
      showToast('Post duplicated successfully!')
    }
  }

  const deletePost = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    
    const { error } = await supabase.from('posts').delete().eq('id', id)
    
    if (!error) {
      await fetchPosts()
      showToast('Post deleted successfully!')
      if (selectedPost?.id === id) {
        setShowEditor(false)
        setSelectedPost(null)
      }
    }
  }

  const toggleSelectPost = (id) => {
    setSelectedPosts(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selectedPosts.length} posts? This cannot be undone.`)) return
    
    for (const id of selectedPosts) {
      await supabase.from('posts').delete().eq('id', id)
    }
    await fetchPosts()
    setSelectedPosts([])
    showToast(`${selectedPosts.length} posts deleted successfully!`)
  }

  const bulkStatusUpdate = async (status) => {
    for (const id of selectedPosts) {
      await supabase.from('posts').update({ status }).eq('id', id)
    }
    await fetchPosts()
    setSelectedPosts([])
    showToast(`${selectedPosts.length} posts updated to ${status}!`)
  }

  const getFilteredPosts = () => {
    let filtered = posts
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus)
    }
    
    return filtered
  }

  const filteredPosts = getFilteredPosts()
  const getStatusCount = (status) => posts.filter(p => p.status === status).length

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <style jsx>{`
          .loading-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .loading-spinner {
            width: 48px;
            height: 48px;
            border: 3px solid rgba(255,255,255,0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="posts-manager">
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.type === 'error' ? '❌' : '✅'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="manager-header">
        <div className="header-left">
          <h1>Content Studio</h1>
          <p className="subtitle">Enterprise Content Management System</p>
        </div>
        <button onClick={createNewPost} className="create-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>New Post</span>
        </button>
      </div>

      <div className="stats-bar">
        <div className="stat-item" onClick={() => setFilterStatus('all')}>
          <span className="stat-value">{posts.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-item published" onClick={() => setFilterStatus('published')}>
          <span className="stat-value">{getStatusCount('published')}</span>
          <span className="stat-label">Published</span>
        </div>
        <div className="stat-item draft" onClick={() => setFilterStatus('draft')}>
          <span className="stat-value">{getStatusCount('draft')}</span>
          <span className="stat-label">Drafts</span>
        </div>
        <div className="stat-item scheduled" onClick={() => setFilterStatus('scheduled')}>
          <span className="stat-value">{posts.filter(p => p.scheduled_for && new Date(p.scheduled_for) > new Date()).length}</span>
          <span className="stat-label">Scheduled</span>
        </div>
        <div className="stat-item featured" onClick={() => setFilterStatus('featured')}>
          <span className="stat-value">{posts.filter(p => p.is_featured).length}</span>
          <span className="stat-label">Featured</span>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-wrapper">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="10" cy="10" r="7"/>
            <line x1="21" y1="21" x2="15" y2="15"/>
          </svg>
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && <button className="search-clear" onClick={() => setSearchTerm('')}>×</button>}
        </div>
        
        <div className="view-toggle">
          <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </button>
          <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </button>
        </div>

        {filterStatus !== 'all' && (
          <button className="clear-filter" onClick={() => setFilterStatus('all')}>Clear ×</button>
        )}
      </div>

      {selectedPosts.length > 0 && (
        <div className="bulk-bar">
          <span className="bulk-count">{selectedPosts.length} selected</span>
          <div className="bulk-actions">
            <button onClick={() => bulkStatusUpdate('published')} className="bulk-publish">Publish</button>
            <button onClick={() => bulkStatusUpdate('draft')} className="bulk-draft">Draft</button>
            <button onClick={() => bulkStatusUpdate('scheduled')} className="bulk-schedule">Schedule</button>
            <button onClick={bulkDelete} className="bulk-delete">Delete</button>
            <button onClick={() => setSelectedPosts([])} className="bulk-cancel">Cancel</button>
          </div>
        </div>
      )}

      {!showEditor && (
        <div className={`posts-container ${viewMode}`}>
          {filteredPosts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No posts found</h3>
              <p>{searchTerm ? `No results for "${searchTerm}"` : 'Create your first post'}</p>
              <button onClick={createNewPost} className="empty-btn">Create Post</button>
            </div>
          ) : (
            filteredPosts.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-card-select">
                  <input type="checkbox" checked={selectedPosts.includes(post.id)} onChange={() => toggleSelectPost(post.id)} />
                </div>
                <div className="post-card-image">
                  {post.image_url ? <img src={post.image_url} alt={post.title} /> : <div className="post-card-image-placeholder">📷</div>}
                </div>
                <div className="post-card-content">
                  <div className="post-card-header">
                    <div className="post-card-badges">
                      <span className={`status-badge ${post.status}`}>{post.status}</span>
                      {post.is_featured && <span className="featured-badge">⭐</span>}
                      {post.scheduled_for && new Date(post.scheduled_for) > new Date() && <span className="scheduled-badge">📅</span>}
                    </div>
                    <div className="post-card-actions">
                      <button onClick={() => editPost(post)} className="action-edit" title="Edit">✏️</button>
                      <button onClick={() => duplicatePost(post)} className="action-duplicate" title="Duplicate">📋</button>
                      <button onClick={() => deletePost(post.id, post.title)} className="action-delete" title="Delete">🗑️</button>
                    </div>
                  </div>
                  <h3 className="post-card-title">{post.title}</h3>
                  <p className="post-card-excerpt">{post.excerpt?.substring(0, 100)}...</p>
                  <div className="post-card-footer">
                    <div className="post-card-meta">
                      <span className="meta-category">{post.category}</span>
                      <span className="meta-views">👁️ {post.views || 0}</span>
                      <span className="meta-date">{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <Link href={`/blog/${post.slug}`} target="_blank" className="post-card-link">View →</Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Premium Editor Modal */}
      {showEditor && (
        <div className="modal-overlay" onClick={() => { if (confirm('Close editor? Unsaved changes will be lost.')) { setShowEditor(false); setIsEditing(false); } }}>
          <div className="modal-content editor" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-tabs">
                <button className={`tab-btn ${activeTab === 'write' ? 'active' : ''}`} onClick={() => setActiveTab('write')}>Write</button>
                <button className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`} onClick={() => { setActiveTab('preview'); setShowPreview(true); }}>Preview</button>
                <button className={`tab-btn ${activeTab === 'seo' ? 'active' : ''}`} onClick={() => setActiveTab('seo')}>SEO</button>
                <button className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Settings</button>
              </div>
              <div className="modal-actions">
                <div className="auto-save-status">
                  {autoSaveStatus === 'saving' && <span className="saving">Saving...</span>}
                  {autoSaveStatus === 'saved' && <span className="saved">✓</span>}
                </div>
                <button onClick={() => setShowPreview(true)} className="preview-btn">Preview</button>
                <button onClick={() => { if (confirm('Close editor?')) { setShowEditor(false); setIsEditing(false); } }} className="close-btn">×</button>
              </div>
            </div>

            <div className="editor-scroll-container">
              {activeTab === 'write' && (
                <div className="editor-container">
                  <div className="editor-main">
                    <div className="title-section">
                      <input
                        type="text"
                        placeholder="Post title..."
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value, slug: generateSlug(e.target.value)})}
                        className="title-input"
                      />
                      <div className="slug-preview">trendlin.com/blog/{formData.slug || generateSlug(formData.title)}</div>
                    </div>

                    <div className="editor-stats">
                      <span>{wordCount} words</span>
                      <span>{charCount} chars</span>
                      <span>{readingTime} min read</span>
                    </div>

                    <UltimateEditor
                      value={formData.content}
                      onChange={(newContent) => setFormData({...formData, content: newContent})}
                      placeholder="Write your content here..."
                    />
                  </div>

                  <div className="editor-sidebar">
                    <div className="sidebar-group">
                      <label>Status</label>
                      <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>

                    <div className="sidebar-group">
                      <label>Schedule</label>
                      <input
                        type="datetime-local"
                        value={formData.scheduled_for?.slice(0, 16) || ''}
                        onChange={(e) => setFormData({...formData, scheduled_for: e.target.value})}
                      />
                    </div>

                    <div className="sidebar-group">
                      <label>Category</label>
                      <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                        <option value="tech">Technology</option>
                        <option value="wealth">Wealth</option>
                        <option value="health">Health</option>
                        <option value="growth">Growth</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="world">World</option>
                        <option value="lifestyle">Lifestyle</option>
                      </select>
                    </div>

                    <div className="sidebar-group">
                      <label>Tags</label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                        placeholder="tech, ai, future"
                      />
                    </div>

                    <div className="sidebar-group">
                      <label>Author</label>
                      <input
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData({...formData, author: e.target.value})}
                      />
                    </div>

                    <div className="sidebar-group checkbox">
                      <label>
                        <input
                          type="checkbox"
                          checked={formData.is_featured}
                          onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                        />
                        <span>Feature this post</span>
                      </label>
                    </div>

                    <div className="sidebar-group">
                      <label>Featured Image</label>
                      {formData.image_url ? (
                        <div className="image-preview">
                          <img src={formData.image_url} alt="Featured" />
                          <button onClick={() => setFormData({...formData, image_url: ''})} className="remove-image">Remove</button>
                        </div>
                      ) : (
                        <MediaUploader onUploadComplete={(url) => setFormData({...formData, image_url: url})} />
                      )}
                    </div>

                    <div className="sidebar-group">
                      <label>Excerpt</label>
                      <textarea
                        rows="3"
                        value={formData.excerpt}
                        onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                        placeholder="Short summary..."
                      />
                    </div>

                    <div className="sidebar-group">
                      <label>SEO Title</label>
                      <input
                        type="text"
                        value={formData.seo_title}
                        onChange={(e) => setFormData({...formData, seo_title: e.target.value})}
                        placeholder="SEO title"
                      />
                    </div>

                    <div className="sidebar-group">
                      <label>SEO Description</label>
                      <textarea
                        rows="2"
                        value={formData.seo_description}
                        onChange={(e) => setFormData({...formData, seo_description: e.target.value})}
                        placeholder="Meta description"
                      />
                    </div>

                    <div className="sidebar-actions">
                      <button onClick={savePost} disabled={saving} className="save-btn">
                        {saving ? 'Saving...' : (formData.id ? 'Update' : 'Publish')}
                      </button>
                      <button onClick={() => { if (confirm('Close editor?')) { setShowEditor(false); setIsEditing(false); } }} className="cancel-btn">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="seo-container">
                  <div className="seo-group">
                    <h3>SEO Title</h3>
                    <input
                      type="text"
                      value={formData.seo_title}
                      onChange={(e) => setFormData({...formData, seo_title: e.target.value})}
                      placeholder="SEO Title"
                    />
                    <div className="seo-preview">
                      <div className="preview-title">{formData.seo_title || formData.title}</div>
                      <div className="preview-url">trendlin.com/blog/{formData.slug || generateSlug(formData.title)}</div>
                      <div className="preview-desc">{formData.seo_description || formData.excerpt?.substring(0, 160)}</div>
                    </div>
                  </div>

                  <div className="seo-group">
                    <h3>Meta Description</h3>
                    <textarea
                      rows="3"
                      value={formData.seo_description}
                      onChange={(e) => setFormData({...formData, seo_description: e.target.value})}
                      placeholder="Meta description (150-160 characters)"
                    />
                    <div className="char-count">{formData.seo_description?.length || 0}/160</div>
                  </div>

                  <div className="seo-group">
                    <h3>Excerpt</h3>
                    <textarea
                      rows="3"
                      value={formData.excerpt}
                      onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                      placeholder="Post excerpt"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="settings-container">
                  <div className="settings-group">
                    <h3>Post Settings</h3>
                    <div className="setting-item">
                      <label>Post Slug</label>
                      <input type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} />
                      <small>trendlin.com/blog/{formData.slug || generateSlug(formData.title)}</small>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="modal-content preview" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Preview</h2>
              <button className="close-btn" onClick={() => setShowPreview(false)}>×</button>
            </div>
            <div className="preview-content">
              {formData.image_url && <img src={formData.image_url} alt={formData.title} className="preview-image" />}
              <h1>{formData.title}</h1>
              <div className="preview-meta">
                <span>By {formData.author}</span>
                <span>{formData.category}</span>
                <span>{new Date().toLocaleDateString()}</span>
                <span>{readingTime} min read</span>
              </div>
              <div className="preview-body" dangerouslySetInnerHTML={{ __html: formData.content }} />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .posts-manager {
          min-height: 100vh;
          background: #f8fafc;
          padding: 1rem;
        }
        
        :global(body.dark) .posts-manager {
          background: #0f172a;
        }
        
        @media (min-width: 768px) {
          .posts-manager {
            padding: 2rem;
          }
        }
        
        .toast {
          position: fixed;
          bottom: 1rem;
          right: 1rem;
          left: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: white;
          border-radius: 12px;
          z-index: 1200;
          animation: slideIn 0.3s ease;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
        }
        
        @media (min-width: 768px) {
          .toast {
            bottom: 2rem;
            right: 2rem;
            left: auto;
          }
        }
        
        .toast-error { border-left: 4px solid #ef4444; }
        .toast-success { border-left: 4px solid #10b981; }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .manager-header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        @media (min-width: 768px) {
          .manager-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
          }
        }
        
        .header-left h1 {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          margin: 0;
        }
        
        @media (min-width: 768px) {
          .header-left h1 {
            font-size: 1.75rem;
          }
        }
        
        .subtitle {
          color: #64748b;
          font-size: 0.85rem;
          margin-top: 0.25rem;
        }
        
        .create-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .create-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(102,126,234,0.4);
        }
        
        @media (min-width: 768px) {
          .create-btn {
            padding: 0.6rem 1.25rem;
          }
        }
        
        .stats-bar {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        
        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.8rem;
          background: white;
          border-radius: 40px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .stat-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        
        :global(body.dark) .stat-item {
          background: #1e293b;
          color: #e2e8f0;
        }
        
        .stat-value {
          font-weight: 700;
          font-size: 1.1rem;
        }
        
        .stat-label {
          font-size: 0.7rem;
          color: #64748b;
        }
        
        .filters-bar {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        
        @media (min-width: 768px) {
          .filters-bar {
            flex-direction: row;
            align-items: center;
          }
        }
        
        .search-wrapper {
          flex: 1;
          position: relative;
        }
        
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #94a3b8;
        }
        
        .search-input {
          width: 100%;
          padding: 0.6rem 2rem 0.6rem 2.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 40px;
          background: white;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
        }
        
        :global(body.dark) .search-input {
          background: #1e293b;
          border-color: #334155;
          color: white;
        }
        
        .search-clear {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          color: #94a3b8;
        }
        
        .view-toggle {
          display: flex;
          background: white;
          border-radius: 10px;
          padding: 0.25rem;
          align-self: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .view-toggle button {
          padding: 0.4rem 0.7rem;
          background: none;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .view-toggle button.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .view-toggle svg {
          width: 16px;
          height: 16px;
        }
        
        .clear-filter {
          padding: 0.5rem 0.8rem;
          background: #f1f5f9;
          border: none;
          border-radius: 40px;
          cursor: pointer;
          font-size: 0.8rem;
          align-self: center;
          transition: all 0.2s;
        }
        
        .clear-filter:hover {
          background: #e2e8f0;
        }
        
        .bulk-bar {
          background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
          border-radius: 12px;
          padding: 0.75rem;
          margin-bottom: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          text-align: center;
          border: 1px solid rgba(102,126,234,0.2);
        }
        
        @media (min-width: 768px) {
          .bulk-bar {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }
        
        .bulk-count {
          font-weight: 600;
          color: #4f46e5;
        }
        
        .bulk-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .bulk-actions button {
          padding: 0.35rem 0.7rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.75rem;
          transition: all 0.2s;
        }
        
        .bulk-publish { background: #10b981; color: white; }
        .bulk-draft { background: #f59e0b; color: white; }
        .bulk-schedule { background: #3b82f6; color: white; }
        .bulk-delete { background: #ef4444; color: white; }
        .bulk-cancel { background: #64748b; color: white; }
        
        .bulk-actions button:hover {
          transform: translateY(-1px);
          filter: brightness(1.05);
        }
        
        .posts-container.grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        
        @media (min-width: 640px) {
          .posts-container.grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (min-width: 1024px) {
          .posts-container.grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        .posts-container.list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .post-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          transition: all 0.3s;
        }
        
        .post-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -12px rgba(0,0,0,0.1);
        }
        
        :global(body.dark) .post-card {
          background: #1e293b;
        }
        
        .posts-container.list .post-card {
          flex-direction: row;
        }
        
        .posts-container.list .post-card-image {
          width: 100px;
          height: 100px;
        }
        
        .post-card-select {
          padding: 0.75rem;
        }
        
        .post-card-image {
          width: 100%;
          height: 160px;
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          overflow: hidden;
        }
        
        .post-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }
        
        .post-card:hover .post-card-image img {
          transform: scale(1.05);
        }
        
        .post-card-image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }
        
        .post-card-content {
          padding: 0.75rem;
        }
        
        .post-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }
        
        .post-card-badges {
          display: flex;
          gap: 0.25rem;
          flex-wrap: wrap;
        }
        
        .status-badge {
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 600;
        }
        
        .status-badge.published { background: #d1fae5; color: #065f46; }
        .status-badge.draft { background: #fef3c7; color: #92400e; }
        
        .featured-badge, .scheduled-badge {
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.65rem;
        }
        
        .featured-badge { background: #fef3c7; color: #d97706; }
        .scheduled-badge { background: #dbeafe; color: #1e40af; }
        
        .post-card-actions {
          display: flex;
          gap: 0.25rem;
        }
        
        .post-card-actions button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
          padding: 0.25rem;
          border-radius: 4px;
          transition: background 0.2s;
        }
        
        .post-card-actions button:hover {
          background: #f1f5f9;
        }
        
        .post-card-title {
          font-size: 0.95rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
          color: #0f172a;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        :global(body.dark) .post-card-title {
          color: #f1f5f9;
        }
        
        .post-card-excerpt {
          font-size: 0.75rem;
          color: #64748b;
          margin-bottom: 0.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .post-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .post-card-meta {
          display: flex;
          gap: 0.5rem;
          font-size: 0.65rem;
          color: #94a3b8;
        }
        
        .post-card-link {
          font-size: 0.7rem;
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
        }
        
        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
          background: white;
          border-radius: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .empty-icon {
          font-size: 4rem;
          margin-bottom: 0.5rem;
        }
        
        .empty-state h3 {
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
          color: #0f172a;
        }
        
        .empty-state p {
          color: #64748b;
          margin-bottom: 1rem;
        }
        
        .empty-btn {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        
        /* Modal - Premium */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
        }
        
        .modal-content {
          background: white;
          border-radius: 24px;
          width: 100%;
          max-width: 100%;
          height: 100%;
          max-height: 95vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
        }
        
        @media (min-width: 1024px) {
          .modal-content.editor {
            max-width: 95%;
            width: 95%;
          }
        }
        
        :global(body.dark) .modal-content {
          background: #1e293b;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e2e8f0;
          background: white;
          flex-shrink: 0;
        }
        
        :global(body.dark) .modal-header {
          background: #1e293b;
          border-bottom-color: #334155;
        }
        
        .modal-tabs {
          display: flex;
          gap: 0.25rem;
          flex-wrap: wrap;
        }
        
        .tab-btn {
          padding: 0.4rem 0.8rem;
          background: none;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s;
        }
        
        .tab-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .modal-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        
        .auto-save-status {
          font-size: 0.7rem;
          color: #64748b;
        }
        
        .preview-btn, .close-btn {
          padding: 0.35rem 0.7rem;
          background: #f1f5f9;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .preview-btn:hover, .close-btn:hover {
          background: #e2e8f0;
        }
        
        .close-btn {
          font-size: 1.2rem;
          padding: 0.35rem 0.6rem;
        }
        
        .editor-scroll-container {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }
        
        .editor-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        @media (min-width: 1024px) {
          .editor-container {
            flex-direction: row;
          }
        }
        
        .editor-main {
          flex: 2;
        }
        
        .title-input {
          width: 100%;
          padding: 0.75rem;
          font-size: 1.2rem;
          font-weight: 600;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          margin-bottom: 0.5rem;
          transition: all 0.2s;
        }
        
        .title-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
        }
        
        .slug-preview {
          font-size: 0.7rem;
          color: #64748b;
          margin-bottom: 0.75rem;
        }
        
        .editor-stats {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          font-size: 0.7rem;
          color: #64748b;
        }
        
        .editor-sidebar {
          flex: 1;
        }
        
        .sidebar-group {
          background: #f8fafc;
          border-radius: 12px;
          padding: 0.75rem;
          margin-bottom: 0.75rem;
          transition: all 0.2s;
        }
        
        :global(body.dark) .sidebar-group {
          background: #0f172a;
        }
        
        .sidebar-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.25rem;
          font-size: 0.8rem;
          color: #334155;
        }
        
        :global(body.dark) .sidebar-group label {
          color: #cbd5e1;
        }
        
        .sidebar-group input, .sidebar-group select, .sidebar-group textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        
        .sidebar-group input:focus, .sidebar-group select:focus, .sidebar-group textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
        }
        
        .checkbox label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        
        .image-preview {
          position: relative;
          margin-top: 0.5rem;
        }
        
        .image-preview img {
          width: 100%;
          max-height: 120px;
          object-fit: cover;
          border-radius: 8px;
        }
        
        .remove-image {
          position: absolute;
          top: 5px;
          right: 5px;
          background: rgba(0,0,0,0.7);
          color: white;
          border: none;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.7rem;
        }
        
        .sidebar-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
        }
        
        .save-btn, .cancel-btn {
          flex: 1;
          padding: 0.6rem;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .save-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(102,126,234,0.3);
        }
        
        .cancel-btn {
          background: #ef4444;
          color: white;
        }
        
        .cancel-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(239,68,68,0.3);
        }
        
        /* SEO & Settings */
        .seo-container, .settings-container {
          padding: 0.5rem;
        }
        
        .seo-group {
          margin-bottom: 1rem;
        }
        
        .seo-group h3 {
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          color: #0f172a;
        }
        
        .seo-preview {
          margin-top: 0.5rem;
          padding: 0.6rem;
          background: #f8fafc;
          border-radius: 8px;
        }
        
        .preview-title {
          color: #1a0dab;
          font-size: 0.9rem;
        }
        
        .preview-url {
          color: #006621;
          font-size: 0.7rem;
        }
        
        .preview-desc {
          color: #545454;
          font-size: 0.7rem;
        }
        
        .char-count {
          margin-top: 0.25rem;
          font-size: 0.65rem;
          color: #64748b;
        }
        
        .settings-group h3 {
          font-size: 0.9rem;
          margin-bottom: 0.75rem;
          color: #0f172a;
        }
        
        .setting-item {
          margin-bottom: 0.75rem;
        }
        
        .setting-item label {
          display: block;
          margin-bottom: 0.25rem;
          font-weight: 500;
          font-size: 0.85rem;
        }
        
        .setting-item input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }
        
        .setting-item small {
          display: block;
          margin-top: 0.25rem;
          color: #64748b;
          font-size: 0.65rem;
        }
        
        /* Preview Modal */
        .modal-content.preview {
          max-width: 100%;
          height: auto;
          max-height: 90vh;
        }
        
        @media (min-width: 768px) {
          .modal-content.preview {
            max-width: 800px;
          }
        }
        
        .preview-content {
          padding: 1rem;
          overflow-y: auto;
        }
        
        .preview-image {
          width: 100%;
          max-height: 250px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 1rem;
        }
        
        .preview-meta {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          color: #64748b;
          font-size: 0.75rem;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .preview-body {
          font-size: 0.9rem;
          line-height: 1.6;
        }
        
        .preview-body img {
          max-width: 100%;
          border-radius: 8px;
        }
      `}</style>
    </div>
  )
}