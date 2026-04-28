// src/pages/admin/live-posts.js
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { 
  Plus, Edit, Trash2, Eye, Clock, Heart, MessageCircle, Share2, 
  X, Check, AlertCircle, RefreshCw, Image, Video, Play, Send
} from 'lucide-react'

export default function AdminLivePosts() {
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [formData, setFormData] = useState({
    category: 'tech',
    title: '',
    description: '',
    overlay_headline: '',
    media_items: [{ type: 'image', url: '' }]
  })
  const [wordCount, setWordCount] = useState(0)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  // Categories list
  const categories = [
    { id: 'tech', name: 'Technology', icon: '⚡', color: '#3b82f6' },
    { id: 'health', name: 'Wellness', icon: '🌿', color: '#10b981' },
    { id: 'entertainment', name: 'Culture', icon: '🎭', color: '#ec4899' },
    { id: 'wealth', name: 'Capital', icon: '💰', color: '#f59e0b' },
    { id: 'world', name: 'Horizons', icon: '🌍', color: '#06b6d4' },
    { id: 'lifestyle', name: 'Aesthetic', icon: '✨', color: '#f97316' },
    { id: 'growth', name: 'Evolution', icon: '🌱', color: '#8b5cf6' }
  ]

  // Fetch all live posts
  const fetchPosts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('live_posts')
      .select('*, comments:live_post_comments(count)')
      .order('created_at', { ascending: false })

    if (!error) {
      setPosts(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  // Count words in description
  const countWords = (text) => {
    if (!text) return 0
    return text.trim().split(/\s+/).filter(w => w.length > 0).length
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'description') {
      setWordCount(countWords(value))
    }
  }

  // Handle media changes
  const handleMediaChange = (index, field, value) => {
    const newMedia = [...formData.media_items]
    newMedia[index][field] = value
    setFormData(prev => ({ ...prev, media_items: newMedia }))
  }

  const addMediaItem = () => {
    setFormData(prev => ({
      ...prev,
      media_items: [...prev.media_items, { type: 'image', url: '' }]
    }))
  }

  const removeMediaItem = (index) => {
    if (formData.media_items.length === 1) return
    setFormData(prev => ({
      ...prev,
      media_items: prev.media_items.filter((_, i) => i !== index)
    }))
  }

  // Create or Update Post
  const savePost = async () => {
    // Validation
    if (!formData.title.trim()) {
      alert('Please enter a title')
      return
    }
    if (wordCount < 50 || wordCount > 60) {
      alert(`Description must be 50-60 words (currently ${wordCount} words)`)
      return
    }
    const validMedia = formData.media_items.filter(m => m.url.trim())
    if (validMedia.length === 0) {
      alert('Please add at least one image or video')
      return
    }

    setSaving(true)

    const now = new Date()
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const postData = {
      category: formData.category,
      title: formData.title.trim(),
      description: formData.description.trim(),
      overlay_headline: formData.overlay_headline.trim() || null,
      media_items: validMedia,
      expires_at: expiresAt.toISOString(),
      updated_at: now.toISOString()
    }

    let result
    if (editingPost) {
      // Update existing post
      result = await supabase
        .from('live_posts')
        .update(postData)
        .eq('id', editingPost.id)
    } else {
      // Create new post
      postData.published_at = now.toISOString()
      postData.status = 'active'
      postData.likes = 0
      postData.shares = 0
      postData.liked_by = []
      
      result = await supabase
        .from('live_posts')
        .insert([postData])
    }

    if (!result.error) {
      alert(editingPost ? 'Post updated successfully!' : 'Post created successfully!')
      setShowCreateModal(false)
      setEditingPost(null)
      setFormData({
        category: 'tech',
        title: '',
        description: '',
        overlay_headline: '',
        media_items: [{ type: 'image', url: '' }]
      })
      setWordCount(0)
      fetchPosts()
    } else {
      alert('Error: ' + result.error.message)
    }
    setSaving(false)
  }

  // Delete post
  const deletePost = async (id) => {
    setDeletingId(id)
    const { error } = await supabase
      .from('live_posts')
      .delete()
      .eq('id', id)

    if (!error) {
      fetchPosts()
      setShowDeleteConfirm(null)
    } else {
      alert('Error deleting post: ' + error.message)
    }
    setDeletingId(null)
  }

  // Force expire a post
  const forceExpire = async (id) => {
    const { error } = await supabase
      .from('live_posts')
      .update({ 
        status: 'expired',
        expires_at: new Date().toISOString()
      })
      .eq('id', id)

    if (!error) {
      fetchPosts()
      alert('Post expired successfully')
    }
  }

  // Format time remaining
  const getTimeRemaining = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date()
    if (diff <= 0) return 'Expired'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (3600000)) / 60000)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  // Edit post
  const editPost = (post) => {
    setEditingPost(post)
    setFormData({
      category: post.category,
      title: post.title,
      description: post.description,
      overlay_headline: post.overlay_headline || '',
      media_items: post.media_items || [{ type: 'image', url: '' }]
    })
    setWordCount(countWords(post.description))
    setShowCreateModal(true)
  }

  const isActive = (post) => {
    return post.status === 'active' && new Date(post.expires_at) > new Date()
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard | Live Posts Manager</title>
      </Head>

      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <div>
            <h1>Live Posts Manager</h1>
            <p>Create and manage 24-hour posts. One post per category.</p>
          </div>
          <button className="create-btn" onClick={() => {
            setEditingPost(null)
            setFormData({
              category: 'tech',
              title: '',
              description: '',
              overlay_headline: '',
              media_items: [{ type: 'image', url: '' }]
            })
            setWordCount(0)
            setShowCreateModal(true)
          }}>
            <Plus size={18} />
            New Live Post
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple">⚡</div>
            <div className="stat-info">
              <div className="stat-value">{posts.filter(p => isActive(p)).length}</div>
              <div className="stat-label">Active Posts</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue">📝</div>
            <div className="stat-info">
              <div className="stat-value">{posts.length}</div>
              <div className="stat-label">Total Posts</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">❤️</div>
            <div className="stat-info">
              <div className="stat-value">{posts.reduce((sum, p) => sum + (p.likes || 0), 0)}</div>
              <div className="stat-label">Total Likes</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange">💬</div>
            <div className="stat-info">
              <div className="stat-value">{posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0)}</div>
              <div className="stat-label">Total Comments</div>
            </div>
          </div>
        </div>

        {/* Posts Table */}
        <div className="posts-table-container">
          {loading ? (
            <div className="loading-state">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <h3>No live posts yet</h3>
              <p>Create your first 24-hour post to get started</p>
              <button className="create-btn" onClick={() => setShowCreateModal(true)}>
                <Plus size={18} />
                Create Post
              </button>
            </div>
          ) : (
            <table className="posts-table">
              <thead>
                <tr>
                  <th>Post</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Engagement</th>
                  <th>Time Left</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => {
                  const active = isActive(post)
                  const timeLeft = getTimeRemaining(post.expires_at)
                  const category = categories.find(c => c.id === post.category)
                  const isUrgent = active && new Date(post.expires_at) - new Date() < 3600000
                  
                  return (
                    <tr key={post.id} className={!active ? 'expired-row' : ''}>
                      <td className="post-cell">
                        <div className="post-preview">
                          {post.media_items?.[0] && (
                            <img src={post.media_items[0].url} alt="" className="post-thumb" />
                          )}
                          <div className="post-info">
                            <div className="post-title">{post.title}</div>
                            <div className="post-description-preview">
                              {post.description?.substring(0, 60)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-badge" style={{ background: `${category?.color}20`, color: category?.color }}>
                          {category?.icon} {category?.name}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${active ? 'active' : 'expired'}`}>
                          {active ? '● Active' : '○ Expired'}
                        </span>
                      </td>
                      <td>
                        <div className="engagement-stats">
                          <span><Heart size={12} /> {post.likes || 0}</span>
                          <span><MessageCircle size={12} /> {post.comments?.length || 0}</span>
                          <span><Share2 size={12} /> {post.shares || 0}</span>
                        </div>
                      </td>
                      <td>
                        <div className={`time-cell ${isUrgent ? 'urgent' : ''}`}>
                          <Clock size={12} />
                          <span>{active ? timeLeft : '—'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn view"
                            onClick={() => window.open(`/live-posts/${post.category}`, '_blank')}
                            title="View Post"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            className="action-btn edit"
                            onClick={() => editPost(post)}
                            title="Edit Post"
                          >
                            <Edit size={16} />
                          </button>
                          {active && (
                            <button 
                              className="action-btn expire"
                              onClick={() => forceExpire(post.id)}
                              title="Force Expire"
                            >
                              <Clock size={16} />
                            </button>
                          )}
                          <button 
                            className="action-btn delete"
                            onClick={() => setShowDeleteConfirm(post.id)}
                            title="Delete Post"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPost ? 'Edit Live Post' : 'Create New Live Post'}</h2>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Category */}
              <div className="form-group">
                <label>Category <span className="required">*</span></label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
                <p className="hint">Only one active post allowed per category</p>
              </div>

              {/* Title */}
              <div className="form-group">
                <label>Title <span className="required">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter post title..."
                  className="form-input"
                  maxLength="100"
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label>Description <span className="required">*</span> (50-60 words)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Write your post description (50-60 words)..."
                  rows="6"
                  className="form-textarea"
                />
                <div className={`word-counter ${wordCount < 50 || wordCount > 60 ? 'warning' : ''}`}>
                  {wordCount} / 50-60 words
                </div>
              </div>

              {/* Overlay Headline */}
              <div className="form-group">
                <label>Overlay Headline (Optional)</label>
                <input
                  type="text"
                  name="overlay_headline"
                  value={formData.overlay_headline}
                  onChange={handleInputChange}
                  placeholder="Text that appears over media..."
                  className="form-input"
                />
              </div>

              {/* Media Items */}
              <div className="form-group">
                <label>Media Items <span className="required">*</span></label>
                <div className="media-list">
                  {formData.media_items.map((item, idx) => (
                    <div key={idx} className="media-item">
                      <select
                        value={item.type}
                        onChange={(e) => handleMediaChange(idx, 'type', e.target.value)}
                        className="media-type-select"
                      >
                        <option value="image">🖼️ Image</option>
                        <option value="video">🎬 Video</option>
                      </select>
                      <input
                        type="text"
                        value={item.url}
                        onChange={(e) => handleMediaChange(idx, 'url', e.target.value)}
                        placeholder="Enter media URL..."
                        className="media-url-input"
                      />
                      {formData.media_items.length > 1 && (
                        <button
                          type="button"
                          className="remove-media-btn"
                          onClick={() => removeMediaItem(idx)}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" className="add-media-btn" onClick={addMediaItem}>
                  <Plus size={16} />
                  Add Another Media
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className="save-btn" onClick={savePost} disabled={saving}>
                {saving ? 'Saving...' : (editingPost ? 'Update Post' : 'Publish (24h)')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">⚠️</div>
            <h3>Delete Post?</h3>
            <p>This action cannot be undone. The post will be permanently removed.</p>
            <div className="confirm-actions">
              <button className="cancel-btn" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </button>
              <button 
                className="delete-btn" 
                onClick={() => deletePost(showDeleteConfirm)}
                disabled={deletingId === showDeleteConfirm}
              >
                {deletingId === showDeleteConfirm ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          min-height: 100vh;
          background: #050505;
        }
        
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .admin-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.25rem;
        }
        
        .admin-header p {
          color: #64748b;
        }
        
        .create-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          border: none;
          border-radius: 40px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .create-btn:hover {
          transform: translateY(-2px);
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background: #0f0f0f;
          border: 1px solid #1e293b;
          border-radius: 20px;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }
        
        .stat-icon.purple { background: rgba(139,92,246,0.2); }
        .stat-icon.blue { background: rgba(59,130,246,0.2); }
        .stat-icon.green { background: rgba(34,197,94,0.2); }
        .stat-icon.orange { background: rgba(245,158,11,0.2); }
        
        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: white;
        }
        
        .stat-label {
          font-size: 0.75rem;
          color: #64748b;
        }
        
        .posts-table-container {
          background: #0f0f0f;
          border: 1px solid #1e293b;
          border-radius: 20px;
          overflow-x: auto;
        }
        
        .posts-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .posts-table th {
          text-align: left;
          padding: 1rem;
          color: #64748b;
          font-weight: 500;
          border-bottom: 1px solid #1e293b;
        }
        
        .posts-table td {
          padding: 1rem;
          border-bottom: 1px solid #1e293b;
        }
        
        .expired-row {
          opacity: 0.6;
        }
        
        .post-cell {
          min-width: 300px;
        }
        
        .post-preview {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }
        
        .post-thumb {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          object-fit: cover;
        }
        
        .post-title {
          font-weight: 600;
          color: white;
          margin-bottom: 0.25rem;
        }
        
        .post-description-preview {
          font-size: 0.75rem;
          color: #64748b;
        }
        
        .category-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .status-badge.active {
          background: rgba(34,197,94,0.2);
          color: #22c55e;
        }
        
        .status-badge.expired {
          background: rgba(100,116,139,0.2);
          color: #64748b;
        }
        
        .engagement-stats {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
          color: #64748b;
        }
        
        .engagement-stats span {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        
        .time-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: monospace;
          font-size: 0.875rem;
          color: #fbbf24;
        }
        
        .time-cell.urgent {
          color: #ef4444;
          animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }
        
        .action-btn {
          padding: 0.5rem;
          background: rgba(255,255,255,0.05);
          border: none;
          border-radius: 8px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .action-btn:hover {
          background: rgba(255,255,255,0.1);
        }
        
        .action-btn.view:hover { color: #3b82f6; }
        .action-btn.edit:hover { color: #f59e0b; }
        .action-btn.expire:hover { color: #fbbf24; }
        .action-btn.delete:hover { color: #ef4444; }
        
        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.9);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal-content {
          background: #0f0f0f;
          border: 1px solid #1e293b;
          border-radius: 24px;
          width: 90%;
          max-width: 700px;
          max-height: 85vh;
          overflow-y: auto;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #1e293b;
        }
        
        .modal-header h2 {
          color: white;
          font-size: 1.5rem;
        }
        
        .close-btn {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
        }
        
        .modal-body {
          padding: 1.5rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-group label {
          display: block;
          color: #e2e8f0;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        
        .required {
          color: #ef4444;
        }
        
        .form-input, .form-select, .form-textarea {
          width: 100%;
          padding: 0.75rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid #1e293b;
          border-radius: 12px;
          color: white;
          font-size: 0.875rem;
        }
        
        .form-textarea {
          resize: vertical;
        }
        
        .word-counter {
          text-align: right;
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 0.5rem;
        }
        
        .word-counter.warning {
          color: #ef4444;
        }
        
        .hint {
          font-size: 0.7rem;
          color: #64748b;
          margin-top: 0.25rem;
        }
        
        .media-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .media-item {
          display: flex;
          gap: 0.5rem;
        }
        
        .media-type-select {
          width: 100px;
          padding: 0.75rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid #1e293b;
          border-radius: 12px;
          color: white;
        }
        
        .media-url-input {
          flex: 1;
          padding: 0.75rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid #1e293b;
          border-radius: 12px;
          color: white;
        }
        
        .remove-media-btn {
          padding: 0 0.75rem;
          background: rgba(239,68,68,0.2);
          border: none;
          border-radius: 12px;
          color: #ef4444;
          cursor: pointer;
        }
        
        .add-media-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem;
          background: rgba(139,92,246,0.1);
          border: 1px dashed #8b5cf6;
          border-radius: 12px;
          color: #a78bfa;
          cursor: pointer;
        }
        
        .modal-footer {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid #1e293b;
        }
        
        .cancel-btn, .save-btn, .delete-btn {
          flex: 1;
          padding: 0.75rem;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
        }
        
        .cancel-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid #1e293b;
          color: #64748b;
        }
        
        .save-btn {
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          border: none;
          color: white;
        }
        
        .delete-btn {
          background: #ef4444;
          border: none;
          color: white;
        }
        
        .confirm-modal {
          background: #0f0f0f;
          border: 1px solid #1e293b;
          border-radius: 24px;
          padding: 2rem;
          text-align: center;
          max-width: 400px;
        }
        
        .confirm-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        
        .confirm-modal h3 {
          color: white;
          margin-bottom: 0.5rem;
        }
        
        .confirm-modal p {
          color: #64748b;
          margin-bottom: 1.5rem;
        }
        
        .confirm-actions {
          display: flex;
          gap: 1rem;
        }
        
        .empty-state {
          text-align: center;
          padding: 4rem;
        }
        
        .empty-icon {
          font-size: 4rem;
          display: block;
          margin-bottom: 1rem;
        }
        
        .empty-state h3 {
          color: white;
          margin-bottom: 0.5rem;
        }
        
        .empty-state p {
          color: #64748b;
          margin-bottom: 1.5rem;
        }
        
        .loading-state {
          text-align: center;
          padding: 4rem;
          color: #64748b;
        }
        
        @media (max-width: 768px) {
          .admin-container {
            padding: 1rem;
          }
          .admin-header h1 {
            font-size: 1.5rem;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .posts-table {
            font-size: 0.75rem;
          }
          .post-cell {
            min-width: 250px;
          }
        }
      `}</style>
    </>
  )
}