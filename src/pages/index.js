// src/pages/index.js - UPDATED to use LivePostCarousel
import { useState, useEffect, useCallback } from 'react'
import HeroSection from '../components/frontend/HeroSection'
import HorizontalScroll from '../components/frontend/HorizontalScroll'
import LivePostCarousel from '../components/LivePost/LivePostCarousel'  // Updated import

export default function Home() {
  const [todayPosts, setTodayPosts] = useState([])
  const [popularPosts, setPopularPosts] = useState([])
  const [editorsPicks, setEditorsPicks] = useState([])
  const [livePosts, setLivePosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [visitorId, setVisitorId] = useState(null)

  // Generate visitor ID for anonymous interactions
  useEffect(() => {
    try {
      let vid = localStorage.getItem('visitor_id')
      if (!vid) {
        vid = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('visitor_id', vid)
      }
      setVisitorId(vid)
    } catch (err) {
      setVisitorId(`fallback_${Date.now()}`)
    }
  }, [])

  // Fetch live posts from API
  const fetchLivePosts = useCallback(async () => {
    if (!visitorId) return
    
    try {
      const res = await fetch('/api/live-posts?limit=50')
      const data = await res.json()
      
      if (data.success) {
        setLivePosts(data.posts || [])
      } else {
        console.error('API error:', data.error)
        setLivePosts([])
      }
    } catch (err) {
      console.error('Error fetching live posts:', err)
      setLivePosts([])
    }
  }, [visitorId])

  // Fetch categories and regular posts
  const fetchRegularData = useCallback(async () => {
    try {
      const res = await fetch('/api/posts?limit=100').catch(() => ({ success: false }))
      const data = await res.json().catch(() => ({ success: false, posts: [] }))
      
      const posts = data.success ? (data.posts || []) : []
      
      if (posts.length === 0) {
        setEditorsPicks([])
        setTodayPosts([])
        setPopularPosts([])
        return
      }

      // Editor's picks (featured posts)
      const picks = posts.filter(post => post.is_featured === true).slice(0, 6)
      setEditorsPicks(picks)

      // Today's posts
      const todayStr = new Date().toISOString().split('T')[0]
      const todayFiltered = posts.filter(post => {
        const publishDate = post.created_at?.split('T')[0]
        return publishDate === todayStr
      })
      setTodayPosts(todayFiltered)

      // Most popular this month
      const currentMonthStr = new Date().toISOString().slice(0, 7)
      const popularFiltered = posts
        .filter(post => {
          const publishDate = post.created_at?.split('T')[0] || ''
          return publishDate.startsWith(currentMonthStr)
        })
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 30)
      setPopularPosts(popularFiltered)
      
    } catch (err) {
      console.error('Error fetching regular posts:', err)
      setEditorsPicks([])
      setTodayPosts([])
      setPopularPosts([])
    }
  }, [])

  const handleLivePostVote = useCallback(async (postId, voteType) => {
    try {
      const response = await fetch(`/api/live-posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote: voteType, sessionId: visitorId })
      })
      const data = await response.json()
      
      if (data.success) {
        setLivePosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                votes: data.votes,
                userVote: voteType 
              } 
            : post
        ))
      }
    } catch (err) {
      console.error('Error voting:', err)
    }
  }, [visitorId])

  const handleLivePostShare = useCallback(async (postId, platform) => {
    try {
      await fetch(`/api/live-posts/${postId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform })
      })
      
      setLivePosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, shares: (post.shares || 0) + 1 } 
          : post
      ))
    } catch (err) {
      console.error('Error sharing:', err)
    }
  }, [])

  const handleLivePostView = useCallback(async (postId) => {
    try {
      await fetch(`/api/live-posts/${postId}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: visitorId })
      })
    } catch (err) {
      console.error('Error tracking view:', err)
    }
  }, [visitorId])

  const refreshLivePosts = () => fetchLivePosts()
  
  const handleRefreshAll = async () => {
    setRefreshing(true)
    await Promise.all([fetchRegularData(), fetchLivePosts()])
    setRefreshing(false)
  }

  // Initial load
  useEffect(() => {
    Promise.all([fetchRegularData(), fetchLivePosts()])
      .catch(err => console.error('Initial load error:', err))
      .finally(() => setLoading(false))
  }, [fetchRegularData, fetchLivePosts])

  // Auto-refresh live posts every minute
  useEffect(() => {
    const interval = setInterval(() => {
      if (visitorId) fetchLivePosts()
    }, 60000)
    return () => clearInterval(interval)
  }, [visitorId, fetchLivePosts])

  const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <style jsx>{`
          .loading-container {
            min-height: 60vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .loading-spinner {
            width: 48px;
            height: 48px;
            border: 3px solid #e2e8f0;
            border-top-color: #8b5cf6;
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

  if (error && livePosts.length === 0 && todayPosts.length === 0) {
    return (
      <>
        <HeroSection />
        <div className="error-container">
          <div className="error-card">
            <span className="error-icon">⚠️</span>
            <h2>Something went wrong</h2>
            <p>{error}</p>
            <button onClick={handleRefreshAll} className="retry-btn">Try Again</button>
          </div>
        </div>
        <style jsx>{`
          .error-container {
            display: flex;
            justify-content: center;
            padding: 2rem;
          }
          .error-card {
            text-align: center;
            background: white;
            border-radius: 24px;
            padding: 2rem;
            max-width: 400px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            border: 1px solid #e5e7eb;
          }
          .error-icon { font-size: 48px; display: block; margin-bottom: 16px; }
          .error-card h2 { font-size: 20px; font-weight: 600; margin-bottom: 8px; color: #1e293b; }
          .error-card p { color: #64748b; margin-bottom: 20px; }
          .retry-btn { 
            padding: 10px 24px; 
            background: #8b5cf6;
            color: white; 
            border: none; 
            border-radius: 40px; 
            cursor: pointer; 
            font-weight: 500;
          }
          .retry-btn:hover { background: #7c3aed; }
        `}</style>
      </>
    )
  }

  const hasPosts = livePosts.length > 0 || todayPosts.length > 0 || popularPosts.length > 0 || editorsPicks.length > 0

  if (!hasPosts) {
    return (
      <>
        <HeroSection />
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No posts yet</h3>
          <p>Check back soon for fresh content!</p>
          <button onClick={handleRefreshAll} className="refresh-btn">⟳ Refresh</button>
        </div>
        <style jsx>{`
          .empty-state {
            text-align: center;
            padding: 4rem;
            background: white;
            border-radius: 24px;
            margin: 2rem auto;
            max-width: 500px;
          }
          .empty-icon { font-size: 64px; margin-bottom: 1rem; }
          .empty-state h3 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem; color: #1e293b; }
          .empty-state p { color: #64748b; margin-bottom: 1.5rem; }
          .refresh-btn {
            padding: 0.75rem 1.5rem;
            background: #8b5cf6;
            color: white;
            border: none;
            border-radius: 40px;
            cursor: pointer;
            font-weight: 500;
          }
        `}</style>
      </>
    )
  }

  return (
    <>
      <HeroSection />
      
      <div className="home-container">
        {refreshing && (
          <div className="refresh-indicator">
            <div className="refresh-spinner" />
            <span>Refreshing...</span>
          </div>
        )}

        {/* Live Posts Section - Carousel Format */}
        {livePosts.length > 0 && (
          <div className="live-section">
            {/* LivePostCarousel - Each post shows all 4 parts */}
            <LivePostCarousel 
              posts={livePosts}
              onVote={handleLivePostVote}
              onShare={handleLivePostShare}
              onView={handleLivePostView}
              sessionId={visitorId}
            />
          </div>
        )}

        {/* Regular Posts Sections */}
        {editorsPicks.length > 0 && (
          <HorizontalScroll 
            title="⭐ Editor's Picks" 
            posts={editorsPicks} 
            showRank={false} 
          />
        )}

        {todayPosts.length > 0 && (
          <HorizontalScroll 
            title="📰 Today's Fresh Posts" 
            posts={todayPosts} 
            showRank={false} 
          />
        )}

        {popularPosts.length > 0 && (
          <HorizontalScroll 
            title={`🔥 Most Popular - ${currentMonthName}`} 
            posts={popularPosts} 
            showRank={true} 
          />
        )}

        {/* Quick Stats Footer */}
        <div className="stats-footer">
          <div className="stat-item">
            <span className="stat-emoji">⚡</span>
            <span className="stat-value">{livePosts.length}</span>
            <span className="stat-label">Live Stories</span>
          </div>
          <div className="stat-item">
            <span className="stat-emoji">📝</span>
            <span className="stat-value">{todayPosts.length + editorsPicks.length}</span>
            <span className="stat-label">Today's Posts</span>
          </div>
          <div className="stat-item">
            <span className="stat-emoji">🔥</span>
            <span className="stat-value">{popularPosts.length}</span>
            <span className="stat-label">Trending</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .home-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem 4rem 2rem;
          position: relative;
        }
        
        .refresh-indicator {
          position: fixed;
          top: 80px;
          right: 20px;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          padding: 0.5rem 1rem;
          border-radius: 40px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: white;
          font-size: 0.75rem;
          z-index: 100;
          animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .refresh-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        
        .live-section {
          margin-bottom: 4rem;
        }
        
        .section-header {
          margin-bottom: 2rem;
          text-align: center;
        }
        
        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          background: linear-gradient(135deg, #ef4444, #ec4899);
          border-radius: 40px;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 1px;
          color: white;
          margin-bottom: 1rem;
        }
        
        .refresh-live {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 0.7rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }
        
        .refresh-live:hover {
          transform: rotate(180deg);
          background: rgba(255,255,255,0.3);
        }
        
        .live-dot {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        
        .section-title {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #0f172a, #8b5cf6);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          margin-bottom: 0.5rem;
        }
        
        :global(.dark) .section-title {
          background: linear-gradient(135deg, #f1f5f9, #a78bfa);
          -webkit-background-clip: text;
          background-clip: text;
        }
        
        .section-subtitle {
          color: #64748b;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .live-count {
          padding: 0.25rem 0.75rem;
          background: rgba(139, 92, 246, 0.15);
          border-radius: 40px;
          font-size: 0.7rem;
          font-weight: 500;
          color: #8b5cf6;
        }
        
        .stats-footer {
          display: flex;
          justify-content: center;
          gap: 3rem;
          margin-top: 4rem;
          padding: 2rem;
          background: rgba(0, 0, 0, 0.02);
          border-radius: 2rem;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        :global(.dark) .stats-footer {
          background: rgba(255, 255, 255, 0.02);
          border-color: rgba(255, 255, 255, 0.05);
        }
        
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }
        
        .stat-emoji {
          font-size: 1.5rem;
        }
        
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
        }
        
        :global(.dark) .stat-value {
          color: #f1f5f9;
        }
        
        .stat-label {
          font-size: 0.7rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .home-container {
            padding: 0 1rem 3rem 1rem;
          }
          .section-title {
            font-size: 1.5rem;
          }
          .stats-footer {
            gap: 1rem;
            padding: 1rem;
          }
          .stat-value {
            font-size: 1rem;
          }
          .refresh-indicator {
            top: 70px;
            right: 10px;
            font-size: 0.65rem;
          }
        }
      `}</style>
    </>
  )
}