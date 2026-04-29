// src/pages/index.js (FULLY UPGRADED with all live post functionality)
import { useState, useEffect, useCallback } from 'react'
import HeroSection from '../components/frontend/HeroSection'
import HorizontalScroll from '../components/frontend/HorizontalScroll'
import LivePostCarousel from '../components/frontend/LivePostCarousel'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [todayPosts, setTodayPosts] = useState([])
  const [popularPosts, setPopularPosts] = useState([])
  const [editorsPicks, setEditorsPicks] = useState([])
  const [livePosts, setLivePosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [visitorId, setVisitorId] = useState(null)
  const [likedLivePosts, setLikedLivePosts] = useState({})

  // Generate or get visitor ID for anonymous likes
  useEffect(() => {
    let vid = localStorage.getItem('visitor_id')
    if (!vid) {
      vid = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('visitor_id', vid)
    }
    setVisitorId(vid)
  }, [])

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      
      const currentYear = today.getFullYear()
      const currentMonth = today.getMonth() + 1
      const currentMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`

      // Fetch all published posts from main posts table
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (postsError) {
        console.error('Error fetching posts:', postsError)
        setError('Failed to load posts')
        setLoading(false)
        return
      }

      if (!posts || posts.length === 0) {
        setLoading(false)
        return
      }

      // Editor's picks (featured posts)
      const picks = posts.filter(post => post.is_featured === true).slice(0, 6)
      setEditorsPicks(picks)

      // Today's posts
      const todayFiltered = posts.filter(post => {
        const publishDate = post.created_at?.split('T')[0]
        return publishDate === todayStr
      })
      setTodayPosts(todayFiltered)

      // Most popular this month
      const popularFiltered = posts
        .filter(post => {
          const publishDate = post.created_at?.split('T')[0] || ''
          return publishDate.startsWith(currentMonthStr)
        })
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 30)
      setPopularPosts(popularFiltered)
      
    } catch (error) {
      console.error('Error fetching posts:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchLivePosts = useCallback(async () => {
    try {
      // Fetch all active live posts (24-hour posts)
      // Supports both 'active' and 'published' status
      const { data: live, error: liveError } = await supabase
        .from('live_posts')
        .select('*')
        .in('status', ['active', 'published'])
        .gt('expires_at', new Date().toISOString())
        .order('published_at', { ascending: false })

      if (!liveError && live && live.length > 0) {
        // Fetch additional data for each live post (comments count, etc.)
        const postsWithDetails = await Promise.all(live.map(async (post) => {
          // Get comments count
          const { count: commentsCount } = await supabase
            .from('live_post_comments')
            .select('*', { count: 'exact', head: true })
            .eq('live_post_id', post.id)
            .eq('status', 'approved')
          
          // Check if current visitor liked this post
          const hasLiked = post.liked_by?.includes(visitorId) || false
          
          return {
            ...post,
            comments_count: commentsCount || 0,
            user_has_liked: hasLiked
          }
        }))
        
        setLivePosts(postsWithDetails)
        
        // Update liked state
        const likedState = {}
        postsWithDetails.forEach(post => {
          if (post.user_has_liked) {
            likedState[post.id] = true
          }
        })
        setLikedLivePosts(likedState)
      }
    } catch (error) {
      console.error('Error fetching live posts:', error)
    }
  }, [visitorId])

  const handleLivePostLike = useCallback(async (postId) => {
    if (!visitorId) return
    
    // Optimistic update
    setLikedLivePosts(prev => ({ ...prev, [postId]: true }))
    setLivePosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes: (post.likes || 0) + 1, user_has_liked: true }
        : post
    ))
    
    try {
      const response = await fetch(`/api/live-posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: visitorId })
      })
      
      if (!response.ok) {
        // Revert on error
        setLikedLivePosts(prev => ({ ...prev, [postId]: false }))
        setLivePosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes: (post.likes || 1) - 1, user_has_liked: false }
            : post
        ))
      }
    } catch (error) {
      console.error('Like failed:', error)
      // Revert on error
      setLikedLivePosts(prev => ({ ...prev, [postId]: false }))
      setLivePosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: (post.likes || 1) - 1, user_has_liked: false }
          : post
      ))
    }
  }, [visitorId])

  const handleLivePostShare = useCallback(async (postId) => {
    try {
      await fetch(`/api/live-posts/${postId}/share`, { method: 'POST' })
      setLivePosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, shares: (post.shares || 0) + 1 }
          : post
      ))
    } catch (error) {
      console.error('Share tracking failed:', error)
    }
  }, [])

  const refreshLivePosts = useCallback(() => {
    fetchLivePosts()
  }, [fetchLivePosts])

  const handleRefreshAll = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([fetchPosts(), fetchLivePosts()])
    setRefreshing(false)
  }, [fetchPosts, fetchLivePosts])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  useEffect(() => {
    if (visitorId) {
      fetchLivePosts()
    }
  }, [visitorId, fetchLivePosts])

  // Auto-refresh live posts every minute
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLivePosts()
    }, 60000)
    return () => clearInterval(interval)
  }, [fetchLivePosts])

  const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
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

  if (error) {
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
          :global(body.dark) .error-card {
            background: #1e293b;
            border-color: #334155;
          }
          .error-icon { font-size: 48px; display: block; margin-bottom: 16px; }
          .error-card h2 { font-size: 20px; font-weight: 600; margin-bottom: 8px; color: #1e293b; }
          :global(body.dark) .error-card h2 { color: #f1f5f9; }
          .error-card p { color: #64748b; margin-bottom: 20px; }
          .retry-btn { 
            padding: 10px 24px; 
            background: linear-gradient(135deg, #8b5cf6, #6366f1);
            color: white; 
            border: none; 
            border-radius: 40px; 
            cursor: pointer; 
            font-weight: 500;
            transition: transform 0.2s;
          }
          .retry-btn:hover { transform: scale(1.02); }
        `}</style>
      </>
    )
  }

  const hasPosts = todayPosts.length > 0 || popularPosts.length > 0 || editorsPicks.length > 0 || livePosts.length > 0

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
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          }
          :global(body.dark) .empty-state { 
            background: #1e293b;
            border: 1px solid #334155;
          }
          .empty-icon { font-size: 64px; margin-bottom: 1rem; }
          .empty-state h3 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem; color: #1e293b; }
          :global(body.dark) .empty-state h3 { color: #f1f5f9; }
          .empty-state p { color: #64748b; margin-bottom: 1.5rem; }
          .refresh-btn {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #8b5cf6, #6366f1);
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
        {/* Refresh Indicator */}
        {refreshing && (
          <div className="refresh-indicator">
            <div className="refresh-spinner"></div>
            <span>Refreshing content...</span>
          </div>
        )}

        {/* Live Posts Banner - 24H Premium Section */}
        {livePosts.length > 0 && (
          <div className="live-section">
            <div className="section-header">
              <div className="live-badge">
                <span className="live-dot"></span>
                LIVE NOW • 24H POSTS
                <button onClick={refreshLivePosts} className="refresh-live" title="Refresh live posts">
                  ⟳
                </button>
              </div>
              <h2 className="section-title">✨ ÉCLAT — Fresh Daily</h2>
              <p className="section-subtitle">
                One post per category. Expires in 24 hours. 
                <span className="live-count">{livePosts.length} active {livePosts.length === 1 ? 'story' : 'stories'}</span>
              </p>
            </div>
            <LivePostCarousel 
              posts={livePosts}
              autoPlayInterval={5000}
              onLike={handleLivePostLike}
              onShare={handleLivePostShare}
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
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
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
          margin-bottom: 1.5rem;
        }
        
        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
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
          font-size: 1.8rem;
          font-weight: 700;
          background: linear-gradient(135deg, #fff, #a78bfa);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          margin-bottom: 0.5rem;
        }
        
        .section-subtitle {
          color: #64748b;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
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
          background: rgba(255, 255, 255, 0.03);
          border-radius: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
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
            font-size: 1.4rem;
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