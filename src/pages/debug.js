import Layout from '@/components/Layout'
import blogData from '@/data/blog-posts.json'

export default function DebugPage() {
  const posts = blogData.posts || []
  
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
  
  const matchedPosts = posts.filter(post => post.date === todayStr || post.date === yesterdayStr)

  return (
    <Layout>
      <div className="container" style={{ padding: '2rem' }}>
        <h1>Debug - Today's Posts</h1>
        
        <div style={{ background: '#f0f0f0', padding: '1rem', margin: '1rem 0', borderRadius: '8px' }}>
          <h3>📅 Current Date Info:</h3>
          <p><strong>Today's date:</strong> {todayStr}</p>
          <p><strong>Yesterday's date:</strong> {yesterdayStr}</p>
        </div>
        
        <div style={{ background: '#e8f4e8', padding: '1rem', margin: '1rem 0', borderRadius: '8px' }}>
          <h3>✅ Posts that SHOULD appear (date match): {matchedPosts.length}</h3>
          {matchedPosts.map(post => (
            <div key={post.id} style={{ borderBottom: '1px solid #ccc', padding: '0.5rem 0' }}>
              <strong>{post.title}</strong> - Date: {post.date}
            </div>
          ))}
          {matchedPosts.length === 0 && <p>No posts match today or yesterday's date!</p>}
        </div>
        
        <div style={{ background: '#fff3e0', padding: '1rem', margin: '1rem 0', borderRadius: '8px' }}>
          <h3>📚 All Posts in your JSON:</h3>
          {posts.map(post => (
            <div key={post.id} style={{ borderBottom: '1px solid #ccc', padding: '0.5rem 0' }}>
              <strong>{post.title}</strong> - Date: {post.date} 
              {post.date === todayStr ? ' ✅ TODAY' : post.date === yesterdayStr ? ' ✅ YESTERDAY' : ''}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}