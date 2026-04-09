import Layout from '@/components/Layout'
import ProductCard from '@/components/ProductCard'
import productData from '@/data/products.json'

export default function Products() {
  const products = productData.products

  return (
    <Layout>
      {/* Products Header */}
      <div className="products-header">
        <div className="container">
          <h1>🛍️ Affiliate Products</h1>
          <p>Hand-picked recommendations. We only feature products we truly believe in.</p>
          <div className="affiliate-disclosure-badge">
            🔗 Disclosure: We earn a commission from qualifying purchases, at no extra cost to you
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container" style={{ margin: '3rem auto' }}>
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>No products found.</p>
          </div>
        ) : (
          <div className="card-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}