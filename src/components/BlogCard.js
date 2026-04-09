import Link from 'next/link'

export default function BlogCard({ post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="card">
      <img src={post.featuredImage} alt={post.title} className="card-image" />
      <div className="card-content">
        <div className="card-meta">
          <span>{post.date}</span>
          <span>•</span>
          <span>{post.author}</span>
        </div>
        <h3 className="card-title">{post.title}</h3>
        <p className="card-excerpt">{post.excerpt.substring(0, 100)}...</p>
        <span className="tag">{post.category}</span>
      </div>
    </Link>
  )
}