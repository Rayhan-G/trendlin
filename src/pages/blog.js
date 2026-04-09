import Layout from '@/components/Layout'
import BlogCard from '@/components/BlogCard'
import blogData from '@/data/blog-posts.json'

export default function Blog() {
  const posts = blogData.posts

  return (
    <Layout>
      {/* Blog Header - Using proper className */}
      <div className="page-header blog-header">
        <div className="container">
          <h1 className="page-title">📖 Blog</h1>
          <p className="page-subtitle">Expert insights, honest reviews, and actionable advice</p>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="container" style={{ margin: '3rem auto' }}>
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>No blog posts found.</p>
          </div>
        ) : (
          <div className="card-grid">
            {posts.map(post => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        /* Additional inline styles to ensure dark mode works */
        :global(.page-header) {
          background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
          padding: 3rem 0;
          text-align: center;
          border-bottom: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }
        
        :global(body.dark .page-header) {
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%) !important;
          border-bottom-color: #1e293b !important;
        }
        
        :global(.page-title) {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: #111827;
          transition: color 0.3s ease;
        }
        
        :global(body.dark .page-title) {
          color: #ffffff !important;
        }
        
        :global(.page-subtitle) {
          font-size: 1.1rem;
          color: #6b7280;
          max-width: 600px;
          margin: 0 auto;
          transition: color 0.3s ease;
        }
        
        :global(body.dark .page-subtitle) {
          color: #cbd5e1 !important;
        }
        
        @media (max-width: 768px) {
          :global(.page-header) {
            padding: 2rem 0;
          }
          
          :global(.page-title) {
            font-size: 1.75rem;
          }
          
          :global(.page-subtitle) {
            font-size: 1rem;
            padding: 0 1rem;
          }
        }
      `}</style>
    </Layout>
  )
}