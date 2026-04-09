import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved === 'enabled') {
      setDarkMode(true)
      document.body.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    if (darkMode) {
      document.body.classList.remove('dark')
      localStorage.setItem('darkMode', 'disabled')
      setDarkMode(false)
    } else {
      document.body.classList.add('dark')
      localStorage.setItem('darkMode', 'enabled')
      setDarkMode(true)
    }
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <Link href="/" className="logo">
            📰 trendlin
          </Link>
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
        
        <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <Link href="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>
          <Link href="/blog" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            Blog
          </Link>
          <Link href="/products" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            Products
          </Link>
          <Link href="/news" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            News
          </Link>
          <button onClick={toggleDarkMode} className="dark-toggle">
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>
    </nav>
  )
}