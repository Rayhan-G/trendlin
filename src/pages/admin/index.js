import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/AdminLayout'

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    publishedToday: 0
  })
  const [recentPosts, setRecentPosts] = useState([])

  useEffect(() => {
    checkAuth()
    fetchStats()
  }, [])

  const checkAuth = () => {
    const isLoggedIn = localStorage.getItem('admin_logged_in')
    if (!isLoggedIn) {
      router.push('/admin/login')
    }
  }

  const fetchStats = async () => {
    const { data: posts } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (posts) {
      const today = new Date().toISOString().split('T')[0]
      const publishedToday = posts.filter(p => 
        p.created_at?.split('T')[0] === today
      ).length

      setStats({
        totalPosts: posts.length,
        totalViews: posts.reduce((sum, p) => sum + (p.views || 0), 0),
        publishedToday
      })
      setRecentPosts(posts.slice(0, 5))
    }
  }

  const statCards = [
    { label: 'Total Posts', value: stats.totalPosts, icon: '📝', color: '#3b82f6' },
    { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: '👁️', color: '#10b981' },
    { label: 'Published Today', value: stats.publishedToday, icon: '✨', color: '#8b5cf6' },
  ]

  return (
    <AdminLayout title="Dashboard">
      <div className="dashboard">
        {/* Stats Cards */}
        <div className="stats-grid">
          {statCards.map((card, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: card.color + '20', color: card.color }}>
                {card.icon}
              </div>
              <div className="stat-info">
                <div className="stat-value">{card.value}</div>
                <div className="stat-label">{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Posts */}
        <div className="recent-section">
          <h3>Recent Posts</h3>
          <div className="posts-table">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Views</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentPosts.map(post => (
                  <tr key={post.id}>
                    <td>{post.title}</td>
                    <td><span className="category-badge">{post.category}</span></td>
                    <td>{post.views || 0}</td>
                    <td>{new Date(post.created_at).toLocaleDateString()}</td>
                    <td>
                      <a href={`/blog/${post.slug}`} target="_blank" className="view-link">View →</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        :global(body.dark) .stat-card {
          background: #1e293b;
        }
        
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }
        
        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1e293b;
        }
        
        :global(body.dark) .stat-value {
          color: #f1f5f9;
        }
        
        .stat-label {
          font-size: 0.85rem;
          color: #64748b;
        }
        
        .recent-section h3 {
          font-size: 1.25rem;
          margin-bottom: 1rem;
        }
        
        .posts-table {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
        
        .category-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background: #f1f5f9;
          border-radius: 4px;
          font-size: 0.75rem;
          text-transform: capitalize;
        }
        
        .view-link {
          color: #3b82f6;
          text-decoration: none;
          font-size: 0.85rem;
        }
        
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          table, thead, tbody, th, td, tr {
            display: block;
          }
          
          thead {
            display: none;
          }
          
          tr {
            margin-bottom: 1rem;
            padding: 1rem;
            border-bottom: 1px solid #e2e8f0;
          }
          
          td {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border: none;
          }
          
          td::before {
            content: attr(data-label);
            font-weight: 600;
          }
        }
      `}</style>
    </AdminLayout>
  )
}