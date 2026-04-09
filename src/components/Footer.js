import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--dark)',
      color: 'white',
      textAlign: 'center',
      padding: '3rem 2rem',
      marginTop: '4rem',
    }}>
      <div className="container">
        {/* Footer Links */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '2rem', 
          flexWrap: 'wrap',
          marginBottom: '2rem'
        }}>
          <Link href="/" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>Home</Link>
          <Link href="/blog" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>Blog</Link>
          <Link href="/products" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>Products</Link>
          <Link href="/news" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>News</Link>
          <a href="#" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>Privacy Policy</a>
          <a href="#" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>Terms of Use</a>
        </div>

        {/* Copyright */}
        <p>© 2025 trendlin — Honest reviews, latest news & insights.</p>
        
        {/* Affiliate Disclosure */}
        <p style={{ marginTop: '1rem', fontSize: '0.75rem', opacity: 0.7 }}>
          <small>Affiliate disclosure: We may earn a commission from qualifying purchases, at no extra cost to you.</small>
        </p>
        
      </div>
    </footer>
  )
}