import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'

export default function Navbar() {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)
  const [exploreOpen, setExploreOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
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

  // Check admin status on mount
  useEffect(() => {
    checkAdminStatus()
  }, [])

  const checkAdminStatus = () => {
    const isLoggedIn = localStorage.getItem('admin_logged_in')
    const loginTime = localStorage.getItem('admin_login_time')
    
    if (isLoggedIn === 'true' && loginTime) {
      const timeSinceLogin = Date.now() - parseInt(loginTime)
      const twentyFourHours = 24 * 60 * 60 * 1000
      
      if (timeSinceLogin < twentyFourHours) {
        setIsAdmin(true)
      } else {
        localStorage.removeItem('admin_logged_in')
        localStorage.removeItem('admin_login_time')
        setIsAdmin(false)
      }
    } else {
      setIsAdmin(false)
    }
  }

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordError('')

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      })

      const data = await res.json()

      if (data.success) {
        localStorage.setItem('admin_logged_in', 'true')
        localStorage.setItem('admin_login_time', Date.now().toString())
        setIsAdmin(true)
        setShowAdminModal(false)
        setAdminPassword('')
      } else {
        setPasswordError('Invalid password')
      }
    } catch (error) {
      setPasswordError('Network error. Please try again.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in')
    localStorage.removeItem('admin_login_time')
    setIsAdmin(false)
  }

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
      if (event.key === 'Escape') {
        setExploreOpen(false)
        setShowAdminModal(false)
      }
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
              {/* Admin Buttons - Only show when logged in */}
              {isAdmin && (
                <>
                  <Link href="/admin" className="admin-link" title="Admin Dashboard">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M8 7h8M8 12h6M8 17h4" strokeLinecap="round"/>
                    </svg>
                  </Link>
                  <Link href="/admin/create" className="admin-link" title="Write Post">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
                    </svg>
                  </Link>
                  <Link href="/upload" className="admin-link" title="Upload Media">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 3v12m0 0-3-3m3 3 3-3M5 21h14" strokeLinecap="round"/>
                    </svg>
                  </Link>
                  <button onClick={handleLogout} className="admin-link logout" title="Logout">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l4-4-4-4M16 8V4m0 9h4" strokeLinecap="round"/>
                    </svg>
                  </button>
                </>
              )}

              {/* Subtle Admin Access Icon - Always visible */}
              <button
                onClick={() => setShowAdminModal(true)}
                className="admin-access-icon"
                title="Admin Access"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M5 20v-2a7 7 0 0 1 14 0v2" />
                </svg>
              </button>

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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                  <span>Explore</span>
                  <svg 
                    width="10" 
                    height="10" 
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

      {/* Admin Password Modal */}
      {showAdminModal && (
        <div className="modal-overlay" onClick={() => setShowAdminModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-icon">🔐</span>
              <h3>Admin Access</h3>
              <button className="modal-close" onClick={() => setShowAdminModal(false)}>×</button>
            </div>
            <form onSubmit={handleAdminLogin}>
              <div className="modal-body">
                <input
                  type="password"
                  placeholder="Enter admin password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  autoFocus
                  className="password-input"
                />
                {passwordError && <div className="error-message">{passwordError}</div>}
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAdminModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" disabled={passwordLoading} className="submit-btn">
                  {passwordLoading ? 'Verifying...' : 'Access Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
          transition: all 0.3s ease;
        }
        
        .navbar-premium.scrolled {
          background: rgba(255, 255, 255, 0.98);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          border-bottom-color: rgba(0, 0, 0, 0.08);
        }
        
        :global(body.dark) .navbar-premium {
          background: rgba(10, 10, 15, 0.96);
          border-bottom-color: rgba(255, 255, 255, 0.06);
        }
        
        :global(body.dark) .navbar-premium.scrolled {
          background: rgba(10, 10, 15, 0.98);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
          border-bottom-color: rgba(255, 255, 255, 0.08);
        }
        
        .nav-wrapper {
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
          letter-spacing: -0.02em;
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
        
        :global(body.dark) .logo-dot {
          background: linear-gradient(135deg, #fb7185 0%, #f43f5e 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        /* Actions */
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        /* Admin Links - Small and Subtle */
        .admin-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          color: #64748b;
          transition: all 0.2s ease;
          opacity: 0.6;
        }
        
        .admin-link:hover {
          background: rgba(0, 0, 0, 0.05);
          color: #3b82f6;
          opacity: 1;
        }
        
        .admin-link.logout:hover {
          color: #ef4444;
        }
        
        :global(body.dark) .admin-link {
          color: #94a3b8;
        }
        
        :global(body.dark) .admin-link:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        /* Subtle Admin Access Icon */
        .admin-access-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 4px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          opacity: 0.3;
          transition: all 0.2s ease;
        }
        
        .admin-access-icon:hover {
          opacity: 0.7;
          color: #667eea;
        }
        
        :global(body.dark) .admin-access-icon {
          color: #64748b;
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
          transition: all 0.2s ease;
        }
        
        :global(body.dark) .theme-toggle {
          border-color: rgba(255, 255, 255, 0.1);
        }
        
        .theme-toggle:hover {
          background: rgba(0, 0, 0, 0.04);
          border-color: rgba(0, 0, 0, 0.15);
        }
        
        /* Explore Trigger */
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
          transition: all 0.2s ease;
        }
        
        :global(body.dark) .explore-trigger {
          background: #2a2a2a;
          color: #f4f4f5;
        }
        
        .explore-trigger:hover {
          background: #2a2a2a;
        }
        
        .explore-trigger.active {
          background: #e11d48;
        }
        
        .arrow {
          transition: transform 0.2s ease;
        }
        
        .arrow.rotate {
          transform: rotate(180deg);
        }
        
        /* Dropdown Menu */
        .explore-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          min-width: 220px;
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          z-index: 1000;
        }
        
        :global(body.dark) .explore-dropdown {
          background: #1a1a1f;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .dropdown-header {
          padding: 10px 14px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          background: rgba(0, 0, 0, 0.02);
        }
        
        .dropdown-title {
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #71717a;
        }
        
        .dropdown-items {
          display: flex;
          flex-direction: column;
          padding: 4px;
          gap: 2px;
        }
        
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 6px;
          text-decoration: none;
          transition: all 0.15s ease;
        }
        
        .dropdown-item:hover {
          background: rgba(0, 0, 0, 0.04);
        }
        
        .item-icon {
          font-size: 1rem;
          width: 22px;
        }
        
        .item-name {
          font-size: 0.8rem;
          font-weight: 500;
          color: #27272a;
          flex: 1;
        }
        
        :global(body.dark) .item-name {
          color: #d4d4d8;
        }
        
        .item-arrow {
          font-size: 0.75rem;
          color: #a1a1aa;
          opacity: 0;
          transition: opacity 0.15s ease;
        }
        
        .dropdown-item:hover .item-arrow {
          opacity: 1;
        }
        
        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .modal-content {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          animation: modalFadeIn 0.2s ease;
        }
        
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        :global(body.dark) .modal-content {
          background: #1e293b;
        }
        
        .modal-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #e2e8f0;
          position: relative;
        }
        
        :global(body.dark) .modal-header {
          border-bottom-color: #334155;
        }
        
        .modal-icon {
          font-size: 1.25rem;
        }
        
        .modal-header h3 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
          flex: 1;
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #94a3b8;
          padding: 0;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }
        
        .modal-close:hover {
          background: #f1f5f9;
          color: #1e293b;
        }
        
        .modal-body {
          padding: 1.25rem;
        }
        
        .password-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.9rem;
        }
        
        :global(body.dark) .password-input {
          background: #0f172a;
          border-color: #334155;
          color: white;
        }
        
        .password-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .error-message {
          margin-top: 0.75rem;
          color: #ef4444;
          font-size: 0.75rem;
        }
        
        .modal-footer {
          display: flex;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-top: 1px solid #e2e8f0;
          justify-content: flex-end;
        }
        
        :global(body.dark) .modal-footer {
          border-top-color: #334155;
        }
        
        .cancel-btn {
          padding: 8px 16px;
          background: #f1f5f9;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
        }
        
        .submit-btn {
          padding: 8px 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
        }
        
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .container {
            padding: 0 16px;
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