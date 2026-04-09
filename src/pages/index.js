import Layout from '@/components/Layout'
import BlogCard from '@/components/BlogCard'
import ProductCard from '@/components/ProductCard'
import NewsCard from '@/components/NewsCard'
import blogData from '@/data/blog-posts.json'
import productData from '@/data/products.json'
import newsData from '@/data/news.json'

export default function Home() {
  const latestBlogs = blogData.posts.slice(0, 3)
  const featuredProducts = productData.products.filter(p => p.featured).slice(0, 3)
  const latestNews = newsData.articles.slice(0, 3)

  return (
    <Layout>
      {/* Hero Section */}
      <div className="hero-section">
        <div className="container">
          <h1 className="hero-title">
            Smart Reviews. Fresh News. Honest Insights.
          </h1>
          <p className="hero-subtitle">
            Discover hand-picked affiliate products, breaking news, and thoughtful blog posts — all in one place.
          </p>
        </div>
      </div>

      <div className="container">
        {/* Latest Blog Posts Section */}
        <section className="content-section">
          <h2 className="section-title">📝 Latest from Blog</h2>
          <div className="card-grid">
            {latestBlogs.map(post => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
          <div className="view-all-container">
            <a href="/blog" className="btn btn-outline">View All Posts →</a>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="content-section">
          <h2 className="section-title">🛍️ Featured Affiliate Products</h2>
          <div className="card-grid">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="view-all-container">
            <a href="/products" className="btn btn-outline">View All Products →</a>
          </div>
        </section>

        {/* Latest News Section */}
        <section className="content-section">
          <h2 className="section-title">📰 Latest News</h2>
          <div className="card-grid">
            {latestNews.map(article => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
          <div className="view-all-container">
            <a href="/news" className="btn btn-outline">View All News →</a>
          </div>
        </section>
      </div>

      <style jsx>{`
        .hero-section {
          background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
          padding: 4rem 0;
          text-align: center;
          margin-bottom: 2rem;
          transition: all 0.3s ease;
        }
        
        /* Dark mode hero section */
        :global(body.dark) .hero-section {
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
        }
        
        .hero-title {
          font-size: 3rem;
          margin-bottom: 1rem;
          font-weight: 800;
          color: #111827;
          transition: color 0.3s ease;
        }
        
        :global(body.dark) .hero-title {
          color: #ffffff;
        }
        
        .hero-subtitle {
          font-size: 1.2rem;
          color: #6b7280;
          max-width: 600px;
          margin: 0 auto;
          transition: color 0.3s ease;
        }
        
        :global(body.dark) .hero-subtitle {
          color: #cbd5e1;
        }
        
        .content-section {
          margin: 4rem 0;
        }
        
        .view-all-container {
          text-align: center;
          margin-top: 2rem;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .hero-section {
            padding: 2rem 0;
          }
          
          .hero-title {
            font-size: 1.75rem;
            padding: 0 1rem;
          }
          
          .hero-subtitle {
            font-size: 1rem;
            padding: 0 1rem;
          }
          
          .content-section {
            margin: 2rem 0;
          }
        }
        
        @media (max-width: 480px) {
          .hero-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </Layout>
  )
}