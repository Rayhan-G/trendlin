import Layout from '@/components/Layout'
import NewsCard from '@/components/NewsCard'
import newsData from '@/data/news.json'

export default function News() {
  const articles = newsData.articles

  // Separate breaking news from regular news
  const breakingNews = articles.filter(article => article.isBreaking)
  const regularNews = articles.filter(article => !article.isBreaking)

  return (
    <Layout>
      {/* News Header */}
      <div className="news-header">
        <div className="container">
          <h1>📰 Latest News</h1>
          <p>Breaking updates, expert analysis, and in-depth coverage</p>
        </div>
      </div>

      <div className="container" style={{ margin: '3rem auto' }}>
        {/* Breaking News Section */}
        {breakingNews.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <h2 className="section-title" style={{ borderLeftColor: '#dc2626' }}>
              🔴 Breaking News
            </h2>
            <div className="card-grid">
              {breakingNews.map(article => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}

        {/* All News Section */}
        <div>
          <h2 className="section-title">All News</h2>
          {regularNews.length === 0 && breakingNews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p>No news articles found.</p>
            </div>
          ) : (
            <div className="card-grid">
              {regularNews.map(article => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}