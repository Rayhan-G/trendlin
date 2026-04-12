import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { optimizeImage } from '@/lib/cloudinary'

export default function CategoryLayout({ categoryConfig }) {
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [filteredPosts, setFilteredPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    fetchCategoryPosts()
  }, [])

  useEffect(() => {
    filterAndSortPosts()
  }, [posts, searchTerm, sortBy])

  const fetchCategoryPosts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('category', categoryConfig.slug)
      .eq('published', true)
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setPosts(data)
      setFilteredPosts(data)
    }
    setLoading(false)
  }

  const filterAndSortPosts = () => {
    let result = [...posts]

    if (searchTerm) {
      result = result.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        break
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        break
      case 'popular':
        result.sort((a, b) => (b.views || 0) - (a.views || 0))
        break
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        break
    }

    setFilteredPosts(result)
  }

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
            border-top-color: ${categoryConfig.color};
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
        {/* Hero Section */}
        <div className="hero-section" style={{ background: categoryConfig.bgLight }}>
          <div className="hero-content">
            <div className="hero-icon" style={{ color: categoryConfig.color }}>
              {categoryConfig.icon}
            </div>
            <h1 className="hero-title">{categoryConfig.name}</h1>
            <p className="hero-description">{categoryConfig.description}</p>
            <div className="hero-stats">
              <span className="stat-badge">
                📝 {posts.length} {posts.length === 1 ? 'Article' : 'Articles'}
              </span>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="filters-section">
          <div className="filters-container">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>×</button>
              )}
            </div>

            <div className="sort-box">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="newest">📅 Newest First</option>
                <option value="oldest">📅 Oldest First</option>
                <option value="popular">🔥 Most Popular</option>
                <option value="title">📝 A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Info */}
        {searchTerm && (
          <div className="results-info">
            Found {filteredPosts.length} {filteredPosts.length === 1 ? 'result' : 'results'} for "{searchTerm}"
            <button onClick={() => setSearchTerm('')} className="clear-results">
              Clear search
            </button>
          </div>
        )}

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>No posts found</h3>
            <p>{searchTerm ? `No articles matching "${searchTerm}"` : 'No articles in this category yet'}</p>
          </div>
        ) : (
          <div className="posts-grid">
            {filteredPosts.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.id} className="post-card">
                <div className="post-card-image">
                  <img 
                    src={optimizeImage(post.image_url || post.featured_image)} 
                    alt={post.title}
                    loading="lazy"
                  />
                  <div className="post-category-badge" style={{ background: categoryConfig.color }}>
                    {categoryConfig.icon} {categoryConfig.name}
                  </div>
                </div>
                <div className="post-card-content">
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-excerpt">{post.excerpt?.substring(0, 120)}...</p>
                  <div className="post-meta">
                    <span className="post-date">
                      📅 {new Date(post.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="post-views">👁️ {post.views || 0}</span>
                  </div>
                  <div className="post-read-more">
                    Read Article <span className="arrow">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .category-page {
          min-height: 100vh;
        }

        /* Hero Section */
        .hero-section {
          padding: 4rem 2rem;
          text-align: center;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        :global(body.dark) .hero-section {
          border-bottom-color: rgba(255, 255, 255, 0.05);
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .hero-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
          color: #0f172a;
        }

        :global(body.dark) .hero-title {
          color: #f1f5f9;
        }

        .hero-description {
          font-size: 1.1rem;
          line-height: 1.6;
          color: #475569;
          margin-bottom: 1.5rem;
        }

        :global(body.dark) .hero-description {
          color: #94a3b8;
        }

        .hero-stats {
          display: inline-block;
        }

        .stat-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: white;
          border-radius: 40px;
          font-size: 0.85rem;
          font-weight: 500;
          color: ${categoryConfig.color};
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        :global(body.dark) .stat-badge {
          background: #1e293b;
        }

        /* Filters Section */
        .filters-section {
          position: sticky;
          top: 64px;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          z-index: 10;
        }

        :global(body.dark) .filters-section {
          background: #0f172a;
          border-bottom-color: #334155;
        }

        .filters-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem;
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          position: relative;
          min-width: 200px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.9rem;
        }

        .search-input {
          width: 100%;
          padding: 0.6rem 2rem 0.6rem 2.25rem;
          border: 1px solid #e2e8f0;
          border-radius: 40px;
          font-size: 0.85rem;
          background: white;
        }

        :global(body.dark) .search-input {
          background: #1e293b;
          border-color: #334155;
          color: white;
        }

        .search-input:focus {
          outline: none;
          border-color: ${categoryConfig.color};
        }

        .clear-search {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          color: #94a3b8;
        }

        .sort-box {
          min-width: 160px;
        }

        .sort-select {
          width: 100%;
          padding: 0.6rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 40px;
          font-size: 0.85rem;
          background: white;
          cursor: pointer;
        }

        :global(body.dark) .sort-select {
          background: #1e293b;
          border-color: #334155;
          color: white;
        }

        /* Results Info */
        .results-info {
          max-width: 1200px;
          margin: 1rem auto;
          padding: 0 1rem;
          font-size: 0.85rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .clear-results {
          background: none;
          border: none;
          color: ${categoryConfig.color};
          cursor: pointer;
        }

        /* Posts Grid */
        .posts-grid {
          max-width: 1200px;
          margin: 2rem auto;
          padding: 0 1rem;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
        }

        .post-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .post-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
        }

        :global(body.dark) .post-card {
          background: #1e293b;
        }

        .post-card-image {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .post-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .post-card:hover .post-card-image img {
          transform: scale(1.05);
        }

        .post-category-badge {
          position: absolute;
          bottom: 12px;
          left: 12px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
          color: white;
        }

        .post-card-content {
          padding: 1.25rem;
        }

        .post-title {
          font-size: 1.1rem;
          font-weight: 700;
          line-height: 1.4;
          margin-bottom: 0.5rem;
          color: #0f172a;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        :global(body.dark) .post-title {
          color: #f1f5f9;
        }

        .post-excerpt {
          font-size: 0.85rem;
          line-height: 1.5;
          color: #475569;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        :global(body.dark) .post-excerpt {
          color: #94a3b8;
        }

        .post-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.7rem;
          color: #64748b;
          margin-bottom: 0.75rem;
        }

        .post-read-more {
          font-size: 0.8rem;
          font-weight: 600;
          color: ${categoryConfig.color};
          display: flex;
          align-items: center;
          gap: 4px;
          transition: gap 0.2s;
        }

        .post-card:hover .post-read-more {
          gap: 8px;
        }

        .arrow {
          transition: transform 0.2s;
        }

        .post-card:hover .arrow {
          transform: translateX(4px);
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 4rem;
          background: white;
          border-radius: 20px;
          margin: 2rem auto;
          max-width: 500px;
        }

        :global(body.dark) .empty-state {
          background: #1e293b;
        }

        .empty-icon {
          font-size: 4rem;
          display: block;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-state h3 {
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: #64748b;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-section {
            padding: 2rem 1rem;
          }

          .hero-title {
            font-size: 1.75rem;
          }

          .hero-description {
            font-size: 0.95rem;
          }

          .filters-container {
            flex-direction: column;
          }

          .posts-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .post-card-image {
            height: 180px;
          }
        }
      `}</style>
    </Layout>
  )
}