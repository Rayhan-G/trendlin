import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/AdminLayout'
import Link from 'next/link'

export default function AdminPosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('admin_logged_in')
    if (!isLoggedIn) {
      router.push('/admin/login')
      return
    }
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    
    setPosts(data || [])
    setLoading(false)
  }

  const deletePost = async (id) => {
    if (confirm('Delete this post permanently?')) {
      await supabase.from('posts').delete().eq('id', id)
      await fetchPosts()
    }
  }

  if (loading) return <AdminLayout title="Posts"><div>Loading...</div></AdminLayout>

  return (
    <AdminLayout title="All Posts">
      <div className="posts-page">
        <div className="page-header">
          <h1>All Posts</h1>
          <Link href="/admin/create" className="new-post-btn">
            + New Post
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📝</span>
            <h3>No posts yet</h3>
            <p>Create your first blog post</p>
            <Link href="/admin/create" className="create-first-btn">Create Post</Link>
          </div>
        ) : (
          <div className="posts-grid">
            {posts.map(post => (
              <div key={post.id} className="post-card">
                {post.image_url && (
                  <div className="post-image">
                    <img src={post.image_url} alt={post.title} />
                  </div>
                )}
                <div className="post-content">
                  <div className="post-category">{post.category}</div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt?.substring(0, 100)}...</p>
                  <div className="post-meta">
                    <span>📅 {new Date(post.created_at).toLocaleDateString()}</span>
                    <span>👁️ {post.views || 0}</span>
                  </div>
                  <div className="post-actions">
                    <a href={`/blog/${post.slug}`} target="_blank" className="action-view">View</a>
                    <button onClick={() => deletePost(post.id)} className="action-delete">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .posts-page {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .page-header h1 {
          font-size: 1.5rem;
          font-weight: 700;
        }
        
        .new-post-btn {
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-size: 0.85rem;
        }
        
        .posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        
        .post-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }
        
        .post-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        :global(body.dark) .post-card {
          background: #1e293b;
        }
        
        .post-image {
          height: 180px;
          overflow: hidden;
        }
        
        .post-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .post-content {
          padding: 1rem;
        }
        
        .post-category {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background: #f1f5f9;
          border-radius: 4px;
          font-size: 0.7rem;
          text-transform: capitalize;
          margin-bottom: 0.5rem;
        }
        
        .post-content h3 {
          font-size: 1rem;
          margin-bottom: 0.5rem;
        }
        
        .post-content p {
          font-size: 0.85rem;
          color: #64748b;
          margin-bottom: 0.5rem;
        }
        
        .post-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
          color: #64748b;
          margin-bottom: 1rem;
        }
        
        .post-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .action-view {
          padding: 0.25rem 0.75rem;
          background: #3b82f6;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-size: 0.75rem;
        }
        
        .action-delete {
          padding: 0.25rem 0.75rem;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.75rem;
        }
        
        .empty-state {
          text-align: center;
          padding: 4rem;
          background: white;
          border-radius: 12px;
        }
        
        .empty-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 1rem;
        }
        
        .empty-state h3 {
          margin-bottom: 0.5rem;
        }
        
        .create-first-btn {
          display: inline-block;
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: #10b981;
          color: white;
          text-decoration: none;
          border-radius: 8px;
        }
        
        @media (max-width: 768px) {
          .posts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AdminLayout>
  )
}