import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import HorizontalScroll from '@/components/HorizontalScroll'
import { supabase } from '@/lib/supabase'

export default function CategoryPage() {
  const router = useRouter()
  const { slug } = router.query
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoryInfo, setCategoryInfo] = useState({ name: '', icon: '' })

  const categories = {
    health: { name: 'Health', icon: '🌿', color: '#10b981' },
    wealth: { name: 'Wealth', icon: '💰', color: '#f59e0b' },
    tech: { name: 'Technology', icon: '⚡', color: '#3b82f6' },
    growth: { name: 'Personal Growth', icon: '🌱', color: '#8b5cf6' },
    entertainment: { name: 'Entertainment', icon: '🎬', color: '#ec4899' },
    world: { name: 'World News', icon: '🌍', color: '#06b6d4' },
    lifestyle: { name: 'Lifestyle', icon: '✨', color: '#ef4444' }
  }

  useEffect(() => {
    if (slug && categories[slug]) {
      setCategoryInfo(categories[slug])
      fetchCategoryPosts()
    } else if (slug && !categories[slug]) {
      router.push('/404')
    }
  }, [slug])

  const fetchCategoryPosts = async () => {
    setLoading(true)
    
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('category', slug)
      .eq('published', true)
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setPosts(data)
    }
    
    setLoading(false)
  }

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading {categoryInfo.name} posts...</p>
        </div>
        <style jsx>{`
          .loading-container {
            min-height: 60vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
          }
          .loading-spinner {
            width: 48px;
            height: 48px;
            border: 3px solid #e2e8f0;
            border-top-color: ${categoryInfo.color || '#667eea'};
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
      <div className="category-page">
        <div className="category-hero" style={{ background: `linear-gradient(135deg, ${categoryInfo.color}20, ${categoryInfo.color}10)` }}>
          <div className="category-hero-content">
            <span className="category-icon">{categoryInfo.icon}</span>
          </div>
        </div>

        <div className="container">
          <div className="category-header">
            <h1>{categoryInfo.name}</h1>
            <p className="post-count">{posts.length} {posts.length === 1 ? 'article' : 'articles'}</p>
          </div>
          
          {posts.length > 0 ? (
            <HorizontalScroll 
              title={`Latest in ${categoryInfo.name}`} 
              posts={posts} 
              showRank={false}
            />
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📝</span>
              <h3>No posts yet</h3>
              <p>Check back soon for {categoryInfo.name} content!</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .category-page {
          min-height: 70vh;
        }
        
        .category-hero {
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        
        .category-hero-content {
          text-align: center;
        }
        
        .category-icon {
          font-size: 5rem;
          display: inline-block;
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .category-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .category-header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        :global(body.dark) .category-header h1 {
          background: linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        .post-count {
          color: #64748b;
          font-size: 1rem;
        }
        
        .empty-state {
          text-align: center;
          padding: 4rem;
          background: white;
          border-radius: 24px;
          margin: 2rem 0;
        }
        
        :global(body.dark) .empty-state {
          background: #1e293b;
        }
        
        .empty-icon {
          font-size: 4rem;
          display: block;
          margin-bottom: 1rem;
        }
        
        .empty-state h3 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }
        
        .empty-state p {
          color: #64748b;
        }
        
        @media (max-width: 768px) {
          .category-hero {
            height: 150px;
          }
          
          .category-icon {
            font-size: 3rem;
          }
          
          .container {
            padding: 1rem;
          }
          
          .category-header h1 {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </Layout>
  )
}

export async function getStaticPaths() {
  const categories = ['health', 'wealth', 'tech', 'growth', 'entertainment', 'world', 'lifestyle']
  
  const paths = categories.map((category) => ({
    params: { slug: category }
  }))
  
  return { paths, fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  const { slug } = params
  
  // Validate category
  const validCategories = ['health', 'wealth', 'tech', 'growth', 'entertainment', 'world', 'lifestyle']
  
  if (!validCategories.includes(slug)) {
    return { notFound: true }
  }
  
  return {
    props: { category: slug },
    revalidate: 3600 // Revalidate every hour
  }
}