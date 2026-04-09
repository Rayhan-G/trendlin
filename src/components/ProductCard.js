import Link from 'next/link'

export default function ProductCard({ product }) {
  return (
    <div className="card">
      <img src={product.image} alt={product.name} className="card-image" />
      <div className="card-content">
        <h3 className="card-title">{product.name}</h3>
        <p className="card-excerpt">{product.description.substring(0, 80)}...</p>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', margin: '0.5rem 0' }}>
          ${product.price.toLocaleString()}
        </div>
        <Link href={`/products/${product.slug}`} className="btn" style={{ display: 'inline-block' }}>
          View Details →
        </Link>
      </div>
    </div>
  )
}