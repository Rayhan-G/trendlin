import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function AdminLayout({ children, title }) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('admin_session_token')
    localStorage.removeItem('admin_session_expiry')
    router.push('/')
  }

  const navItems = [
    { name: 'Dashboard', icon: '📊', href: '/admin' },
    { name: 'Posts Manager', icon: '📝', href: '/admin/posts-manager' },
    { name: 'Content Calendar', icon: '📅', href: '/admin/content-calendar' },
    { name: 'Affiliate', icon: '🔗', href: '/admin/affiliate' },
    { name: 'Revenue', icon: '💰', href: '/admin/revenue' },
    { name: 'Analytics', icon: '📈', href: '/admin/post-analytics' },
    { name: 'Ad Manager', icon: '🎨', href: '/admin/ads' },
    { name: 'New Post', icon: '✏️', href: '/admin/create' },
    { name: 'All Posts', icon: '📋', href: '/admin/posts' },
  ]

  // Close menu when clicking a link on mobile
  const handleNavClick = () => {
    if (isMobile) {
      setMobileMenuOpen(false)
    }
  }

  return (
    <div className="admin-layout">
      {/* Mobile Bottom Navigation Bar */}
      {isMobile && (
        <div className="bottom-nav">
          <Link href="/admin" className={`bottom-nav-item ${router.pathname === '/admin' ? 'active' : ''}`}>
            <span className="bottom-nav-icon">📊</span>
            <span className="bottom-nav-label">Home</span>
          </Link>
          <Link href="/admin/posts-manager" className="bottom-nav-item">
            <span className="bottom-nav-icon">📝</span>
            <span className="bottom-nav-label">Posts</span>
          </Link>
          <button onClick={() => setMobileMenuOpen(true)} className="bottom-nav-item menu-btn">
            <span className="bottom-nav-icon">☰</span>
            <span className="bottom-nav-label">Menu</span>
          </button>
          <Link href="/admin/affiliate" className="bottom-nav-item">
            <span className="bottom-nav-icon">🔗</span>
            <span className="bottom-nav-label">Affiliate</span>
          </Link>
          <Link href="/admin/revenue" className="bottom-nav-item">
            <span className="bottom-nav-icon">💰</span>
            <span className="bottom-nav-label">Revenue</span>
          </Link>
        </div>
      )}

      {/* Sidebar (slide-out on mobile) */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-header-content">
            <Link href="/admin" className="logo" onClick={handleNavClick}>
              <span className="logo-icon">🟣</span>
              <span className="logo-text">trendlin</span>
              <span className="logo-badge">Admin</span>
            </Link>
            {isMobile && (
              <button 
                className="sidebar-close"
                onClick={() => setMobileMenuOpen(false)}
              >
                ×
              </button>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${router.pathname === item.href ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-name">{item.name}</span>
            </Link>
          ))}
        </nav>

        <button onClick={handleLogout} className="logout-btn">
          <span className="nav-icon">🚪</span>
          <span className="nav-name">Logout</span>
        </button>
      </aside>

      {/* Overlay for mobile sidebar */}
      {mobileMenuOpen && isMobile && (
        <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      <main className="main-content">
        <div className="top-bar">
          {!isMobile && (
            <button 
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              ☰
            </button>
          )}
          <div className="top-bar-title">
            <h2>{title}</h2>
          </div>
          <Link href="/" className="view-site-btn">
            <span className="view-site-icon">🌐</span>
            <span className="view-site-text">View Site</span>
          </Link>
        </div>
        
        <div className="content-area">
          {children}
        </div>
      </main>

      <style jsx>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: #f8fafc;
          position: relative;
        }
        
        :global(body.dark) .admin-layout {
          background: #0f172a;
        }
        
        /* Sidebar */
        .sidebar {
          width: 280px;
          background: white;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          transition: transform 0.3s ease;
          z-index: 200;
        }
        
        :global(body.dark) .sidebar {
          background: #1e293b;
          border-right-color: #334155;
        }
        
        .sidebar-header {
          padding: 1.25rem;
          border-bottom: 1px solid #e2e8f0;
        }
        
        :global(body.dark) .sidebar-header {
          border-bottom-color: #334155;
        }
        
        .sidebar-header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          font-size: 1.1rem;
          font-weight: 700;
        }
        
        .logo-icon {
          font-size: 1.3rem;
        }
        
        .logo-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        .logo-badge {
          font-size: 0.65rem;
          background: #10b981;
          color: white;
          padding: 2px 5px;
          border-radius: 4px;
        }
        
        .sidebar-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #64748b;
          padding: 0.25rem 0.5rem;
        }
        
        .sidebar-nav {
          flex: 1;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          overflow-y: auto;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.7rem 0.9rem;
          border-radius: 10px;
          text-decoration: none;
          color: #475569;
          transition: all 0.2s;
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        :global(body.dark) .nav-item {
          color: #94a3b8;
        }
        
        .nav-item:hover {
          background: #f1f5f9;
          color: #1e293b;
        }
        
        :global(body.dark) .nav-item:hover {
          background: #334155;
          color: white;
        }
        
        .nav-item.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .nav-icon {
          font-size: 1.2rem;
          width: 28px;
        }
        
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.7rem 0.9rem;
          margin: 1rem;
          border-radius: 10px;
          text-decoration: none;
          color: #ef4444;
          transition: all 0.2s;
          cursor: pointer;
          border: none;
          background: none;
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        .logout-btn:hover {
          background: #fef2f2;
          color: #dc2626;
        }
        
        :global(body.dark) .logout-btn:hover {
          background: #7f1d1d;
          color: #fca5a5;
        }
        
        /* Main Content */
        .main-content {
          flex: 1;
          margin-left: 280px;
          width: calc(100% - 280px);
        }
        
        .top-bar {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 0.75rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        
        :global(body.dark) .top-bar {
          background: #1e293b;
          border-bottom-color: #334155;
        }
        
        .mobile-menu-btn {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.5rem;
          color: #475569;
        }
        
        .top-bar-title h2 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }
        
        :global(body.dark) .top-bar-title h2 {
          color: #f1f5f9;
        }
        
        .view-site-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.9rem;
          background: #64748b;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-size: 0.8rem;
          transition: all 0.2s;
        }
        
        .view-site-btn:hover {
          background: #475569;
        }
        
        .view-site-icon {
          font-size: 0.9rem;
        }
        
        .content-area {
          padding: 1.5rem;
        }
        
        /* Sidebar Overlay */
        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 150;
        }
        
        /* Bottom Navigation (Mobile Only) */
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-around;
          padding: 0.5rem 0.75rem;
          padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
          z-index: 100;
        }
        
        :global(body.dark) .bottom-nav {
          background: #1e293b;
          border-top-color: #334155;
        }
        
        .bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          text-decoration: none;
          color: #64748b;
          padding: 0.4rem 0.6rem;
          border-radius: 8px;
          transition: all 0.2s;
          cursor: pointer;
          background: none;
          border: none;
          font-size: 0.7rem;
        }
        
        :global(body.dark) .bottom-nav-item {
          color: #94a3b8;
        }
        
        .bottom-nav-item.active {
          color: #667eea;
          background: rgba(102, 126, 234, 0.1);
        }
        
        .bottom-nav-icon {
          font-size: 1.2rem;
        }
        
        .bottom-nav-label {
          font-size: 0.6rem;
          font-weight: 500;
        }
        
        .menu-btn {
          background: #f1f5f9;
        }
        
        :global(body.dark) .menu-btn {
          background: #334155;
        }
        
        /* Mobile Styles */
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
            width: 280px;
          }
          
          .sidebar.mobile-open {
            transform: translateX(0);
          }
          
          .main-content {
            margin-left: 0;
            width: 100%;
            padding-bottom: 65px;
          }
          
          .top-bar {
            padding: 0.6rem 1rem;
          }
          
          .content-area {
            padding: 1rem;
            padding-bottom: 1rem;
          }
          
          .view-site-text {
            display: none;
          }
          
          .view-site-btn {
            padding: 0.4rem 0.7rem;
          }
        }
        
        /* Tablet Styles */
        @media (min-width: 769px) and (max-width: 1024px) {
          .sidebar {
            width: 240px;
          }
          
          .main-content {
            margin-left: 240px;
            width: calc(100% - 240px);
          }
          
          .nav-item {
            padding: 0.6rem 0.8rem;
            font-size: 0.85rem;
          }
          
          .nav-icon {
            font-size: 1.1rem;
            width: 24px;
          }
        }
        
        /* Desktop Styles */
        @media (min-width: 1025px) {
          .mobile-menu-btn {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}