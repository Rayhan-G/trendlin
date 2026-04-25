import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  LayoutDashboard, FileText, Calendar, Link as LinkIcon,
  DollarSign, BarChart3, Home, Sparkles, Tv, Plus, Menu, X
} from 'lucide-react';

const AdminNavigation = ({ children }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check using your API instead of localStorage
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        
        console.log('Navigation auth check:', data);
        
        if (data.authenticated && data.user?.is_admin === true) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          // Only redirect if not on login page
          if (router.pathname !== '/admin/login') {
            router.push('/');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsLoggedIn(false);
        if (router.pathname !== '/admin/login') {
          router.push('/');
        }
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, [router.pathname]);

  const navItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/posts-manager', name: 'Posts', icon: FileText },
    { path: '/admin/posts/create', name: 'New Post', icon: Plus },
    { path: '/admin/content-calendar', name: 'Calendar', icon: Calendar },
    { path: '/admin/post-analytics', name: 'Analytics', icon: BarChart3 },
    { path: '/admin/affiliate', name: 'Affiliate', icon: LinkIcon },
    { path: '/admin/revenue', name: 'Revenue', icon: DollarSign },
    { path: '/admin/ads', name: 'Ads', icon: Tv },
  ];

  const isActive = (path) => {
    if (path === '/admin/posts/create') {
      return router.pathname === '/admin/posts/create';
    }
    return router.pathname === path;
  };

  const goToHomepage = () => window.location.href = '/';

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isLoggedIn) return null;

  return (
    <>
      <button
        className={`menu-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`side-menu ${isOpen ? 'open' : ''}`}>
        <div className="logo-section">
          <div className="logo-icon">
            <Sparkles size={28} />
          </div>
          <div className="logo-text">
            <span className="logo-name">trendlin</span>
            <span className="logo-role">Admin Panel</span>
          </div>
        </div>

        <div className="nav-section">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <span className="nav-icon">
                  <Icon size={20} />
                </span>
                <span className="nav-text">{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="footer-section">
          <div className="divider"></div>
          <button onClick={goToHomepage} className="nav-link site-link">
            <span className="nav-icon">
              <Home size={20} />
            </span>
            <span className="nav-text">Visit Website</span>
          </button>
        </div>
      </div>

      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)} />}

      <main className="main-content">
        {children}
      </main>

      <style jsx>{`
        .menu-btn {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #3b82f6;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1001;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .menu-btn:hover {
          transform: scale(1.08);
          background: #2563eb;
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        .menu-btn.open {
          background: #ef4444;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        }

        .menu-btn.open:hover {
          background: #dc2626;
        }

        .side-menu {
          position: fixed;
          top: 0;
          right: 0;
          width: 320px;
          height: 100vh;
          background: white;
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          box-shadow: -5px 0 30px rgba(0, 0, 0, 0.1);
        }

        :global(body.dark) .side-menu {
          background: #1e293b;
        }

        .side-menu.open {
          transform: translateX(0);
        }

        .logo-section {
          padding: 40px 28px;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        :global(body.dark) .logo-section {
          border-bottom-color: #334155;
        }

        .logo-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .logo-name {
          font-size: 1.2rem;
          font-weight: 700;
          color: #1e293b;
        }

        :global(body.dark) .logo-name {
          color: white;
        }

        .logo-role {
          font-size: 0.7rem;
          color: #64748b;
          letter-spacing: 0.5px;
        }

        :global(body.dark) .logo-role {
          color: #94a3b8;
        }

        .nav-section {
          flex: 1;
          padding: 32px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 20px;
          border-radius: 14px;
          text-decoration: none;
          color: #64748b;
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.2s ease;
          cursor: pointer;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
        }

        :global(body.dark) .nav-link {
          color: #94a3b8;
        }

        .nav-link:hover {
          background: #f8fafc;
          color: #1e293b;
          transform: translateX(4px);
        }

        :global(body.dark) .nav-link:hover {
          background: #334155;
          color: white;
        }

        .nav-link.active {
          background: #eff6ff;
          color: #3b82f6;
        }

        :global(body.dark) .nav-link.active {
          background: #1e3a5f;
          color: #60a5fa;
        }

        .nav-icon {
          width: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-text {
          flex: 1;
        }

        .footer-section {
          padding: 24px 20px 32px 20px;
          margin-top: auto;
        }

        .divider {
          height: 1px;
          background: #f0f0f0;
          margin-bottom: 24px;
        }

        :global(body.dark) .divider {
          background: #334155;
        }

        .site-link {
          color: #64748b;
        }

        .site-link:hover {
          background: #f8fafc;
          color: #3b82f6;
        }

        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 999;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .main-content {
          min-height: 100vh;
          background: #f8fafc;
        }

        :global(body.dark) .main-content {
          background: #0f172a;
        }

        @media (max-width: 768px) {
          .menu-btn {
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
          }

          .side-menu {
            width: 100%;
            max-width: 300px;
          }

          .logo-section {
            padding: 32px 24px;
          }

          .logo-icon {
            width: 44px;
            height: 44px;
          }

          .logo-name {
            font-size: 1.1rem;
          }

          .nav-section {
            padding: 28px 16px;
            gap: 8px;
          }

          .nav-link {
            padding: 12px 16px;
            gap: 14px;
          }

          .footer-section {
            padding: 20px 16px 28px 16px;
          }
        }

        .side-menu {
          overflow-y: auto;
        }

        .side-menu::-webkit-scrollbar {
          width: 4px;
        }

        .side-menu::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        .side-menu::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        :global(body.dark) .side-menu::-webkit-scrollbar-track {
          background: #334155;
        }

        :global(body.dark) .side-menu::-webkit-scrollbar-thumb {
          background: #475569;
        }
      `}</style>
    </>
  );
};

export default AdminNavigation;