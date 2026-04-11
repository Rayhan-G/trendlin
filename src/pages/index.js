import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import HeroSection from '@/components/HeroSection'
import HorizontalScroll from '@/components/HorizontalScroll'
import blogData from '@/data/blog-posts.json'

export default function Home() {
  const [todayPosts, setTodayPosts] = useState([])
  const [popularPosts, setPopularPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const posts = blogData.posts || []
    
    // Get today's date
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
    
    // Filter today's posts
    const todayFiltered = posts.filter(post => 
      post.date === todayStr || post.date === yesterdayStr
    )
    
    // Most popular (by views)
    const popularFiltered = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 12)
    
    setTodayPosts(todayFiltered)
    setPopularPosts(popularFiltered)
    setLoading(false)
  }, [])

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

  if (loading) {
    return (
      <Layout>
        <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <HeroSection />
      
      <div className="container">
        <HorizontalScroll 
          title="📰 Today's Posts" 
          posts={todayPosts} 
          showRank={false}
        />
        
        <HorizontalScroll 
          title={`🔥 Most Popular - ${currentMonth}`} 
          posts={popularPosts} 
          showRank={true}
        />
      </div>
    </Layout>
  )
}