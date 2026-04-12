import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import Layout from '@/components/Layout'

export default function AdminPosts() {
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    checkAuth()
    fetchPosts()
  }, [])

  const checkAuth = () => {
    const isLoggedIn = localStorage.getItem('admin_logged_in')
    const sessionToken = localStorage.getItem('admin_session_token')
    
    if (!isLoggedIn && !sessionToken) {
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
    // Confirm deletion
    const confirm = window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)
    
    if (!confirm) return
    
    setDeleting(id)
    
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      // Remove from UI
      setPosts(posts.filter(post => post.id !== id))
      alert('Post deleted successfully!')
      
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete post. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container">
        <div className="header">
          <h1>Manage Posts ({posts.length})</h1>
          <button onClick={() => router.push('/admin/create')} className="create-btn">
            + Create New Post
          </button>
        </div>

        {posts.length === 0 ? (
          <div className="empty-state">
            <p>No posts yet. Create your first post!</p>
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
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <a href={`/blog/${post.slug}`} target="_blank" className="post-title">
                        {post.title}
                      </a>
                    </td>
                    <td>
                      <span className="category-badge">{post.category}</span>
                    </td>
                    <td>{post.views || 0}</td>
                    <td>{new Date(post.created_at).toLocaleDateString()}</td>
                    <td className="actions">
                      <button
                        onClick={() => router.push(`/admin/edit/${post.id}`)}
                        className="edit-btn"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deletePost(post.id, post.title)}
                        disabled={deleting === post.id}
                        className="delete-btn"
                        title="Delete"
                      >
                        {deleting === post.id ? '...' : '🗑️'}
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
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .header h1 {
          font-size: 1.5rem;
        }
        
        .create-btn {
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        
        .posts-table {
          background: white;
          border-radius: 12px;
          overflow-x: auto;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
        }
        
        .post-title {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
        }
        
        .post-title:hover {
          text-decoration: underline;
        }
        
        .category-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background: #f1f5f9;
          border-radius: 4px;
          font-size: 0.75rem;
          text-transform: capitalize;
        }
        
        :global(body.dark) .category-badge {
          background: #334155;
          color: #e2e8f0;
        }
        
        .actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .edit-btn, .delete-btn {
          padding: 0.25rem 0.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
        }
        
        .edit-btn {
          background: #3b82f6;
          color: white;
        }
        
        .edit-btn:hover {
          background: #2563eb;
        }
        
        .delete-btn {
          background: #ef4444;
          color: white;
        }
        
        .delete-btn:hover:not(:disabled) {
          background: #dc2626;
        }
        
        .delete-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .empty-state {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 12px;
        }
        
        :global(body.dark) .empty-state {
          background: #1e293b;
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }
          
          th, td {
            padding: 0.75rem;
            font-size: 0.85rem;
          }
          
          .actions {
            flex-direction: column;
          }
        }
      `}</style>
    </Layout>
  )
}