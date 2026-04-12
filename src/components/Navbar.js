import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'

export default function Navbar() {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)
  const [exploreOpen, setExploreOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  const exploreRef = useRef(null)
  const buttonRef = useRef(null)

  const categories = [
    { name: "Health", icon: "🌿", href: "/category/health" },
    { name: "Wealth", icon: "💰", href: "/category/wealth" },
    { name: "Tech", icon: "⚡", href: "/category/tech" },
    { name: "Growth", icon: "🌱", href: "/category/growth" },
    { name: "Entertainment", icon: "🎬", href: "/category/entertainment" },
    { name: "World", icon: "🌍", href: "/category/world" },
    { name: "Lifestyle", icon: "✨", href: "/category/lifestyle" }
  ]

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true)
      document.body.classList.add('dark')
    }
  }, [])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exploreRef.current && !exploreRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setExploreOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    if (newMode) {
      document.body.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.body.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <Link href="/" className="logo">
            <span className="logo-text">trendlin</span>
            <span className="logo-dot">.</span>
          </Link>

          <div className="nav-actions">
            {/* Theme Toggle */}
            <button onClick={toggleDarkMode} className="theme-toggle">
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* Explore Dropdown */}
            <div className="dropdown-wrapper" ref={exploreRef}>
              <button
                ref={buttonRef}
                onClick={() => setExploreOpen(!exploreOpen)}
                className={`explore-trigger ${exploreOpen ? 'active' : ''}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                <span>Explore</span>
                <svg className={`arrow ${exploreOpen ? 'rotate' : ''}`} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {exploreOpen && (
                <div className="explore-dropdown">
                  <div className="dropdown-header">Browse categories</div>
                  <div className="dropdown-items">
                    {categories.map((category) => (
                      <Link
                        key={category.name}
                        href={category.href}
                        className="dropdown-item"
                        onClick={() => setExploreOpen(false)}
                      >
                        <span className="item-icon">{category.icon}</span>
                        <span className="item-name">{category.name}</span>
                        <span className="item-arrow">→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <style jsx>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
        }
        
        .navbar.scrolled {
          background: rgba(255, 255, 255, 0.98);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
        }
        
        :global(body.dark) .navbar {
          background: rgba(10, 10, 15, 0.96);
          border-bottom-color: rgba(255, 255, 255, 0.06);
        }
        
        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
        }
        
        /* Logo */
        .logo {
          display: flex;
          align-items: baseline;
          text-decoration: none;
        }
        
        .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #1a1a1a 0%, #3a3a3a 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        .logo-dot {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #e11d48 0%, #f43f5e 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        :global(body.dark) .logo-text {
          background: linear-gradient(135deg, #f4f4f5 0%, #a1a1aa 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        /* Theme Toggle */
        .theme-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: transparent;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
        }
        
        /* Explore Dropdown */
        .dropdown-wrapper {
          position: relative;
        }
        
        .explore-trigger {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: #1a1a1a;
          border: none;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
          color: white;
          cursor: pointer;
        }
        
        :global(body.dark) .explore-trigger {
          background: #2a2a2a;
        }
        
        .explore-trigger.active {
          background: #e11d48;
        }
        
        .arrow {
          transition: transform 0.2s;
        }
        
        .arrow.rotate {
          transform: rotate(180deg);
        }
        
        .explore-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          min-width: 200px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          z-index: 1000;
        }
        
        :global(body.dark) .explore-dropdown {
          background: #1a1a1f;
        }
        
        .dropdown-header {
          padding: 10px 14px;
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          color: #71717a;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .explore-dropdown .dropdown-items {
          padding: 4px;
        }
        
        .explore-dropdown .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 6px;
          text-decoration: none;
        }
        
        .explore-dropdown .dropdown-item:hover {
          background: #f1f5f9;
        }
        
        .explore-dropdown .item-icon {
          font-size: 1rem;
          width: 24px;
        }
        
        .explore-dropdown .item-name {
          font-size: 0.8rem;
          font-weight: 500;
          color: #27272a;
          flex: 1;
        }
        
        .explore-dropdown .item-arrow {
          font-size: 0.7rem;
          color: #a1a1aa;
          opacity: 0;
        }
        
        .explore-dropdown .dropdown-item:hover .item-arrow {
          opacity: 1;
        }
        
        @media (max-width: 768px) {
          .nav-container {
            padding: 0 1rem;
          }
          
          .logo-text,
          .logo-dot {
            font-size: 1.2rem;
          }
          
          .explore-trigger span {
            display: none;
          }
          
          .explore-trigger {
            padding: 6px 10px;
          }
        }
      `}</style>
    </>
  )
}