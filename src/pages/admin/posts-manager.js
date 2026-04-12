import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import MediaUploader from '@/components/MediaUploader'

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
  const [bulkAction, setBulkAction] = useState('')
  
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

  useEffect(() => {
    checkAuth()
    fetchPosts()
  }, [])

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

  const fetchHistory = async (postId) => {
    const { data } = await supabase
      .from('post_versions')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
    
    setHistoryEntries(data || [])
  }

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const createNewPost = () => {
    setSelectedPost(null)
    setIsEditing(true)
    setShowEditor(true)
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

  const saveVersion = async (postId, content, reason = 'manual') => {
    await supabase.from('post_versions').insert([{
      post_id: postId,
      title: formData.title,
      content: content,
      excerpt: formData.excerpt,
      created_at: new Date().toISOString(),
      reason: reason
    }])
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
      
      if (!error && selectedPost?.content !== formData.content) {
        await saveVersion(formData.id, formData.content, 'manual-save')
      }
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
      setShowEditor(false)
      setIsEditing(false)
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

  const getStatusCount = (status) => {
    return posts.filter(p => p.status === status).length
  }

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
            background: #f8fafc;
          }
          .loading-spinner {
            width: 48px;
            height: 48px;
            border: 3px solid #e2e8f0;
            border-top-color: #667eea;
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
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.type === 'error' ? '❌' : '✅'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="manager-header">
        <div className="header-left">
          <h1>Posts Manager</h1>
          <p className="subtitle">Create, edit, and manage all your content</p>
        </div>
        <button onClick={createNewPost} className="create-btn">
          <span>+</span> New Post
        </button>
      </div>

      {/* Stats Bar */}
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

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="search-wrapper">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="10" cy="10" r="7"/>
            <line x1="21" y1="21" x2="15" y2="15"/>
          </svg>
          <input
            type="text"
            placeholder="Search posts by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="search-clear" onClick={() => setSearchTerm('')}>×</button>
          )}
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
          <button className="clear-filter" onClick={() => setFilterStatus('all')}>
            Clear filter ×
          </button>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedPosts.length > 0 && (
        <div className="bulk-bar">
          <span className="bulk-count">{selectedPosts.length} selected</span>
          <div className="bulk-actions">
            <button onClick={() => bulkStatusUpdate('published')} className="bulk-publish">
              Publish
            </button>
            <button onClick={() => bulkStatusUpdate('draft')} className="bulk-draft">
              Move to Draft
            </button>
            <button onClick={bulkDelete} className="bulk-delete">
              Delete
            </button>
            <button onClick={() => setSelectedPosts([])} className="bulk-cancel">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Posts Grid/List */}
      {!showEditor && (
        <div className={`posts-container ${viewMode}`}>
          {filteredPosts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No posts found</h3>
              <p>{searchTerm ? `No results for "${searchTerm}"` : 'Create your first post to get started'}</p>
              <button onClick={createNewPost} className="empty-btn">Create New Post</button>
            </div>
          ) : (
            filteredPosts.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-card-select">
                  <input
                    type="checkbox"
                    checked={selectedPosts.includes(post.id)}
                    onChange={() => toggleSelectPost(post.id)}
                  />
                </div>
                <div className="post-card-image">
                  {post.image_url ? (
                    <img src={post.image_url} alt={post.title} />
                  ) : (
                    <div className="post-card-image-placeholder">📷</div>
                  )}
                </div>
                <div className="post-card-content">
                  <div className="post-card-header">
                    <div className="post-card-badges">
                      <span className={`status-badge ${post.status}`}>{post.status}</span>
                      {post.is_featured && <span className="featured-badge">⭐ Featured</span>}
                      {post.scheduled_for && new Date(post.scheduled_for) > new Date() && (
                        <span className="scheduled-badge">📅 Scheduled</span>
                      )}
                    </div>
                    <div className="post-card-actions">
                      <button onClick={() => editPost(post)} className="action-edit" title="Edit">
                        ✏️
                      </button>
                      <button onClick={() => duplicatePost(post)} className="action-duplicate" title="Duplicate">
                        📋
                      </button>
                      <button onClick={() => deletePost(post.id, post.title)} className="action-delete" title="Delete">
                        🗑️
                      </button>
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
                    <Link href={`/blog/${post.slug}`} target="_blank" className="post-card-link">
                      View →
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Editor Modal */}
      {showEditor && (
        <div className="modal-overlay" onClick={() => {
          if (confirm('Close editor? Unsaved changes will be lost.')) {
            setShowEditor(false)
            setIsEditing(false)
          }
        }}>
          <div className="modal-content editor" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{formData.id ? 'Edit Post' : 'Create New Post'}</h2>
              <div className="modal-actions">
                <button onClick={() => setShowPreview(true)} className="preview-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  Preview
                </button>
                <button className="close-btn" onClick={() => {
                  if (confirm('Close editor? Unsaved changes will be lost.')) {
                    setShowEditor(false)
                    setIsEditing(false)
                  }
                }}>×</button>
              </div>
            </div>
            
            <div className="editor-container">
              <div className="editor-main">
                <input
                  type="text"
                  placeholder="Post Title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value, slug: generateSlug(e.target.value)})}
                  className="title-input"
                />
                
                <div className="seo-preview">
                  <div className="seo-title">{formData.seo_title || formData.title}</div>
                  <div className="seo-url">trendlin.com/blog/{formData.slug || generateSlug(formData.title)}</div>
                  <div className="seo-desc">{formData.seo_description || formData.excerpt?.substring(0, 160)}</div>
                </div>
                
                <div className="image-section">
                  <label>Featured Image</label>
                  {formData.image_url ? (
                    <div className="image-preview">
                      <img src={formData.image_url} alt="Featured" />
                      <button onClick={() => setFormData({...formData, image_url: ''})}>Remove</button>
                    </div>
                  ) : (
                    <MediaUploader onUploadComplete={(url) => setFormData({...formData, image_url: url})} />
                  )}
                </div>
                
                <div className="content-editor">
                  <label>Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Write your post content in HTML..."
                    rows="20"
                  />
                  <div className="editor-toolbar">
                    <button onClick={() => setFormData({...formData, content: formData.content + '<h2>Heading</h2>'})}>H2</button>
                    <button onClick={() => setFormData({...formData, content: formData.content + '<h3>Subheading</h3>'})}>H3</button>
                    <button onClick={() => setFormData({...formData, content: formData.content + '<p>Paragraph</p>'})}>P</button>
                    <button onClick={() => setFormData({...formData, content: formData.content + '<ul><li>Item</li></ul>'})}>List</button>
                    <button onClick={() => setFormData({...formData, content: formData.content + '<strong>Bold</strong>'})}>B</button>
                    <button onClick={() => setFormData({...formData, content: formData.content + '<em>Italic</em>'})}>I</button>
                  </div>
                </div>
              </div>
              
              <div className="editor-sidebar">
                <div className="sidebar-group">
                  <div className="sidebar-field">
                    <label>Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  
                  <div className="sidebar-field">
                    <label>Schedule for</label>
                    <input
                      type="datetime-local"
                      value={formData.scheduled_for?.slice(0, 16) || ''}
                      onChange={(e) => setFormData({...formData, scheduled_for: e.target.value})}
                    />
                  </div>
                  
                  <div className="sidebar-field checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                      />
                      <span>Feature this post (Editor's Pick)</span>
                    </label>
                  </div>
                </div>
                
                <div className="sidebar-group">
                  <div className="sidebar-field">
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
                  
                  <div className="sidebar-field">
                    <label>Author</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({...formData, author: e.target.value})}
                    />
                  </div>
                  
                  <div className="sidebar-field">
                    <label>Tags (comma separated)</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      placeholder="tech, ai, future"
                    />
                  </div>
                </div>
                
                <div className="sidebar-group">
                  <div className="sidebar-field">
                    <label>Excerpt</label>
                    <textarea
                      rows="3"
                      value={formData.excerpt}
                      onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                      placeholder="Short summary for search engines..."
                    />
                  </div>
                </div>
                
                <div className="sidebar-group">
                  <div className="sidebar-field">
                    <label>SEO Title</label>
                    <input
                      type="text"
                      value={formData.seo_title}
                      onChange={(e) => setFormData({...formData, seo_title: e.target.value})}
                      placeholder="Leave empty to use post title"
                    />
                  </div>
                  
                  <div className="sidebar-field">
                    <label>SEO Description</label>
                    <textarea
                      rows="2"
                      value={formData.seo_description}
                      onChange={(e) => setFormData({...formData, seo_description: e.target.value})}
                      placeholder="Meta description for search engines"
                    />
                  </div>
                </div>
                
                <div className="sidebar-actions">
                  <button onClick={() => savePost()} disabled={saving} className="save-btn">
                    {saving ? 'Saving...' : (formData.id ? 'Update Post' : 'Publish Post')}
                  </button>
                  <button onClick={() => {
                    if (confirm('Close editor? Unsaved changes will be lost.')) {
                      setShowEditor(false)
                      setIsEditing(false)
                    }
                  }} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="modal-content preview" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Preview: {formData.title}</h2>
              <button className="close-btn" onClick={() => setShowPreview(false)}>×</button>
            </div>
            <div className="preview-content">
              {formData.image_url && (
                <img src={formData.image_url} alt={formData.title} className="preview-image" />
              )}
              <h1>{formData.title}</h1>
              <div className="preview-meta">
                <span>By {formData.author}</span>
                <span>{formData.category}</span>
                <span>{new Date().toLocaleDateString()}</span>
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
          padding: 2rem;
        }
        
        :global(body.dark) .posts-manager {
          background: #0f172a;
        }
        
        /* Toast */
        .toast {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.25rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          z-index: 1100;
          animation: slideIn 0.3s ease;
        }
        
        .toast-error {
          border-left: 4px solid #ef4444;
        }
        
        .toast-success {
          border-left: 4px solid #10b981;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        /* Header */
        .manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .header-left h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #0f172a;
        }
        
        :global(body.dark) .header-left h1 {
          color: #f1f5f9;
        }
        
        .subtitle {
          color: #64748b;
          margin-top: 0.25rem;
        }
        
        .create-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.25rem;
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
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        /* Stats Bar */
        .stats-bar {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        
        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: white;
          border-radius: 40px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        :global(body.dark) .stat-item {
          background: #1e293b;
        }
        
        .stat-item:hover {
          transform: translateY(-2px);
        }
        
        .stat-value {
          font-weight: 700;
          font-size: 1.1rem;
        }
        
        .stat-label {
          font-size: 0.8rem;
          color: #64748b;
        }
        
        .stat-item.published .stat-value { color: #10b981; }
        .stat-item.draft .stat-value { color: #f59e0b; }
        .stat-item.scheduled .stat-value { color: #3b82f6; }
        .stat-item.featured .stat-value { color: #8b5cf6; }
        
        /* Filters */
        .filters-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          align-items: center;
        }
        
        .search-wrapper {
          flex: 1;
          position: relative;
          min-width: 250px;
        }
        
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          color: #94a3b8;
        }
        
        .search-input {
          width: 100%;
          padding: 0.6rem 2rem 0.6rem 2.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 40px;
          background: white;
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
        }
        
        .view-toggle {
          display: flex;
          background: white;
          border-radius: 10px;
          padding: 0.25rem;
        }
        
        .view-toggle button {
          padding: 0.4rem 0.8rem;
          background: none;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        
        .view-toggle button.active {
          background: #667eea;
          color: white;
        }
        
        .view-toggle svg {
          width: 18px;
          height: 18px;
        }
        
        .clear-filter {
          padding: 0.6rem 1rem;
          background: #f1f5f9;
          border: none;
          border-radius: 40px;
          cursor: pointer;
        }
        
        /* Bulk Actions */
        .bulk-bar {
          background: #eef2ff;
          border-radius: 12px;
          padding: 0.75rem 1rem;
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .bulk-count {
          font-weight: 600;
          color: #4f46e5;
        }
        
        .bulk-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .bulk-actions button {
          padding: 0.4rem 0.75rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        
        .bulk-publish { background: #10b981; color: white; }
        .bulk-draft { background: #f59e0b; color: white; }
        .bulk-delete { background: #ef4444; color: white; }
        .bulk-cancel { background: #64748b; color: white; }
        
        /* Posts Grid */
        .posts-container.grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 1.5rem;
        }
        
        .posts-container.list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .posts-container.list .post-card {
          display: flex;
          flex-direction: row;
        }
        
        .posts-container.list .post-card-image {
          width: 120px;
          height: 120px;
        }
        
        .post-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
          display: flex;
        }
        
        .post-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.1);
        }
        
        :global(body.dark) .post-card {
          background: #1e293b;
        }
        
        .post-card-select {
          padding: 1rem;
        }
        
        .post-card-image {
          width: 140px;
          flex-shrink: 0;
          background: #f1f5f9;
          overflow: hidden;
        }
        
        .post-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
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
          flex: 1;
          padding: 1rem;
        }
        
        .post-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }
        
        .post-card-badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .status-badge {
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 600;
        }
        
        .status-badge.published { background: #d1fae5; color: #065f46; }
        .status-badge.draft { background: #fef3c7; color: #92400e; }
        
        .featured-badge {
          padding: 0.2rem 0.5rem;
          background: #fef3c7;
          color: #d97706;
          border-radius: 4px;
          font-size: 0.7rem;
        }
        
        .scheduled-badge {
          padding: 0.2rem 0.5rem;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 4px;
          font-size: 0.7rem;
        }
        
        .post-card-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .post-card-actions button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .action-edit:hover { background: #e0e7ff; }
        .action-duplicate:hover { background: #d1fae5; }
        .action-delete:hover { background: #fee2e2; }
        
        .post-card-title {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #0f172a;
        }
        
        :global(body.dark) .post-card-title {
          color: #f1f5f9;
        }
        
        .post-card-excerpt {
          font-size: 0.8rem;
          color: #64748b;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }
        
        .post-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .post-card-meta {
          display: flex;
          gap: 0.75rem;
          font-size: 0.7rem;
          color: #94a3b8;
        }
        
        .post-card-link {
          font-size: 0.75rem;
          color: #667eea;
          text-decoration: none;
        }
        
        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 4rem;
          background: white;
          border-radius: 20px;
        }
        
        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        
        .empty-state h3 {
          margin-bottom: 0.5rem;
        }
        
        .empty-state p {
          color: #64748b;
          margin-bottom: 1.5rem;
        }
        
        .empty-btn {
          padding: 0.6rem 1.25rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        
        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .modal-content {
          background: white;
          border-radius: 20px;
          width: 90%;
          max-height: 90vh;
          overflow: auto;
        }
        
        .modal-content.editor {
          max-width: 1400px;
          width: 95%;
        }
        
        .modal-content.preview {
          max-width: 800px;
        }
        
        :global(body.dark) .modal-content {
          background: #1e293b;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          background: white;
          z-index: 10;
        }
        
        :global(body.dark) .modal-header {
          background: #1e293b;
          border-bottom-color: #334155;
        }
        
        .modal-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .preview-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.8rem;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        
        .preview-btn svg {
          width: 16px;
          height: 16px;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
        }
        
        /* Editor */
        .editor-container {
          display: flex;
          gap: 1.5rem;
          padding: 1.5rem;
        }
        
        .editor-main {
          flex: 2;
        }
        
        .editor-sidebar {
          flex: 1;
        }
        
        .title-input {
          width: 100%;
          padding: 0.75rem;
          font-size: 1.25rem;
          font-weight: 600;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          margin-bottom: 1rem;
        }
        
        .seo-preview {
          background: #f8fafc;
          padding: 0.75rem;
          border-radius: 12px;
          margin-bottom: 1rem;
        }
        
        .seo-title { color: #1a0dab; font-size: 1.1rem; }
        .seo-url { color: #006621; font-size: 0.8rem; }
        .seo-desc { color: #545454; font-size: 0.8rem; }
        
        .image-section {
          margin-bottom: 1rem;
        }
        
        .image-section label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .image-preview {
          position: relative;
          display: inline-block;
        }
        
        .image-preview img {
          max-width: 100%;
          max-height: 150px;
          border-radius: 8px;
        }
        
        .content-editor textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-family: monospace;
          resize: vertical;
        }
        
        .editor-toolbar {
          display: flex;
          gap: 0.25rem;
          margin-top: 0.5rem;
        }
        
        .editor-toolbar button {
          padding: 0.25rem 0.5rem;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          cursor: pointer;
        }
        
        .sidebar-group {
          background: #f8fafc;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1rem;
        }
        
        :global(body.dark) .sidebar-group {
          background: #0f172a;
        }
        
        .sidebar-field {
          margin-bottom: 0.75rem;
        }
        
        .sidebar-field:last-child {
          margin-bottom: 0;
        }
        
        .sidebar-field label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.25rem;
          font-size: 0.8rem;
        }
        
        .sidebar-field input, .sidebar-field select, .sidebar-field textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }
        
        .sidebar-field.checkbox label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        
        .sidebar-field.checkbox input {
          width: auto;
        }
        
        .sidebar-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
        }
        
        .save-btn {
          flex: 1;
          padding: 0.6rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
        }
        
        .cancel-btn {
          flex: 1;
          padding: 0.6rem;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
        }
        
        /* Preview */
        .preview-content {
          padding: 2rem;
        }
        
        .preview-image {
          width: 100%;
          max-height: 300px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 1rem;
        }
        
        .preview-meta {
          display: flex;
          gap: 1rem;
          color: #64748b;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .preview-body {
          line-height: 1.8;
        }
        
        .preview-body img {
          max-width: 100%;
          border-radius: 8px;
        }
        
        @media (max-width: 1024px) {
          .editor-container {
            flex-direction: column;
          }
        }
        
        @media (max-width: 768px) {
          .posts-manager {
            padding: 1rem;
          }
          
          .posts-container.grid {
            grid-template-columns: 1fr;
          }
          
          .post-card {
            flex-direction: column;
          }
          
          .post-card-image {
            width: 100%;
            height: 160px;
          }
          
          .stats-bar {
            justify-content: center;
          }
          
          .filters-bar {
            flex-direction: column;
          }
          
          .bulk-bar {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  )
}