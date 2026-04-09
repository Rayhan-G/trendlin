import Layout from '@/components/Layout'
import Link from 'next/link'
import blogData from '@/data/blog-posts.json'

// Generate static paths for all blog posts at build time
export async function getStaticPaths() {
  const paths = blogData.posts.map(post => ({
    params: { slug: post.slug }
  }))
  return { paths, fallback: false }
}

// Get the data for a single blog post at build time
export async function getStaticProps({ params }) {
  const post = blogData.posts.find(p => p.slug === params.slug)
  return {
    props: {
      post: post || null
    }
  }
}

export default function SingleBlog({ post }) {
  if (!post) {
    return (
      <Layout>
        <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
          <h1>Post Not Found</h1>
          <p>The blog post you're looking for doesn't exist.</p>
          <Link href="/blog" className="btn" style={{ marginTop: '1rem', display: 'inline-block' }}>
            ← Back to Blog
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container" style={{ maxWidth: 800, margin: '3rem auto' }}>
        {/* Post Header */}
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', lineHeight: 1.2 }}>
          {post.title}
        </h1>
        
        {/* Post Meta */}
        <div style={{ 
          color: 'var(--gray)', 
          marginBottom: '2rem', 
          borderBottom: '1px solid var(--border)', 
          paddingBottom: '1rem',
          display: 'flex',
          gap: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <span>{post.date}</span>
          <span>•</span>
          <span>By {post.author}</span>
          <span>•</span>
          <span>{post.category}</span>
          {post.readingTime && (
            <>
              <span>•</span>
              <span>{post.readingTime} min read</span>
            </>
          )}
        </div>
        
        {/* Featured Image */}
        <img 
          src={post.featuredImage} 
          alt={post.title} 
          style={{ 
            width: '100%', 
            borderRadius: '16px', 
            marginBottom: '2rem',
            boxShadow: 'var(--shadow)'
          }} 
        />
        
        {/* Post Content */}
        <div 
          dangerouslySetInnerHTML={{ __html: post.content }} 
          style={{ 
            lineHeight: 1.8, 
            fontSize: '1.05rem',
            color: 'var(--dark)'
          }} 
        />
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{ 
            marginTop: '2rem', 
            paddingTop: '1rem', 
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            {post.tags.map(tag => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
        )}
        
        {/* Share Buttons */}
        <div className="share-buttons">
          <strong>Share this article:</strong>
          <a 
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <i className="fab fa-twitter"></i> Twitter
          </a>
          <a 
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <i className="fab fa-facebook"></i> Facebook
          </a>
          <a 
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <i className="fab fa-linkedin"></i> LinkedIn
          </a>
        </div>
        
        {/* Back to Blog Link */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link href="/blog" className="btn btn-outline">
            ← Back to All Posts
          </Link>
        </div>
        
        {/* Ad Placeholder */}
        <div className="ad-placeholder">
          📢 Advertisement — Google AdSense Ready
        </div>
      </div>
    </Layout>
  )
}