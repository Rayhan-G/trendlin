// src/pages/index.js (UPDATED with Live Posts)
import { useState, useEffect } from 'react'
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

  useEffect(() => {
    fetchPosts()
    fetchLivePosts()
  }, [])

  const fetchPosts = async () => {
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
  }

  const fetchLivePosts = async () => {
    try {
      // Fetch all active live posts (24-hour posts)
      const { data: live, error: liveError } = await supabase
        .from('live_posts')
        .select('*')
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('published_at', { ascending: false })

      if (!liveError && live && live.length > 0) {
        setLivePosts(live)
      }
    } catch (error) {
      console.error('Error fetching live posts:', error)
    }
  }

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
            <button onClick={fetchPosts} className="retry-btn">Try Again</button>
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
          .retry-btn { padding: 10px 24px; background: #667eea; color: white; border: none; border-radius: 40px; cursor: pointer; font-weight: 500; }
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
          <p>No posts yet. Check back soon!</p>
        </div>
        <style jsx>{`
          .empty-state {
            text-align: center;
            padding: 4rem;
            background: white;
            border-radius: 16px;
            margin: 2rem auto;
            max-width: 600px;
          }
          :global(body.dark) .empty-state { background: #1e293b; }
          .empty-state p { color: #64748b; }
        `}</style>
      </>
    )
  }

  return (
    <>
      <HeroSection />
      
      <div className="home-container">
        {/* Live Posts Banner - 24H Premium Section */}
        {livePosts.length > 0 && (
          <div className="live-section">
            <div className="section-header">
              <div className="live-badge">
                <span className="live-dot"></span>
                LIVE NOW • 24H POSTS
              </div>
              <h2 className="section-title">✨ ÉCLAT — Fresh Daily</h2>
              <p className="section-subtitle">One post per category. Expires in 24 hours.</p>
            </div>
            <LivePostCarousel posts={livePosts} />
          </div>
        )}

        {/* Regular Posts Sections */}
        {editorsPicks.length > 0 && (
          <HorizontalScroll title="⭐ Editor's Picks" posts={editorsPicks} showRank={false} />
        )}

        {todayPosts.length > 0 && (
          <HorizontalScroll title="📰 Today's Fresh Posts" posts={todayPosts} showRank={false} />
        )}

        {popularPosts.length > 0 && (
          <HorizontalScroll title={`🔥 Most Popular - ${currentMonthName}`} posts={popularPosts} showRank={true} />
        )}
      </div>

      <style jsx>{`
        .home-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem 4rem 2rem;
        }
        
        .live-section {
          margin-bottom: 3rem;
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
        
        .live-dot {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
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
        }
        
        @media (max-width: 768px) {
          .home-container {
            padding: 0 1rem 3rem 1rem;
          }
          .section-title {
            font-size: 1.4rem;
          }
        }
      `}</style>
    </>
  )
}