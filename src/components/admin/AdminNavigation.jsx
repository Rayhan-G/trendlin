// src/components/admin/AdminNavigation.jsx (UPDATED with Live Posts)
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  LayoutDashboard, FileText, Calendar, Link as LinkIcon,
  DollarSign, BarChart3, Home, Sparkles, Tv, Plus, Menu, X,
  TrendingUp, FolderOpen, Award, Activity, BarChart2, Clock
} from 'lucide-react';

const AdminNavigation = ({ children }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    const handleRouteChange = () => setIsOpen(false);
    router.events?.on('routeChangeStart', handleRouteChange);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
      router.events?.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events]);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!touchStart || !isOpen) return;
    const touchEnd = e.touches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (diff > 50) {
      setIsOpen(false);
      setTouchStart(null);
    }
  };

  const navItems = [
    // Main Section
    { path: '/admin/dashboard', name: 'Dashboard', icon: LayoutDashboard, section: 'main' },
    { path: '/admin/posts-manager', name: 'All Posts', icon: FileText, section: 'main' },
    { path: '/admin/posts/create', name: 'Create New Post', icon: Plus, section: 'main' },
    
    // Live Posts Section (NEW)
    { path: '/admin/live-posts', name: 'Live Posts (24H)', icon: Clock, section: 'live', badge: '24H' },
    
    // Content Section
    { path: '/admin/content-calendar', name: 'Content Calendar', icon: Calendar, section: 'content' },
    { path: '/admin/post-analytics', name: 'Post Analytics', icon: TrendingUp, section: 'content' },
    { path: '/admin/polls', name: 'Poll Manager', icon: BarChart2, section: 'content' },
    
    // Monetization Section
    { path: '/admin/affiliate', name: 'Affiliate Links', icon: LinkIcon, section: 'monetization' },
    { path: '/admin/revenue', name: 'Revenue', icon: DollarSign, section: 'monetization' },
    { path: '/admin/ads', name: 'Ad Manager', icon: Tv, section: 'monetization' },
    
    // Analytics Section
    { path: '/admin/analytics', name: 'Analytics', icon: Activity, section: 'analytics' },
  ];

  const sections = {
    main: { title: 'Main', items: navItems.filter(item => item.section === 'main') },
    live: { title: 'Live Posts', items: navItems.filter(item => item.section === 'live') },
    content: { title: 'Content', items: navItems.filter(item => item.section === 'content') },
    monetization: { title: 'Monetization', items: navItems.filter(item => item.section === 'monetization') },
    analytics: { title: 'Analytics', items: navItems.filter(item => item.section === 'analytics') },
  };

  const isActive = (path) => {
    if (path === '/admin/posts/create') return router.pathname === '/admin/posts/create';
    if (path === '/admin/posts-manager') return router.pathname === '/admin/posts-manager' || router.pathname.startsWith('/admin/posts/edit/');
    if (path === '/admin/polls') return router.pathname === '/admin/polls';
    if (path === '/admin/live-posts') return router.pathname === '/admin/live-posts';
    return router.pathname === path;
  };

  const goToHomepage = () => {
    window.location.href = '/';
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  return (
    <>
      <button
        className={`menu-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={isMobile ? 20 : 24} /> : <Menu size={isMobile ? 20 : 24} />}
      </button>

      <div 
        className={`side-menu ${isOpen ? 'open' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        aria-hidden={!isOpen}
      >
        <div className="logo-section">
          <div className="logo-icon">
            <Sparkles size={isMobile ? 24 : 28} />
          </div>
          <div className="logo-text">
            <span className="logo-name">trendlin</span>
            <span className="logo-role">Admin Panel</span>
          </div>
        </div>

        <div className="nav-section">
          {Object.entries(sections).map(([key, section]) => section.items.length > 0 && (
            <div key={key} className="nav-group">
              <div className="nav-group-title">{section.title}</div>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="nav-icon"><Icon size={isMobile ? 18 : 20} /></span>
                    <span className="nav-text">{item.name}</span>
                    {item.badge && (
                      <span className="nav-badge">{item.badge}</span>
                    )}
                    {isActive(item.path) && <span className="active-indicator" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        <div className="footer-section">
          <div className="divider"></div>
          <button onClick={goToHomepage} className="nav-link site-link">
            <span className="nav-icon"><Home size={isMobile ? 18 : 20} /></span>
            <span className="nav-text">Visit Website</span>
          </button>
          <button onClick={handleLogout} className="nav-link logout-link">
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>

      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)} aria-hidden="true" />}

      <div className="main-content">
        {children}
      </div>

      <style jsx>{`
        .menu-btn {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
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
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        .menu-btn:active {
          transform: scale(0.95);
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
          overflow-y: auto;
          overflow-x: hidden;
        }

        :global(body.dark) .side-menu {
          background: #1e293b;
        }

        .side-menu.open {
          transform: translateX(0);
        }

        .side-menu::-webkit-scrollbar {
          width: 5px;
        }

        .side-menu::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .side-menu::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 5px;
        }

        .side-menu::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .logo-section {
          padding: 32px 24px;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        :global(body.dark) .logo-section {
          border-bottom-color: #334155;
        }

        .logo-icon {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .logo-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1e293b;
          white-space: nowrap;
        }

        :global(body.dark) .logo-name {
          color: white;
        }

        .logo-role {
          font-size: 0.65rem;
          color: #64748b;
          letter-spacing: 0.5px;
        }

        .nav-section {
          flex: 1;
          padding: 20px 16px;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .nav-group {
          margin-bottom: 24px;
        }

        .nav-group-title {
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #94a3b8;
          padding: 0 12px 8px 12px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          text-decoration: none;
          color: #64748b;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s ease;
          cursor: pointer;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          position: relative;
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

        .active-indicator {
          position: absolute;
          right: 12px;
          width: 4px;
          height: 4px;
          background: #3b82f6;
          border-radius: 50%;
        }

        .nav-badge {
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 0.6rem;
          font-weight: 600;
          color: white;
          margin-left: auto;
        }

        .logout-link:hover {
          background: #fef2f2;
          color: #ef4444;
        }

        .nav-icon {
          width: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .nav-text {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .footer-section {
          padding: 16px 16px 24px 16px;
          border-top: 1px solid #f0f0f0;
          flex-shrink: 0;
        }

        :global(body.dark) .footer-section {
          border-top-color: #334155;
        }

        .divider {
          height: 1px;
          background: #f0f0f0;
          margin-bottom: 16px;
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
          transition: margin 0.3s ease;
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
            width: 85%;
            max-width: 300px;
          }

          .logo-section {
            padding: 24px 20px;
          }

          .logo-icon {
            width: 40px;
            height: 40px;
          }

          .logo-icon svg {
            width: 20px;
            height: 20px;
          }

          .logo-name {
            font-size: 1rem;
          }

          .nav-section {
            padding: 16px 12px;
          }

          .nav-group-title {
            font-size: 0.65rem;
            padding: 0 10px 6px 10px;
          }

          .nav-link {
            padding: 8px 12px;
            gap: 10px;
            font-size: 0.8rem;
          }

          .nav-icon {
            width: 18px;
          }

          .footer-section {
            padding: 12px 12px 20px 12px;
          }
        }

        @media (max-width: 480px) {
          .menu-btn {
            bottom: 15px;
            right: 15px;
            width: 44px;
            height: 44px;
          }

          .side-menu {
            width: 90%;
            max-width: 280px;
          }

          .logo-section {
            padding: 20px 16px;
            gap: 10px;
          }

          .logo-icon {
            width: 36px;
            height: 36px;
          }

          .logo-name {
            font-size: 0.9rem;
          }

          .logo-role {
            font-size: 0.6rem;
          }

          .nav-link {
            padding: 7px 10px;
            gap: 8px;
          }

          .nav-text {
            font-size: 0.75rem;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .menu-btn {
            bottom: 25px;
            right: 25px;
            width: 52px;
            height: 52px;
          }

          .side-menu {
            width: 300px;
          }

          .nav-link:hover {
            transform: translateX(2px);
          }
        }

        @media (min-width: 1025px) {
          .menu-btn {
            display: flex;
          }
        }

        @media (max-width: 768px) and (orientation: landscape) {
          .side-menu {
            overflow-y: auto;
          }

          .logo-section {
            padding: 16px 20px;
          }

          .nav-section {
            padding: 12px 12px;
          }

          .nav-group {
            margin-bottom: 16px;
          }
        }

        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .menu-btn {
            box-shadow: 0 2px 10px rgba(59, 130, 246, 0.4);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .side-menu,
          .menu-btn,
          .nav-link,
          .overlay {
            transition: none;
          }
        }

        @media (hover: none) and (pointer: coarse) {
          .nav-link:hover {
            transform: none;
          }
          
          .menu-btn:active {
            transform: scale(0.95);
          }
        }
      `}</style>
    </>
  );
};

export default AdminNavigation;