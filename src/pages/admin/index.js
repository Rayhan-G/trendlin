import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import Layout from '@/components/Layout'

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({ totalPosts: 0, totalViews: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    fetchStats()
  }, [])

  const checkAuth = () => {
    const isLoggedIn = localStorage.getItem('admin_logged_in')
    if (!isLoggedIn) {
      router.push('/')
    }
  }

  const fetchStats = async () => {
    const { data: posts } = await supabase.from('posts').select('views')
    if (posts) {
      setStats({
        totalPosts: posts.length,
        totalViews: posts.reduce((sum, p) => sum + (p.views || 0), 0)
      })
    }
    setLoading(false)
  }

  if (loading) return <Layout><div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div></Layout>

  return (
    <Layout>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <h1>Admin Dashboard</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
          <div style={{ padding: '1.5rem', background: '#f1f5f9', borderRadius: '12px' }}>
            <h2>{stats.totalPosts}</h2>
            <p>Total Posts</p>
          </div>
          <div style={{ padding: '1.5rem', background: '#f1f5f9', borderRadius: '12px' }}>
            <h2>{stats.totalViews.toLocaleString()}</h2>
            <p>Total Views</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}