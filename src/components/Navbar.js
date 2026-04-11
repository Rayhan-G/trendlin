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

  // Categories configuration
  const categories = [
    { name: "Health", icon: "🌿", href: "/category/health" },
    { name: "Wealth", icon: "💰", href: "/category/wealth" },
    { name: "Tech", icon: "⚡", href: "/category/tech" },
    { name: "Growth", icon: "🌱", href: "/category/growth" },
    { name: "Entertainment", icon: "🎬", href: "/category/entertainment" },
    { name: "World", icon: "🌍", href: "/category/world" },
    { name: "Lifestyle", icon: "✨", href: "/category/lifestyle" }
  ]

  // Initialize theme on mount
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

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') setExploreOpen(false)
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
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
      <nav className={`navbar-premium ${scrolled ? 'scrolled' : ''}`} aria-label="Main navigation">
        <div className="container">
          <div className="nav-wrapper">
            <Link href="/" className="logo">
              <span className="logo-text">trendlin</span>
              <span className="logo-dot">.</span>
            </Link>

            <div className="nav-actions">
              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className="theme-toggle"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>

              {/* Explore Dropdown */}
              <div className="dropdown-wrapper" ref={exploreRef}>
                <button
                  ref={buttonRef}
                  onClick={() => setExploreOpen(!exploreOpen)}
                  className={`explore-trigger ${exploreOpen ? 'active' : ''}`}
                  aria-expanded={exploreOpen}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                  <span>Explore</span>
                  <svg 
                    width="14" 
                    height="14" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    className={`arrow ${exploreOpen ? 'rotate' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {exploreOpen && (
                  <div className="explore-dropdown" role="menu">
                    <div className="dropdown-header">
                      <span className="dropdown-title">Browse categories</span>
                    </div>
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
        </div>
      </nav>

      <style jsx>{`
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 32px;
        }
        
        .navbar-premium {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .navbar-premium.scrolled {
          background: rgba(255, 255, 255, 0.98);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
          border-bottom-color: rgba(0, 0, 0, 0.08);
        }
        
        :global(body.dark) .navbar-premium {
          background: rgba(10, 10, 15, 0.96);
          border-bottom-color: rgba(255, 255, 255, 0.06);
        }
        
        :global(body.dark) .navbar-premium.scrolled {
          background: rgba(10, 10, 15, 0.98);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
          border-bottom-color: rgba(255, 255, 255, 0.08);
        }
        
        .nav-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
        }
        
        /* Logo */
        .logo {
          display: flex;
          align-items: baseline;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        
        .logo-text {
          font-size: 1.75rem;
          font-weight: 700;
          background: linear-gradient(135deg, #1a1a1a 0%, #3a3a3a 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          letter-spacing: -0.02em;
        }
        
        .logo-dot {
          font-size: 1.75rem;
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
        
        :global(body.dark) .logo-dot {
          background: linear-gradient(135deg, #fb7185 0%, #f43f5e 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        .logo:hover {
          opacity: 0.85;
          transform: scale(0.98);
        }
        
        /* Actions */
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        /* Theme Toggle */
        .theme-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          background: transparent;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.3s ease;
        }
        
        :global(body.dark) .theme-toggle {
          border-color: rgba(255, 255, 255, 0.1);
        }
        
        .theme-toggle:hover {
          background: rgba(0, 0, 0, 0.04);
          transform: scale(1.05);
          border-color: rgba(0, 0, 0, 0.15);
        }
        
        :global(body.dark) .theme-toggle:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.2);
        }
        
        /* Explore Trigger */
        .dropdown-wrapper {
          position: relative;
        }
        
        .explore-trigger {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 24px;
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          border: none;
          border-radius: 40px;
          font-size: 0.9rem;
          font-weight: 500;
          color: white;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        :global(body.dark) .explore-trigger {
          background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
          color: #f4f4f5;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        
        .explore-trigger:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
          background: linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%);
        }
        
        :global(body.dark) .explore-trigger:hover {
          background: linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }
        
        .explore-trigger:active {
          transform: translateY(0);
        }
        
        .explore-trigger.active {
          background: linear-gradient(135deg, #e11d48 0%, #f43f5e 100%);
          box-shadow: 0 4px 12px rgba(225, 29, 72, 0.3);
        }
        
        .arrow {
          transition: transform 0.3s ease;
        }
        
        .arrow.rotate {
          transform: rotate(180deg);
        }
        
        /* Dropdown Menu */
        .explore-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 16px;
          min-width: 280px;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.02);
          overflow: hidden;
          animation: dropdownFade 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 1000;
        }
        
        @keyframes dropdownFade {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        :global(body.dark) .explore-dropdown {
          background: #1a1a1f;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05);
        }
        
        .dropdown-header {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          background: rgba(0, 0, 0, 0.02);
        }
        
        :global(body.dark) .dropdown-header {
          border-bottom-color: rgba(255, 255, 255, 0.06);
          background: rgba(255, 255, 255, 0.02);
        }
        
        .dropdown-title {
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #71717a;
        }
        
        :global(body.dark) .dropdown-title {
          color: #71717a;
        }
        
        .dropdown-items {
          display: flex;
          flex-direction: column;
          padding: 8px;
          gap: 4px;
        }
        
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          border-radius: 14px;
          text-decoration: none;
          transition: all 0.25s ease;
        }
        
        .dropdown-item:hover {
          background: rgba(0, 0, 0, 0.04);
          transform: translateX(4px);
        }
        
        :global(body.dark) .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.06);
        }
        
        .item-icon {
          font-size: 1.2rem;
          width: 28px;
        }
        
        .item-name {
          font-size: 0.9rem;
          font-weight: 500;
          color: #27272a;
          flex: 1;
        }
        
        :global(body.dark) .item-name {
          color: #d4d4d8;
        }
        
        .item-arrow {
          font-size: 0.9rem;
          color: #a1a1aa;
          opacity: 0;
          transform: translateX(-8px);
          transition: all 0.25s ease;
        }
        
        .dropdown-item:hover .item-arrow {
          opacity: 1;
          transform: translateX(0);
          color: #e11d48;
        }
        
        :global(body.dark) .dropdown-item:hover .item-arrow {
          color: #fb7185;
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .container {
            padding: 0 20px;
          }
          
          .logo-text,
          .logo-dot {
            font-size: 1.4rem;
          }
          
          .explore-trigger span {
            display: none;
          }
          
          .explore-trigger {
            padding: 10px 14px;
          }
          
          .explore-dropdown {
            min-width: 240px;
            right: -10px;
          }
        }
        
        @media (max-width: 480px) {
          .logo-text,
          .logo-dot {
            font-size: 1.2rem;
          }
          
          .theme-toggle {
            width: 38px;
            height: 38px;
          }
          
          .explore-trigger {
            padding: 8px 12px;
          }
        }
      `}</style>
    </>
  )
}