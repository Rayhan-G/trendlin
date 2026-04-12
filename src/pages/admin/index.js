import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('week')
  const [stats, setStats] = useState({
    totalViews: { today: 0, week: 0, month: 0, allTime: 0 },
    draftCount: 0,
    scheduledCount: 0,
    publishedCount: 0,
    featuredCount: 0
  })
  const [topPosts, setTopPosts] = useState([])
  const [dailyViews, setDailyViews] = useState([])
  const [monthlyViews, setMonthlyViews] = useState([])
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    checkAuth()
    fetchDashboardData()
  }, [timeRange])

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

  const fetchDashboardData = async () => {
    setLoading(true)
    
    try {
      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (!posts) {
        setLoading(false)
        return
      }
      
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const weekAgoStr = weekAgo.toISOString().split('T')[0]
      
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      const monthAgoStr = monthAgo.toISOString().split('T')[0]
      
      let todayViews = 0, weekViews = 0, monthViews = 0, allTimeViews = 0
      let publishedCount = 0, draftCount = 0, scheduledCount = 0, featuredCount = 0
      
      posts.forEach(post => {
        const viewCount = post.views || 0
        allTimeViews += viewCount
        const postDate = post.created_at?.split('T')[0]
        
        if (postDate === todayStr) todayViews += viewCount
        if (postDate >= weekAgoStr) weekViews += viewCount
        if (postDate >= monthAgoStr) monthViews += viewCount
        
        if (post.status === 'published') publishedCount++
        else if (post.status === 'draft') draftCount++
        if (post.scheduled_for && new Date(post.scheduled_for) > new Date()) scheduledCount++
        if (post.is_featured) featuredCount++
      })
      
      const top5Posts = [...posts]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5)
        .map(post => ({ id: post.id, title: post.title, slug: post.slug, category: post.category, views: post.views || 0 }))
      
      const last7Days = []
      const dailyViewsData = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        last7Days.push(dateStr.slice(5))
        
        const dayViews = posts.reduce((sum, post) => {
          if (post.created_at?.split('T')[0] === dateStr) return sum + (post.views || 0)
          return sum
        }, 0)
        dailyViewsData.push(dayViews)
      }
      setDailyViews(dailyViewsData)
      
      const months = []
      const monthlyViewsData = []
      for (let i = 11; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthStr = date.toISOString().slice(0, 7)
        months.push(date.toLocaleString('default', { month: 'short' }))
        
        const monthViews = posts.reduce((sum, post) => {
          if (post.created_at?.slice(0, 7) === monthStr) return sum + (post.views || 0)
          return sum
        }, 0)
        monthlyViewsData.push(monthViews)
      }
      setMonthlyViews(monthlyViewsData)
      
      const recent = posts.slice(0, 5).map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        status: post.status || 'draft',
        created_at: post.created_at,
        views: post.views || 0
      }))
      setRecentActivity(recent)
      
      setStats({
        totalViews: { today: todayViews, week: weekViews, month: monthViews, allTime: allTimeViews },
        draftCount, scheduledCount, publishedCount, featuredCount
      })
      setTopPosts(top5Posts)
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_session_token')
    localStorage.removeItem('admin_session_expiry')
    router.push('/')
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { color: '#64748b' } } },
    scales: { y: { beginAtZero: true, grid: { color: '#e2e8f0' } }, x: { grid: { display: false } } }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <style jsx>{`
          .loading-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc; }
          .loading-spinner { width: 48px; height: 48px; border: 3px solid #e2e8f0; border-top-color: #667eea; border-radius: 50%; animation: spin 0.8s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      {/* Header with Navigation */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Dashboard</h1>
          <p>Welcome back, Admin</p>
        </div>
        <div className="header-right">
          <div className="nav-links">
            <Link href="/admin" className="nav-link active">📊 Dashboard</Link>
            <Link href="/admin/posts-manager" className="nav-link">📝 Posts</Link>
            <Link href="/admin/content-calendar" className="nav-link">📅 Calendar</Link>
            <Link href="/admin/affiliate" className="nav-link">🔗 Affiliate</Link>
            <Link href="/admin/revenue" className="nav-link">💰 Revenue</Link>
            <Link href="/admin/post-analytics" className="nav-link">📈 Analytics</Link>
            <Link href="/admin/ads" className="nav-link">🎨 Ads</Link>
          </div>
          <div className="time-range-selector">
            <button className={timeRange === 'week' ? 'active' : ''} onClick={() => setTimeRange('week')}>Week</button>
            <button className={timeRange === 'month' ? 'active' : ''} onClick={() => setTimeRange('month')}>Month</button>
            <button className={timeRange === 'year' ? 'active' : ''} onClick={() => setTimeRange('year')}>Year</button>
          </div>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon">👁️</div><div className="stat-content"><div className="stat-value">{stats.totalViews[timeRange === 'week' ? 'week' : timeRange === 'month' ? 'month' : 'allTime'].toLocaleString()}</div><div className="stat-label">Views ({timeRange === 'week' ? 'Last 7 days' : timeRange === 'month' ? 'Last 30 days' : 'All time'})</div></div></div>
        <div className="stat-card"><div className="stat-icon">📝</div><div className="stat-content"><div className="stat-value">{stats.publishedCount}</div><div className="stat-label">Published Posts</div></div></div>
        <div className="stat-card"><div className="stat-icon">✏️</div><div className="stat-content"><div className="stat-value">{stats.draftCount}</div><div className="stat-label">Drafts</div></div></div>
        <div className="stat-card"><div className="stat-icon">📅</div><div className="stat-content"><div className="stat-value">{stats.scheduledCount}</div><div className="stat-label">Scheduled</div></div></div>
      </div>

      {/* Feature Navigation Cards */}
      <div className="feature-cards">
        <Link href="/admin/posts-manager" className="feature-card"><div className="feature-icon">📝</div><h3>Post Manager</h3><p>Create, edit, schedule posts with rich editor</p></Link>
        <Link href="/admin/content-calendar" className="feature-card"><div className="feature-icon">📅</div><h3>Content Calendar</h3><p>Plan content, track ideas, see publishing schedule</p></Link>
        <Link href="/admin/affiliate" className="feature-card"><div className="feature-icon">🔗</div><h3>Affiliate Manager</h3><p>Manage links, track clicks and revenue</p></Link>
        <Link href="/admin/revenue" className="feature-card"><div className="feature-icon">💰</div><h3>Revenue Tracker</h3><p>Track earnings, set goals, analyze performance</p></Link>
        <Link href="/admin/post-analytics" className="feature-card"><div className="feature-icon">📊</div><h3>Post Analytics</h3><p>Deep dive into post performance metrics</p></Link>
        <Link href="/admin/ads" className="feature-card"><div className="feature-icon">🎨</div><h3>Ad Manager</h3><p>Manage ad slots, A/B test, track revenue</p></Link>
      </div>

      {/* Charts */}
      <div className="charts-row">
        <div className="chart-card"><h3>Daily Views (Last 7 Days)</h3><div className="chart-container"><Line data={{ labels: ['6 days ago', '5 days ago', '4 days ago', '3 days ago', '2 days ago', 'Yesterday', 'Today'], datasets: [{ label: 'Views', data: dailyViews, borderColor: '#667eea', backgroundColor: 'rgba(102,126,234,0.1)', fill: true, tension: 0.4 }] }} options={chartOptions} /></div></div>
        <div className="chart-card"><h3>Monthly Views</h3><div className="chart-container"><Bar data={{ labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], datasets: [{ label: 'Views', data: monthlyViews, backgroundColor: '#10b981', borderRadius: 8 }] }} options={chartOptions} /></div></div>
      </div>

      {/* Top Posts & Recent Activity */}
      <div className="two-columns">
        <div className="top-card"><h3>🏆 Top Performing Posts</h3><div className="top-list">{topPosts.length === 0 ? <div className="empty-message">No posts yet</div> : topPosts.map((post, i) => (<div key={post.id} className="top-item"><div className="top-rank">{i + 1}</div><div className="top-info"><Link href={`/blog/${post.slug}`} target="_blank" className="top-title">{post.title}</Link><div className="top-meta">{post.category || 'Uncategorized'} • {post.views.toLocaleString()} views</div></div><div className="top-stats">{post.views.toLocaleString()}</div></div>))}</div></div>
        <div className="top-card"><h3>📋 Recent Activity</h3><div className="activity-list">{recentActivity.length === 0 ? <div className="empty-message">No recent activity</div> : recentActivity.map(post => (<div key={post.id} className="activity-item"><div className="activity-info"><div className="activity-title">{post.title}</div><div className="activity-meta"><span className={`status-badge ${post.status}`}>{post.status}</span><span>{new Date(post.created_at).toLocaleDateString()}</span><span>{post.views} views</span></div></div><Link href={`/admin/edit/${post.id}`} className="activity-edit">Edit</Link></div>))}</div></div>
      </div>

      <style jsx>{`
        .admin-dashboard { min-height: 100vh; background: #f8fafc; padding: 2rem; }
        :global(body.dark) .admin-dashboard { background: #0f172a; }
        
        .dashboard-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem; }
        .header-left h1 { font-size: 1.75rem; font-weight: 700; color: #0f172a; }
        :global(body.dark) .header-left h1 { color: #f1f5f9; }
        .header-left p { color: #64748b; }
        
        .header-right { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
        .nav-links { display: flex; gap: 0.5rem; background: white; padding: 0.25rem; border-radius: 12px; flex-wrap: wrap; }
        :global(body.dark) .nav-links { background: #1e293b; }
        .nav-link { padding: 0.5rem 1rem; text-decoration: none; color: #475569; border-radius: 8px; transition: all 0.2s; font-size: 0.85rem; }
        .nav-link:hover { background: #f1f5f9; }
        .nav-link.active { background: #667eea; color: white; }
        :global(body.dark) .nav-link { color: #94a3b8; }
        :global(body.dark) .nav-link:hover { background: #334155; }
        
        .time-range-selector { display: flex; background: white; border-radius: 12px; padding: 0.25rem; gap: 0.25rem; }
        :global(body.dark) .time-range-selector { background: #1e293b; }
        .time-range-selector button { padding: 0.5rem 1rem; background: transparent; border: none; border-radius: 8px; cursor: pointer; font-size: 0.85rem; }
        .time-range-selector button.active { background: #667eea; color: white; }
        .logout-btn { padding: 0.5rem 1.25rem; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; }
        
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .stat-card { background: white; border-radius: 20px; padding: 1.5rem; display: flex; gap: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        :global(body.dark) .stat-card { background: #1e293b; }
        .stat-icon { font-size: 2.5rem; }
        .stat-value { font-size: 1.75rem; font-weight: 700; color: #0f172a; }
        :global(body.dark) .stat-value { color: #f1f5f9; }
        .stat-label { font-size: 0.85rem; color: #64748b; }
        
        .feature-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .feature-card { background: white; border-radius: 16px; padding: 1.5rem; text-decoration: none; transition: all 0.2s; text-align: center; }
        .feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.1); }
        :global(body.dark) .feature-card { background: #1e293b; }
        .feature-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .feature-card h3 { font-size: 1.1rem; margin-bottom: 0.5rem; color: #0f172a; }
        :global(body.dark) .feature-card h3 { color: #f1f5f9; }
        .feature-card p { font-size: 0.8rem; color: #64748b; }
        
        .charts-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .chart-card { background: white; border-radius: 20px; padding: 1.5rem; }
        :global(body.dark) .chart-card { background: #1e293b; }
        .chart-card h3 { margin-bottom: 1rem; font-size: 1rem; }
        .chart-container { height: 280px; }
        
        .two-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
        .top-card { background: white; border-radius: 20px; padding: 1.5rem; }
        :global(body.dark) .top-card { background: #1e293b; }
        .top-card h3 { margin-bottom: 1rem; }
        .top-list, .activity-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .top-item, .activity-item { display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: #f8fafc; border-radius: 12px; }
        :global(body.dark) .top-item, :global(body.dark) .activity-item { background: #0f172a; }
        .top-rank { width: 32px; height: 32px; background: #667eea; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; }
        .top-info { flex: 1; }
        .top-title { font-weight: 600; color: #0f172a; text-decoration: none; }
        :global(body.dark) .top-title { color: #f1f5f9; }
        .top-meta { font-size: 0.7rem; color: #64748b; }
        .top-stats { font-size: 0.85rem; font-weight: 600; color: #10b981; }
        .activity-title { font-weight: 500; margin-bottom: 0.25rem; }
        .activity-meta { display: flex; gap: 0.75rem; font-size: 0.7rem; color: #64748b; }
        .status-badge { padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.65rem; font-weight: 600; }
        .status-badge.published { background: #d1fae5; color: #065f46; }
        .status-badge.draft { background: #fef3c7; color: #92400e; }
        .activity-edit { padding: 0.25rem 0.75rem; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-size: 0.75rem; }
        .empty-message { text-align: center; padding: 2rem; color: #64748b; }
        
        @media (max-width: 768px) {
          .admin-dashboard { padding: 1rem; }
          .header-right { flex-direction: column; width: 100%; }
          .nav-links { width: 100%; justify-content: center; flex-wrap: wrap; }
          .charts-row { grid-template-columns: 1fr; }
          .two-columns { grid-template-columns: 1fr; }
          .feature-cards { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}