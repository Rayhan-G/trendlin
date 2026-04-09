import Layout from '@/components/Layout'
import Link from 'next/link'
import productData from '@/data/products.json'

export async function getStaticPaths() {
  const paths = productData.products.map(product => ({
    params: { slug: product.slug }
  }))
  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const product = productData.products.find(p => p.slug === params.slug)
  return {
    props: {
      product: product || null
    }
  }
}

export default function SingleProduct({ product }) {
  if (!product) {
    return (
      <Layout>
        <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
          <h1>Product Not Found</h1>
          <p>The product you're looking for doesn't exist.</p>
          <Link href="/products" className="btn" style={{ marginTop: '1rem', display: 'inline-block' }}>
            ← Back to Products
          </Link>
        </div>
      </Layout>
    )
  }

  const handleBuyClick = () => {
    console.log(`Affiliate click: ${product.name} - ${product.buyLink}`)
    window.open(product.buyLink, '_blank')
  }

  const discountPercent = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null

  return (
    <Layout>
      <div className="container" style={{ maxWidth: 1200, margin: '3rem auto', padding: '0 1rem' }}>
        {/* Product Detail Grid - Responsive */}
        <div className="product-detail-grid">
          {/* Product Image */}
          <div className="product-image-container">
            <img 
              src={product.image} 
              alt={product.name} 
              className="product-detail-image"
            />
          </div>
          
          {/* Product Info */}
          <div className="product-info">
            <div className="product-brand">{product.brand}</div>
            <h1 className="product-title">{product.name}</h1>
            
            {/* Rating Stars */}
            {product.rating && (
              <div className="product-rating">
                <span className="stars">
                  {'★'.repeat(Math.floor(product.rating))}
                  {'☆'.repeat(5 - Math.floor(product.rating))}
                </span>
                <span className="rating-text">{product.rating} / 5</span>
              </div>
            )}
            
            {/* Price */}
            <div className="product-price-section">
              <span className="current-price">${product.price.toLocaleString()}</span>
              {product.compareAtPrice && (
                <>
                  <span className="original-price">${product.compareAtPrice.toLocaleString()}</span>
                  <span className="discount-badge">Save {discountPercent}%</span>
                </>
              )}
            </div>
            
            {/* Description */}
            <p className="product-description">{product.description}</p>
            
            {/* Pros and Cons - Responsive Grid */}
            <div className="pros-cons-grid">
              {product.pros && product.pros.length > 0 && (
                <div className="pros-box">
                  <strong className="pros-title">✅ Pros</strong>
                  <ul>
                    {product.pros.map(pro => <li key={pro}>{pro}</li>)}
                  </ul>
                </div>
              )}
              
              {product.cons && product.cons.length > 0 && (
                <div className="cons-box">
                  <strong className="cons-title">❌ Cons</strong>
                  <ul>
                    {product.cons.map(con => <li key={con}>{con}</li>)}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Buy Button */}
            <button onClick={handleBuyClick} className="btn buy-now-btn">
              Buy Now on Amazon →
            </button>
            <p className="affiliate-disclosure">
              As an Amazon Associate, we earn from qualifying purchases
            </p>
          </div>
        </div>
        
        {/* Full Description */}
        {product.fullDescription && (
          <div className="full-description">
            <h2>Product Details</h2>
            <div dangerouslySetInnerHTML={{ __html: product.fullDescription }} />
          </div>
        )}
        
        {/* Back to Products Link */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link href="/products" className="btn btn-outline">
            ← Back to All Products
          </Link>
        </div>
        
        {/* Ad Placeholder */}
        <div className="ad-placeholder">
          📢 Advertisement — Google AdSense Ready
        </div>
      </div>

      <style jsx>{`
        .product-detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          margin-bottom: 3rem;
        }
        
        .product-detail-image {
          width: 100%;
          border-radius: 16px;
          box-shadow: var(--shadow);
        }
        
        .product-brand {
          font-size: 0.8rem;
          color: var(--gray);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .product-title {
          font-size: 2rem;
          margin-bottom: 1rem;
        }
        
        .product-rating {
          margin-bottom: 1rem;
        }
        
        .stars {
          color: #fbbf24;
          font-size: 1.2rem;
        }
        
        .rating-text {
          color: var(--gray);
          margin-left: 0.5rem;
        }
        
        .product-price-section {
          margin-bottom: 1rem;
        }
        
        .current-price {
          font-size: 2rem;
          font-weight: 700;
          color: var(--primary);
        }
        
        .original-price {
          font-size: 1.2rem;
          color: var(--gray);
          text-decoration: line-through;
          margin-left: 0.75rem;
        }
        
        .discount-badge {
          background: #ef4444;
          color: white;
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 0.8rem;
          margin-left: 0.75rem;
        }
        
        .product-description {
          color: var(--gray);
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
        
        .pros-cons-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .pros-box, .cons-box {
          background: var(--light);
          padding: 1rem;
          border-radius: 12px;
        }
        
        .pros-title {
          color: #059669;
        }
        
        .cons-title {
          color: #dc2626;
        }
        
        .pros-box ul, .cons-box ul {
          margin-top: 0.5rem;
          margin-left: 1rem;
          color: var(--gray);
        }
        
        .pros-box li, .cons-box li {
          margin-bottom: 0.25rem;
        }
        
        .buy-now-btn {
          width: 100%;
          padding: 1rem;
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }
        
        .affiliate-disclosure {
          font-size: 0.75rem;
          color: var(--gray);
          text-align: center;
        }
        
        .full-description {
          margin-top: 2rem;
          padding: 2rem;
          background: var(--light);
          border-radius: 16px;
        }
        
        .full-description h2 {
          margin-bottom: 1rem;
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .product-detail-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .product-title {
            font-size: 1.5rem;
          }
          
          .current-price {
            font-size: 1.5rem;
          }
          
          .pros-cons-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .full-description {
            padding: 1rem;
          }
        }
        
        @media (max-width: 480px) {
          .product-title {
            font-size: 1.35rem;
          }
          
          .product-brand {
            font-size: 0.7rem;
          }
          
          .stars {
            font-size: 1rem;
          }
          
          .current-price {
            font-size: 1.35rem;
          }
          
          .original-price {
            font-size: 1rem;
          }
        }
      `}</style>
    </Layout>
  )
}