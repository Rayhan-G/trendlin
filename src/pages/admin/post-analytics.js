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
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function PostAnalytics() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const [selectedPost, setSelectedPost] = useState(null)
  const [analytics, setAnalytics] = useState([])
  const [dailyViews, setDailyViews] = useState([])
  const [dateRange, setDateRange] = useState('month')
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  
  // Comparison data
  const [bestPostMonth, setBestPostMonth] = useState(null)
  const [bestPostAllTime, setBestPostAllTime] = useState(null)
  const [worstPostLast30Days, setWorstPostLast30Days] = useState(null)
  const [trendingUp, setTrendingUp] = useState([])
  const [trendingDown, setTrendingDown] = useState([])

  useEffect(() => {
    checkAuth()
    fetchPosts()
    fetchAllAnalytics()
  }, [dateRange])

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
      .select('id, title, slug, category, views, created_at')
      .order('created_at', { ascending: false })
    
    setPosts(data || [])
  }

  const fetchAllAnalytics = async () => {
    setLoading(true)
    
    // Fetch all analytics data
    const { data: analyticsData } = await supabase
      .from('post_analytics')
      .select('*')
      .order('date', { ascending: false })
    
    setAnalytics(analyticsData || [])
    
    // Calculate comparisons
    await calculateComparisons(analyticsData || [])
    
    setLoading(false)
  }

  const fetchPostAnalytics = async (postId) => {
    const { data } = await supabase
      .from('post_analytics')
      .select('*')
      .eq('post_id', postId)
      .order('date', { ascending: true })
    
    const { data: dailyData } = await supabase
      .from('post_daily_views')
      .select('*')
      .eq('post_id', postId)
      .order('date', { ascending: true })
      .limit(30)
    
    setAnalytics(data || [])
    setDailyViews(dailyData || [])
  }

  const calculateComparisons = async (analyticsData) => {
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0]
    
    // Calculate per-post metrics
    const postMetrics = {}
    
    for (const post of posts) {
      const postAnalytics = analyticsData.filter(a => a.post_id === post.id)
      
      const totalViews = postAnalytics.reduce((sum, a) => sum + a.page_views, 0)
      const totalRevenue = postAnalytics.reduce((sum, a) => sum + a.affiliate_revenue + a.ad_revenue, 0)
      const rpm = totalViews > 0 ? (totalRevenue / totalViews) * 1000 : 0
      const avgTimeOnPage = postAnalytics.length > 0 
        ? postAnalytics.reduce((sum, a) => sum + a.avg_time_on_page, 0) / postAnalytics.length 
        : 0
      
      // Current month views
      const monthViews = postAnalytics
        .filter(a => {
          const date = new Date(a.date)
          return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear
        })
        .reduce((sum, a) => sum + a.page_views, 0)
      
      // Last 30 days trend
      const last30DaysViews = postAnalytics
        .filter(a => a.date >= thirtyDaysAgo)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
      
      let trend = 'stable'
      if (last30DaysViews.length >= 7) {
        const firstWeek = last30DaysViews.slice(0, 7).reduce((sum, a) => sum + a.page_views, 0)
        const lastWeek = last30DaysViews.slice(-7).reduce((sum, a) => sum + a.page_views, 0)
        if (lastWeek > firstWeek * 1.1) trend = 'up'
        else if (lastWeek < firstWeek * 0.9) trend = 'down'
      }
      
      postMetrics[post.id] = {
        title: post.title,
        slug: post.slug,
        category: post.category,
        totalViews,
        totalRevenue,
        rpm,
        avgTimeOnPage,
        monthViews,
        trend,
        last30DaysViews: last30DaysViews.reduce((sum, a) => sum + a.page_views, 0)
      }
    }
    
    // Best post this month (by revenue)
    const bestByRevenueMonth = Object.entries(postMetrics)
      .sort((a, b) => b[1].monthViews - a[1].monthViews)
      .slice(0, 1)
      .map(([id, data]) => ({ id, ...data }))[0]
    
    // Best post all time (by total revenue)
    const bestAllTime = Object.entries(postMetrics)
      .sort((a, b) => b[1].totalRevenue - a[1].totalRevenue)
      .slice(0, 1)
      .map(([id, data]) => ({ id, ...data }))[0]
    
    // Worst performing last 30 days (by views, but has at least some traffic)
    const worstLast30Days = Object.entries(postMetrics)
      .filter(([_, data]) => data.last30DaysViews > 0 && data.last30DaysViews < 100)
      .sort((a, b) => a[1].last30DaysViews - b[1].last30DaysViews)
      .slice(0, 5)
      .map(([id, data]) => ({ id, ...data }))
    
    // Trending up and down
    const trendingUpPosts = Object.entries(postMetrics)
      .filter(([_, data]) => data.trend === 'up')
      .slice(0, 5)
      .map(([id, data]) => ({ id, ...data }))
    
    const trendingDownPosts = Object.entries(postMetrics)
      .filter(([_, data]) => data.trend === 'down')
      .slice(0, 5)
      .map(([id, data]) => ({ id, ...data }))
    
    setBestPostMonth(bestByRevenueMonth)
    setBestPostAllTime(bestAllTime)
    setWorstPostLast30Days(worstLast30Days)
    setTrendingUp(trendingUpPosts)
    setTrendingDown(trendingDownPosts)
  }

  const viewPostAnalytics = async (post) => {
    setSelectedPost(post)
    await fetchPostAnalytics(post.id)
  }

  const getPostMetrics = (postId) => {
    const postAnalytics = analytics.filter(a => a.post_id === postId)
    const totalViews = postAnalytics.reduce((sum, a) => sum + a.page_views, 0)
    const totalRevenue = postAnalytics.reduce((sum, a) => sum + a.affiliate_revenue + a.ad_revenue, 0)
    const rpm = totalViews > 0 ? (totalRevenue / totalViews) * 1000 : 0
    const avgTimeOnPage = postAnalytics.length > 0 
      ? Math.round(postAnalytics.reduce((sum, a) => sum + a.avg_time_on_page, 0) / postAnalytics.length)
      : 0
    const bounceRate = postAnalytics.length > 0
      ? (postAnalytics.reduce((sum, a) => sum + a.bounce_count, 0) / postAnalytics.reduce((sum, a) => sum + a.page_views, 1)) * 100
      : 0
    
    return { totalViews, totalRevenue, rpm, avgTimeOnPage, bounceRate }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#64748b' } }
    }
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
    <div className="analytics-page">
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.type === 'error' ? '❌' : '✅'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="page-header">
        <h1>Post Performance Analytics</h1>
        <p>Track engagement, revenue, and trends for each post</p>
      </div>

      {/* Comparison Dashboard */}
      <div className="comparison-dashboard">
        <div className="comparison-card">
          <h3>🏆 Best Post This Month</h3>
          {bestPostMonth ? (
            <>
              <div className="comparison-title">{bestPostMonth.title}</div>
              <div className="comparison-stats">
                <span>📊 {bestPostMonth.monthViews?.toLocaleString()} views</span>
                <span>💰 ${((bestPostMonth.monthViews || 0) * (bestPostMonth.rpm || 5) / 1000).toFixed(2)} est. revenue</span>
              </div>
              <Link href={`/blog/${bestPostMonth.slug}`} target="_blank" className="view-link">View Post →</Link>
            </>
          ) : <div className="empty">No data yet</div>}
        </div>
        
        <div className="comparison-card">
          <h3>👑 Best Post All Time</h3>
          {bestPostAllTime ? (
            <>
              <div className="comparison-title">{bestPostAllTime.title}</div>
              <div className="comparison-stats">
                <span>📊 {bestPostAllTime.totalViews?.toLocaleString()} views</span>
                <span>💰 ${bestPostAllTime.totalRevenue?.toFixed(2)} revenue</span>
                <span>📈 ${bestPostAllTime.rpm?.toFixed(2)} RPM</span>
              </div>
              <Link href={`/blog/${bestPostAllTime.slug}`} target="_blank" className="view-link">View Post →</Link>
            </>
          ) : <div className="empty">No data yet</div>}
        </div>
        
        <div className="comparison-card warning">
          <h3>⚠️ Worst Performing (Last 30 Days)</h3>
          {worstPostLast30Days.length > 0 ? (
            worstPostLast30Days.slice(0, 3).map(post => (
              <div key={post.id} className="worst-item">
                <div className="worst-title">{post.title}</div>
                <div className="worst-stats">{post.last30DaysViews} views • ${(post.last30DaysViews * (post.rpm || 5) / 1000).toFixed(2)} revenue</div>
                <Link href={`/admin/edit/${post.id}`} className="rewrite-link">Rewrite →</Link>
              </div>
            ))
          ) : <div className="empty">No underperforming posts</div>}
        </div>
      </div>

      {/* Trending Section */}
      <div className="trending-section">
        <div className="trending-up">
          <h3>📈 Trending Up (Views Increasing)</h3>
          {trendingUp.length === 0 ? <div className="empty">No trending posts</div> : (
            trendingUp.map(post => (
              <div key={post.id} className="trend-item">
                <span className="trend-name">{post.title}</span>
                <span className="trend-badge up">↑ Rising</span>
                <button onClick={() => viewPostAnalytics({ id: post.id, title: post.title })} className="view-analytics">View Analytics</button>
              </div>
            ))
          )}
        </div>
        <div className="trending-down">
          <h3>📉 Trending Down (Losing Traction)</h3>
          {trendingDown.length === 0 ? <div className="empty">No declining posts</div> : (
            trendingDown.map(post => (
              <div key={post.id} className="trend-item">
                <span className="trend-name">{post.title}</span>
                <span className="trend-badge down">↓ Declining</span>
                <button onClick={() => viewPostAnalytics({ id: post.id, title: post.title })} className="view-analytics">View Analytics</button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Posts List */}
      <div className="posts-list">
        <h3>All Posts Performance</h3>
        <div className="posts-table">
          <table>
            <thead>
              <tr>
                <th>Post</th>
                <th>Category</th>
                <th>Views</th>
                <th>Revenue</th>
                <th>RPM</th>
                <th>Avg Time</th>
                <th>Bounce Rate</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => {
                const metrics = getPostMetrics(post.id)
                return (
                  <tr key={post.id}>
                    <td className="post-title-cell">
                      <Link href={`/blog/${post.slug}`} target="_blank" className="post-title">{post.title}</Link>
                    </td>
                    <td><span className="category-badge">{post.category || 'Uncategorized'}</span></td>
                    <td>{metrics.totalViews.toLocaleString()}</td>
                    <td className="revenue-cell">${metrics.totalRevenue.toFixed(2)}</td>
                    <td>${metrics.rpm.toFixed(2)}</td>
                    <td>{Math.floor(metrics.avgTimeOnPage / 60)}m {metrics.avgTimeOnPage % 60}s</td>
                    <td>{metrics.bounceRate.toFixed(1)}%</td>
                    <td><button onClick={() => viewPostAnalytics(post)} className="details-btn">Details</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedPost.title} - Analytics</h2>
              <button className="close-btn" onClick={() => setSelectedPost(null)}>×</button>
            </div>
            <div className="modal-body">
              {/* Summary Stats */}
              <div className="detail-stats">
                <div className="detail-stat"><span>Total Views</span><strong>{analytics.reduce((sum, a) => sum + a.page_views, 0).toLocaleString()}</strong></div>
                <div className="detail-stat"><span>Total Revenue</span><strong>${analytics.reduce((sum, a) => sum + a.affiliate_revenue + a.ad_revenue, 0).toFixed(2)}</strong></div>
                <div className="detail-stat"><span>Affiliate Clicks</span><strong>{analytics.reduce((sum, a) => sum + a.affiliate_clicks, 0).toLocaleString()}</strong></div>
                <div className="detail-stat"><span>Affiliate Revenue</span><strong>${analytics.reduce((sum, a) => sum + a.affiliate_revenue, 0).toFixed(2)}</strong></div>
                <div className="detail-stat"><span>Ad Revenue</span><strong>${analytics.reduce((sum, a) => sum + a.ad_revenue, 0).toFixed(2)}</strong></div>
                <div className="detail-stat"><span>Social Shares</span><strong>{analytics.reduce((sum, a) => sum + a.social_shares, 0).toLocaleString()}</strong></div>
                <div className="detail-stat"><span>Comments</span><strong>{analytics.reduce((sum, a) => sum + a.comments, 0).toLocaleString()}</strong></div>
                <div className="detail-stat"><span>RPM</span><strong>${(analytics.reduce((sum, a) => sum + a.page_views, 0) > 0 ? (analytics.reduce((sum, a) => sum + a.affiliate_revenue + a.ad_revenue, 0) / analytics.reduce((sum, a) => sum + a.page_views, 0)) * 1000 : 0).toFixed(2)}</strong></div>
              </div>
              
              {/* Daily Views Chart */}
              {dailyViews.length > 0 && (
                <div className="chart-container">
                  <h4>Daily Views (Last 30 Days)</h4>
                  <div style={{ height: '250px' }}>
                    <Line
                      data={{
                        labels: dailyViews.map(d => new Date(d.date).toLocaleDateString()),
                        datasets: [{ label: 'Views', data: dailyViews.map(d => d.views), borderColor: '#667eea', backgroundColor: 'rgba(102,126,234,0.1)', fill: true, tension: 0.4 }]
                      }}
                      options={chartOptions}
                    />
                  </div>
                </div>
              )}
              
              {/* Detailed Data Table */}
              <div className="detail-table">
                <h4>Daily Breakdown</h4>
                <table>
                  <thead><tr><th>Date</th><th>Views</th><th>Unique</th><th>Time on Page</th><th>Bounce Rate</th><th>Aff. Clicks</th><th>Aff. Revenue</th><th>Ad Revenue</th></tr></thead>
                  <tbody>
                    {analytics.slice(0, 30).map(a => (
                      <tr key={a.id}>
                        <td>{new Date(a.date).toLocaleDateString()}</td>
                        <td>{a.page_views.toLocaleString()}</td>
                        <td>{a.unique_visitors.toLocaleString()}</td>
                        <td>{Math.floor(a.avg_time_on_page / 60)}m {a.avg_time_on_page % 60}s</td>
                        <td>{a.page_views > 0 ? ((a.bounce_count / a.page_views) * 100).toFixed(1) : 0}%</td>
                        <td>{a.affiliate_clicks.toLocaleString()}</td>
                        <td>${a.affiliate_revenue.toFixed(2)}</td>
                        <td>${a.ad_revenue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .analytics-page {
          min-height: 100vh;
          background: #f8fafc;
          padding: 2rem;
        }
        
        :global(body.dark) .analytics-page {
          background: #0f172a;
        }
        
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
          z-index: 1100;
        }
        
        .page-header {
          margin-bottom: 2rem;
        }
        
        .page-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #0f172a;
        }
        
        :global(body.dark) .page-header h1 {
          color: #f1f5f9;
        }
        
        .page-header p {
          color: #64748b;
        }
        
        .comparison-dashboard {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .comparison-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
        }
        
        :global(body.dark) .comparison-card {
          background: #1e293b;
        }
        
        .comparison-card.warning {
          border-left: 4px solid #f59e0b;
        }
        
        .comparison-title {
          font-size: 1rem;
          font-weight: 600;
          margin: 0.5rem 0;
        }
        
        .comparison-stats {
          display: flex;
          gap: 1rem;
          font-size: 0.8rem;
          color: #64748b;
          margin-bottom: 0.75rem;
        }
        
        .view-link, .rewrite-link {
          color: #3b82f6;
          text-decoration: none;
          font-size: 0.8rem;
        }
        
        .worst-item {
          padding: 0.5rem 0;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .worst-title {
          font-weight: 500;
        }
        
        .worst-stats {
          font-size: 0.7rem;
          color: #64748b;
        }
        
        .trending-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .trending-up, .trending-down {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
        }
        
        :global(body.dark) .trending-up, :global(body.dark) .trending-down {
          background: #1e293b;
        }
        
        .trend-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .trend-name {
          flex: 1;
        }
        
        .trend-badge {
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
        }
        
        .trend-badge.up {
          background: #d1fae5;
          color: #065f46;
        }
        
        .trend-badge.down {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .view-analytics {
          padding: 0.25rem 0.75rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        
        .posts-list {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
        }
        
        :global(body.dark) .posts-list {
          background: #1e293b;
        }
        
        .posts-list h3 {
          margin-bottom: 1rem;
        }
        
        .posts-table {
          overflow-x: auto;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th, td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        
        th {
          font-weight: 600;
          color: #475569;
        }
        
        .post-title-cell {
          max-width: 250px;
        }
        
        .post-title {
          color: #3b82f6;
          text-decoration: none;
        }
        
        .revenue-cell {
          color: #10b981;
          font-weight: 600;
        }
        
        .category-badge {
          display: inline-block;
          padding: 0.2rem 0.5rem;
          background: #f1f5f9;
          border-radius: 4px;
          font-size: 0.7rem;
          text-transform: capitalize;
        }
        
        .details-btn {
          padding: 0.25rem 0.75rem;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .modal-content {
          background: white;
          border-radius: 20px;
          width: 90%;
          max-width: 900px;
          max-height: 90vh;
          overflow: auto;
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
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
        }
        
        .modal-body {
          padding: 1.5rem;
        }
        
        .detail-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .detail-stat {
          background: #f8fafc;
          padding: 0.75rem;
          border-radius: 8px;
          text-align: center;
        }
        
        .detail-stat span {
          display: block;
          font-size: 0.7rem;
          color: #64748b;
        }
        
        .detail-stat strong {
          font-size: 1.1rem;
        }
        
        .chart-container {
          margin-bottom: 1.5rem;
        }
        
        .detail-table {
          overflow-x: auto;
        }
        
        .empty {
          text-align: center;
          padding: 2rem;
          color: #64748b;
        }
        
        @media (max-width: 768px) {
          .analytics-page {
            padding: 1rem;
          }
          
          .trending-section {
            grid-template-columns: 1fr;
          }
          
          .comparison-dashboard {
            grid-template-columns: 1fr;
          }
          
          .detail-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  )
}