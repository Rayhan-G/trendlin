import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function AdminLayout({ children, title }) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in')
    localStorage.removeItem('admin_login_time')
    router.push('/admin/login')
  }

  const navItems = [
    { name: 'Dashboard', icon: '📊', href: '/admin' },
    { name: 'New Post', icon: '✏️', href: '/admin/create' },
    { name: 'All Posts', icon: '📝', href: '/admin/posts' },
    { name: 'Uploads', icon: '📤', href: '/upload' },
  ]

  return (
    <div className="admin-layout">
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Link href="/admin" className="logo">
            <span className="logo-icon">🟣</span>
            <span className="logo-text">trendlin</span>
            <span className="logo-badge">Admin</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${router.pathname === item.href ? 'active' : ''}`}
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

      <main className="main-content">
        <div className="top-bar">
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
          <div className="top-bar-title">
            <h2>{title}</h2>
          </div>
          <div className="top-bar-user">
            <span className="user-avatar">👨‍💻</span>
            <span className="user-name">Admin</span>
          </div>
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
          transition: all 0.3s ease;
          z-index: 100;
        }
        
        :global(body.dark) .sidebar {
          background: #1e293b;
          border-right-color: #334155;
        }
        
        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }
        
        :global(body.dark) .sidebar-header {
          border-bottom-color: #334155;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          font-size: 1.25rem;
          font-weight: 700;
        }
        
        .logo-icon {
          font-size: 1.5rem;
        }
        
        .logo-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        .logo-badge {
          font-size: 0.7rem;
          background: #10b981;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          margin-left: 0.5rem;
        }
        
        .sidebar-nav {
          flex: 1;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .nav-item, .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          text-decoration: none;
          color: #475569;
          transition: all 0.2s;
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        :global(body.dark) .nav-item,
        :global(body.dark) .logout-btn {
          color: #94a3b8;
        }
        
        .nav-item:hover, .logout-btn:hover {
          background: #f1f5f9;
          color: #1e293b;
        }
        
        :global(body.dark) .nav-item:hover,
        :global(body.dark) .logout-btn:hover {
          background: #334155;
          color: white;
        }
        
        .nav-item.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .nav-icon {
          font-size: 1.2rem;
        }
        
        .logout-btn {
          margin: 1.5rem;
          width: auto;
          color: #ef4444;
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
        }
        
        .top-bar {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        
        :global(body.dark) .top-bar {
          background: #1e293b;
          border-bottom-color: #334155;
        }
        
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
        }
        
        .top-bar-title h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
        }
        
        :global(body.dark) .top-bar-title h2 {
          color: #f1f5f9;
        }
        
        .top-bar-user {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .user-avatar {
          font-size: 1.5rem;
        }
        
        .user-name {
          font-weight: 500;
          color: #475569;
        }
        
        :global(body.dark) .user-name {
          color: #94a3b8;
        }
        
        .content-area {
          padding: 2rem;
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }
          
          .sidebar.mobile-open {
            transform: translateX(0);
          }
          
          .main-content {
            margin-left: 0;
          }
          
          .mobile-menu-btn {
            display: block;
          }
          
          .content-area {
            padding: 1rem;
          }
          
          .top-bar {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  )
}