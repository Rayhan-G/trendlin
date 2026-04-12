import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import Layout from '@/components/Layout'

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({ totalPosts: 0, totalViews: 0 })
  const [recentPosts, setRecentPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [])

  const checkAuth = () => {
    const isLoggedIn = localStorage.getItem('admin_logged_in')
    if (!isLoggedIn) {
      router.push('/')
    }
  }

  const fetchData = async () => {
    const { data: posts } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (posts) {
      setStats({
        totalPosts: posts.length,
        totalViews: posts.reduce((sum, p) => sum + (p.views || 0), 0)
      })
      setRecentPosts(posts.slice(0, 5))
    }
    setLoading(false)
  }

  const deletePost = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    
    setDeleting(id)
    
    const { error } = await supabase.from('posts').delete().eq('id', id)
    
    if (!error) {
      await fetchData()
      alert('Post deleted!')
    } else {
      alert('Delete failed')
    }
    
    setDeleting(null)
  }

  if (loading) return <Layout><div style={{ padding: '2rem' }}>Loading...</div></Layout>

  return (
    <Layout>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        <h1>Admin Dashboard</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
          <div style={{ padding: '1.5rem', background: '#f1f5f9', borderRadius: '12px' }}>
            <h2 style={{ fontSize: '2rem', margin: 0 }}>{stats.totalPosts}</h2>
            <p>Total Posts</p>
          </div>
          <div style={{ padding: '1.5rem', background: '#f1f5f9', borderRadius: '12px' }}>
            <h2 style={{ fontSize: '2rem', margin: 0 }}>{stats.totalViews.toLocaleString()}</h2>
            <p>Total Views</p>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h3>Recent Posts</h3>
          <div style={{ marginTop: '1rem' }}>
            {recentPosts.map(post => (
              <div key={post.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '1rem',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <div>
                  <a href={`/blog/${post.slug}`} target="_blank" style={{ fontWeight: '500' }}>
                    {post.title}
                  </a>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {post.category} • {post.views || 0} views
                  </div>
                </div>
                <button
                  onClick={() => deletePost(post.id, post.title)}
                  disabled={deleting === post.id}
                  style={{
                    padding: '0.25rem 0.75rem',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {deleting === post.id ? '...' : 'Delete'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}