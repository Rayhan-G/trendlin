import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import HeroSection from '@/components/HeroSection'
import HorizontalScroll from '@/components/HorizontalScroll'
import { getPublishedPosts } from '@/lib/supabase'

export default function Home() {
  const [todayPosts, setTodayPosts] = useState([])
  const [popularPosts, setPopularPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const posts = await getPublishedPosts()
    
    // Get today's date
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    
    // Filter today's posts
    const todayFiltered = posts.filter(post => 
      post.created_at?.split('T')[0] === todayStr || 
      post.created_at?.split('T')[0] === yesterdayStr
    )
    
    // Most popular
    const popularFiltered = [...posts]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 12)
    
    setTodayPosts(todayFiltered)
    setPopularPosts(popularFiltered)
    setLoading(false)
  }

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <HeroSection />
      
      <div className="container">
        {todayPosts.length > 0 && (
          <HorizontalScroll 
            title="📰 Today's Posts" 
            posts={todayPosts} 
            showRank={false}
          />
        )}
        
        {popularPosts.length > 0 && (
          <HorizontalScroll 
            title={`🔥 Most Popular - ${currentMonth}`} 
            posts={popularPosts} 
            showRank={true}
          />
        )}
      </div>

      <style jsx>{`
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 0 1rem;
          }
        }
      `}</style>
    </Layout>
  )
}