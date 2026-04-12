import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import Layout from '@/components/Layout'
import Link from 'next/link'

export default function AdminPosts() {
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  useEffect(() => {
    checkAuth()
    fetchPosts()
  }, [])

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

  const deletePost = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    
    setDeleting(id)
    
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setPosts(posts.filter(post => post.id !== id))
    } catch (error) {
      alert('Failed to delete post. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  // Filter posts based on search and category
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || post.category === filterCategory
    return matchesSearch && matchesCategory
  })

  // Get unique categories for filter
  const categories = ['all', ...new Set(posts.map(post => post.category).filter(Boolean))]

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
            border-top-color: #667eea;
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
      <div className="posts-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Manage Posts</h1>
            <p className="subtitle">{posts.length} total {posts.length === 1 ? 'post' : 'posts'}</p>
          </div>
          <button onClick={() => router.push('/admin/create')} className="create-btn">
            + New Post
          </button>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>×</button>
            )}
          </div>
          
          <div className="category-filter">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="category-select"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        {searchTerm || filterCategory !== 'all' ? (
          <div className="results-info">
            Showing {filteredPosts.length} of {posts.length} posts
            <button className="clear-filters" onClick={() => {
              setSearchTerm('')
              setFilterCategory('all')
            }}>
              Clear filters
            </button>
          </div>
        ) : null}

        {/* Posts Table */}
        {filteredPosts.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>No posts found</h3>
            <p>{searchTerm ? `No posts matching "${searchTerm}"` : 'Create your first post to get started'}</p>
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="clear-filters-btn">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="posts-table">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Views</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post.id}>
                    <td className="post-title-cell">
                      <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="post-title">
                        {post.title}
                      </a>
                    </td>
                    <td>
                      <span className="category-badge">{post.category}</span>
                    </td>
                    <td className="views-cell">
                      <span className="views-icon">👁️</span> {post.views || 0}
                    </td>
                    <td className="date-cell">
                      {new Date(post.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="actions-cell">
                      <button
                        onClick={() => router.push(`/admin/edit/${post.id}`)}
                        className="edit-btn"
                        title="Edit post"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => deletePost(post.id, post.title)}
                        disabled={deleting === post.id}
                        className="delete-btn"
                        title="Delete post"
                      >
                        {deleting === post.id ? '...' : '🗑️ Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .posts-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .page-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          color: #0f172a;
        }
        
        :global(body.dark) .page-header h1 {
          color: #f1f5f9;
        }
        
        .subtitle {
          color: #64748b;
          font-size: 0.85rem;
        }
        
        .create-btn {
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
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        /* Filters Bar */
        .filters-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        
        .search-box {
          flex: 1;
          position: relative;
          max-width: 300px;
        }
        
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.9rem;
          opacity: 0.6;
        }
        
        .search-input {
          width: 100%;
          padding: 0.6rem 0.75rem 0.6rem 2.25rem;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        
        :global(body.dark) .search-input {
          background: #1e293b;
          border-color: #334155;
          color: white;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .clear-search {
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
        
        .category-select {
          padding: 0.6rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.85rem;
          background: white;
          cursor: pointer;
        }
        
        :global(body.dark) .category-select {
          background: #1e293b;
          border-color: #334155;
          color: white;
        }
        
        .results-info {
          margin-bottom: 1rem;
          font-size: 0.8rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .clear-filters {
          background: none;
          border: none;
          color: #3b82f6;
          cursor: pointer;
          font-size: 0.8rem;
        }
        
        /* Posts Table */
        .posts-table {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }
        
        :global(body.dark) .posts-table {
          background: #1e293b;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th, td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        
        :global(body.dark) th,
        :global(body.dark) td {
          border-bottom-color: #334155;
        }
        
        th {
          font-weight: 600;
          color: #475569;
          font-size: 0.85rem;
        }
        
        .post-title {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        
        .post-title:hover {
          text-decoration: underline;
        }
        
        .category-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background: #f1f5f9;
          border-radius: 6px;
          font-size: 0.7rem;
          text-transform: capitalize;
        }
        
        :global(body.dark) .category-badge {
          background: #334155;
          color: #e2e8f0;
        }
        
        .views-icon {
          font-size: 0.7rem;
          margin-right: 0.25rem;
        }
        
        .actions-cell {
          display: flex;
          gap: 0.5rem;
        }
        
        .edit-btn, .delete-btn {
          padding: 0.35rem 0.75rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .edit-btn {
          background: #3b82f6;
          color: white;
        }
        
        .edit-btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }
        
        .delete-btn {
          background: #ef4444;
          color: white;
        }
        
        .delete-btn:hover:not(:disabled) {
          background: #dc2626;
          transform: translateY(-1px);
        }
        
        .delete-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 4rem;
          background: white;
          border-radius: 16px;
        }
        
        :global(body.dark) .empty-state {
          background: #1e293b;
        }
        
        .empty-icon {
          font-size: 4rem;
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
        }
        
        .clear-filters-btn {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: #f1f5f9;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .posts-container {
            padding: 1rem;
          }
          
          .page-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .create-btn {
            width: 100%;
            text-align: center;
          }
          
          .filters-bar {
            flex-direction: column;
          }
          
          .search-box {
            max-width: 100%;
          }
          
          th, td {
            padding: 0.75rem;
            font-size: 0.8rem;
          }
          
          .actions-cell {
            flex-direction: column;
            gap: 0.25rem;
          }
          
          .views-cell, .date-cell {
            display: none;
          }
          
          .post-title-cell {
            max-width: 180px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      `}</style>
    </Layout>
  )
}