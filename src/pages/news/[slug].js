import Layout from '@/components/Layout'
import Link from 'next/link'
import newsData from '@/data/news.json'

// Generate static paths for all news articles at build time
export async function getStaticPaths() {
  const paths = newsData.articles.map(article => ({
    params: { slug: article.slug }
  }))
  return { paths, fallback: false }
}

// Get the data for a single news article at build time
export async function getStaticProps({ params }) {
  const article = newsData.articles.find(a => a.slug === params.slug)
  return {
    props: {
      article: article || null
    }
  }
}

export default function SingleNews({ article }) {
  if (!article) {
    return (
      <Layout>
        <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
          <h1>News Article Not Found</h1>
          <p>The news article you're looking for doesn't exist.</p>
          <Link href="/news" className="btn" style={{ marginTop: '1rem', display: 'inline-block' }}>
            ← Back to News
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container" style={{ maxWidth: 800, margin: '3rem auto' }}>
        {/* Breaking Badge */}
        {article.isBreaking && (
          <div style={{ 
            background: '#dc2626', 
            color: 'white', 
            display: 'inline-block',
            padding: '4px 16px', 
            borderRadius: '40px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}>
            🔴 BREAKING NEWS
          </div>
        )}
        
        {/* Article Title */}
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', lineHeight: 1.2 }}>
          {article.title}
        </h1>
        
        {/* Article Meta */}
        <div style={{ 
          color: 'var(--gray)', 
          marginBottom: '2rem', 
          borderBottom: '1px solid var(--border)', 
          paddingBottom: '1rem',
          display: 'flex',
          gap: '1.5rem',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <span>{article.date}</span>
            <span>•</span>
            <span>Source: {article.source}</span>
            {article.views && (
              <>
                <span>•</span>
                <span>👁️ {article.views.toLocaleString()} views</span>
              </>
            )}
          </div>
          
          {/* Source Link */}
          {article.sourceUrl && (
            <a 
              href={article.sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer nofollow"
              style={{ color: 'var(--primary)', textDecoration: 'none' }}
            >
              View Original Source <i className="fas fa-external-link-alt"></i>
            </a>
          )}
        </div>
        
        {/* Featured Image */}
        <img 
          src={article.featuredImage} 
          alt={article.title} 
          style={{ 
            width: '100%', 
            borderRadius: '16px', 
            marginBottom: '2rem',
            boxShadow: 'var(--shadow)'
          }} 
        />
        
        {/* Article Content */}
        <div 
          dangerouslySetInnerHTML={{ __html: article.content }} 
          style={{ 
            lineHeight: 1.8, 
            fontSize: '1.05rem',
            color: 'var(--dark)'
          }} 
        />
        
        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div style={{ 
            marginTop: '2rem', 
            paddingTop: '1rem', 
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            {article.tags.map(tag => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
        )}
        
        {/* Share Buttons */}
        <div className="share-buttons">
          <strong>Share this news:</strong>
          <a 
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} 
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
        
        {/* Back to News Link */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link href="/news" className="btn btn-outline">
            ← Back to All News
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