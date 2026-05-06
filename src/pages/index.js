// src/pages/index.js - Remove autoPlayInterval
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

  const fetchRegularPosts = useCallback(async () => {
    try {
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false, nullsLast: true })
        .limit(100)

      if (postsError) {
        console.error('Posts table error:', postsError.message)
        return
      }

      if (!posts || posts.length === 0) return

      const picks = posts.filter(post => post.is_featured === true).slice(0, 6)
      setEditorsPicks(picks)

      const todayFiltered = posts.filter(post => {
        const publishDate = post.created_at?.split('T')[0]
        return publishDate === todayStr
      })
      setTodayPosts(todayFiltered)

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
    }
  }, [])

  const fetchLivePosts = useCallback(async () => {
    if (!visitorId) return
    
    try {
      const now = new Date().toISOString()
      const { data: live, error: liveError } = await supabase
        .from('live_posts')
        .select('*')
        .in('status', ['active', 'published'])
        .gt('expires_at', now)
        .order('published_at', { ascending: false })
        .limit(50)

      if (liveError) throw liveError

      if (live && live.length > 0) {
        const postsWithDetails = await Promise.all(live.map(async (post) => {
          const { count: commentsCount } = await supabase
            .from('live_post_comments')
            .select('*', { count: 'exact', head: true })
            .eq('live_post_id', post.id)
            .eq('status', 'approved')
          
          return {
            ...post,
            comments_count: commentsCount || 0,
            user_has_liked: (post.liked_by || []).includes(visitorId),
            content: post.content || post.description || null
          }
        }))
        setLivePosts(postsWithDetails)
      } else {
        setLivePosts([])
      }
    } catch (err) {
      console.error('Error fetching live posts:', err)
    }
  }, [visitorId])

  const handleLivePostLike = useCallback(async (postId, newLikesCount) => {
    setLivePosts(prev => prev.map(post => 
      post.id === postId ? { ...post, likes: newLikesCount, user_has_liked: true } : post
    ))
  }, [])

  const handleLivePostShare = useCallback(async (postId) => {
    setLivePosts(prev => prev.map(post => 
      post.id === postId ? { ...post, shares: (post.shares || 0) + 1 } : post
    ))
  }, [])

  const refreshLivePosts = () => fetchLivePosts()
  const handleRefreshAll = async () => {
    setRefreshing(true)
    await Promise.all([fetchRegularPosts(), fetchLivePosts()])
    setRefreshing(false)
  }

  useEffect(() => {
    Promise.all([fetchRegularPosts(), fetchLivePosts()]).finally(() => setLoading(false))
  }, [fetchRegularPosts, fetchLivePosts])

  useEffect(() => {
    const interval = setInterval(() => visitorId && fetchLivePosts(), 60000)
    return () => clearInterval(interval)
  }, [visitorId, fetchLivePosts])

  const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <style jsx>{`
          .loading-container { min-height: 60vh; display: flex; align-items: center; justify-content: center; }
          .loading-spinner { width: 48px; height: 48px; border: 3px solid #e2e8f0; border-top-color: #8b5cf6; border-radius: 50%; animation: spin 0.8s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
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
          .empty-state { text-align: center; padding: 4rem; background: white; border-radius: 24px; margin: 2rem auto; max-width: 500px; }
          .empty-icon { font-size: 64px; margin-bottom: 1rem; }
          .empty-state h3 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem; color: #1e293b; }
          .empty-state p { color: #64748b; margin-bottom: 1.5rem; }
          .refresh-btn { padding: 0.75rem 1.5rem; background: #8b5cf6; color: white; border: none; border-radius: 40px; cursor: pointer; font-weight: 500; }
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

        {/* Live Posts Section - NO AUTO SCROLL */}
        {livePosts.length > 0 && (
          <div className="live-section">
            <LivePostCarousel 
              posts={livePosts}
              onLike={handleLivePostLike}
              onShare={handleLivePostShare}
              sessionId={visitorId}
            />
          </div>
        )}

        {editorsPicks.length > 0 && (
          <HorizontalScroll title="⭐ Editor's Picks" posts={editorsPicks} showRank={false} />
        )}

        {todayPosts.length > 0 && (
          <HorizontalScroll title="📰 Today's Fresh Posts" posts={todayPosts} showRank={false} />
        )}

        {popularPosts.length > 0 && (
          <HorizontalScroll title={`🔥 Most Popular - ${currentMonthName}`} posts={popularPosts} showRank={true} />
        )}

        <div className="stats-footer">
          <div className="stat-item"><span className="stat-emoji">⚡</span><span className="stat-value">{livePosts.length}</span><span className="stat-label">Live Stories</span></div>
          <div className="stat-item"><span className="stat-emoji">📝</span><span className="stat-value">{todayPosts.length + editorsPicks.length}</span><span className="stat-label">Today's Posts</span></div>
          <div className="stat-item"><span className="stat-emoji">🔥</span><span className="stat-value">{popularPosts.length}</span><span className="stat-label">Trending</span></div>
        </div>
      </div>

      <style jsx>{`
        .home-container { max-width: 1400px; margin: 0 auto; padding: 0 2rem 4rem; position: relative; }
        .refresh-indicator { position: fixed; top: 80px; right: 20px; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); padding: 0.5rem 1rem; border-radius: 40px; display: flex; align-items: center; gap: 0.5rem; color: white; font-size: 0.75rem; z-index: 100; animation: slideIn 0.3s ease; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .refresh-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; }
        .live-section { margin-bottom: 4rem; }
        .stats-footer { display: flex; justify-content: center; gap: 3rem; margin-top: 4rem; padding: 2rem; background: rgba(255,255,255,0.03); border-radius: 2rem; border: 1px solid rgba(255,255,255,0.05); }
        .stat-item { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
        .stat-emoji { font-size: 1.5rem; }
        .stat-value { font-size: 1.5rem; font-weight: 700; color: #f1f5f9; }
        .stat-label { font-size: 0.7rem; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
        @media (max-width: 768px) {
          .home-container { padding: 0 1rem 3rem; }
          .stats-footer { gap: 1rem; padding: 1rem; }
          .stat-value { font-size: 1rem; }
          .refresh-indicator { top: 70px; right: 10px; font-size: 0.65rem; }
        }
      `}</style>
    </>
  )
}