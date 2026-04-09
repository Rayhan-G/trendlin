import Link from 'next/link'

export default function NewsCard({ article }) {
  return (
    <Link href={`/news/${article.slug}`} className="card">
      <img src={article.featuredImage} alt={article.title} className="card-image" />
      <div className="card-content">
        <div className="card-meta">
          <span>{article.date}</span>
          <span>•</span>
          <span>{article.source}</span>
          {article.isBreaking && (
            <span style={{ 
              background: '#dc2626', 
              color: 'white', 
              padding: '2px 8px', 
              borderRadius: '12px',
              fontSize: '0.7rem',
              fontWeight: 'bold'
            }}>
              BREAKING
            </span>
          )}
        </div>
        <h3 className="card-title">{article.title}</h3>
        <p className="card-excerpt">{article.summary.substring(0, 100)}...</p>
      </div>
    </Link>
  )
}