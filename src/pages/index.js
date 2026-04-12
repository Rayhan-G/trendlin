import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import HeroSection from '@/components/HeroSection'
import HorizontalScroll from '@/components/HorizontalScroll'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [todayPosts, setTodayPosts] = useState([])
  const [popularPosts, setPopularPosts] = useState([])
  const [editorsPicks, setEditorsPicks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      // Get current date info
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      
      // Get current month and year for popular posts
      const currentYear = today.getFullYear()
      const currentMonth = today.getMonth() + 1
      const currentMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`

      // 1. Fetch Editor's Picks from database (manually selected by admin)
      const { data: editorPicksData, error: editorError } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .eq('is_editor_pick', true)
        .limit(6)

      if (editorError) throw editorError

      // 2. Fetch all published posts for other sections
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      // 3. Today's Posts (posts created today)
      const todayFiltered = posts.filter(post => 
        post.created_at?.split('T')[0] === todayStr
      )

      // 4. Most Popular Posts (current month only, by views, top 30)
      const popularFiltered = posts
        .filter(post => {
          const postDate = post.created_at?.split('T')[0] || ''
          return postDate.startsWith(currentMonthStr)
        })
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 30)

      setTodayPosts(todayFiltered)
      setPopularPosts(popularFiltered)
      setEditorsPicks(editorPicksData || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
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
      </Layout>
    )
  }

  return (
    <Layout>
      <HeroSection />
      
      <div className="container">
        {/* Editor's Picks Section - Manually curated by admin */}
        {editorsPicks.length > 0 && (
          <HorizontalScroll 
            title="⭐ Editor's Picks" 
            posts={editorsPicks} 
            showRank={false}
          />
        )}

        {/* Today's Posts Section */}
        {todayPosts.length > 0 && (
          <HorizontalScroll 
            title="📰 Today's Fresh Posts" 
            posts={todayPosts} 
            showRank={false}
          />
        )}

        {/* Most Popular Section - Current Month Only */}
        {popularPosts.length > 0 && (
          <HorizontalScroll 
            title={`🔥 Most Popular - ${currentMonthName}`} 
            posts={popularPosts} 
            showRank={true}
          />
        )}

        {/* If no posts in any section */}
        {todayPosts.length === 0 && popularPosts.length === 0 && editorsPicks.length === 0 && (
          <div className="empty-state">
            <p>No posts yet. Check back soon!</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem 2rem;
        }
        
        .empty-state {
          text-align: center;
          padding: 4rem;
          background: white;
          border-radius: 16px;
          margin: 2rem 0;
        }
        
        :global(body.dark) .empty-state {
          background: #1e293b;
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 0 1rem 1rem;
          }
        }
      `}</style>
    </Layout>
  )
}