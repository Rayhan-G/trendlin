import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  LayoutDashboard, FileText, Calendar, Link as LinkIcon,
  DollarSign, BarChart3, Home, Sparkles, Tv, Plus, Menu, X,
  TrendingUp, FolderOpen, Award, Activity
} from 'lucide-react';

const AdminNavigation = ({ children }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    // Main Section
    { path: '/admin/dashboard', name: 'Dashboard', icon: LayoutDashboard, section: 'main' },
    { path: '/admin/posts-manager', name: 'All Posts', icon: FileText, section: 'main' },
    { path: '/admin/posts/create', name: 'Create New Post', icon: Plus, section: 'main' },
    
    // Content Section
    { path: '/admin/content-calendar', name: 'Content Calendar', icon: Calendar, section: 'content' },
    { path: '/admin/post-analytics', name: 'Post Analytics', icon: TrendingUp, section: 'content' },
    
    // Monetization Section
    { path: '/admin/affiliate', name: 'Affiliate Links', icon: LinkIcon, section: 'monetization' },
    { path: '/admin/revenue', name: 'Revenue', icon: DollarSign, section: 'monetization' },
    { path: '/admin/ads', name: 'Ad Manager', icon: Tv, section: 'monetization' },
    
    // Analytics Section
    { path: '/admin/analytics', name: 'Analytics', icon: Activity, section: 'analytics' },
  ];

  const sections = {
    main: { title: 'Main', items: navItems.filter(item => item.section === 'main') },
    content: { title: 'Content', items: navItems.filter(item => item.section === 'content') },
    monetization: { title: 'Monetization', items: navItems.filter(item => item.section === 'monetization') },
    analytics: { title: 'Analytics', items: navItems.filter(item => item.section === 'analytics') },
  };

  const isActive = (path) => {
    if (path === '/admin/posts/create') return router.pathname === '/admin/posts/create';
    if (path === '/admin/posts-manager') return router.pathname === '/admin/posts-manager' || router.pathname.startsWith('/admin/posts/edit/');
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
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`side-menu ${isOpen ? 'open' : ''}`}>
        <div className="logo-section">
          <div className="logo-icon"><Sparkles size={28} /></div>
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
                    <span className="nav-icon"><Icon size={20} /></span>
                    <span className="nav-text">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        <div className="footer-section">
          <div className="divider"></div>
          <button onClick={goToHomepage} className="nav-link site-link">
            <span className="nav-icon"><Home size={20} /></span>
            <span className="nav-text">Visit Website</span>
          </button>
          <button onClick={handleLogout} className="nav-link logout-link">
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>

      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)} />}

      <div className="main-content">
        {children}
      </div>

      <style jsx>{`
        .menu-btn {
          position: fixed; bottom: 30px; right: 30px; width: 56px; height: 56px;
          border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white; border: none; cursor: pointer; display: flex; align-items: center;
          justify-content: center; z-index: 1001; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .menu-btn:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4); }
        .menu-btn.open { background: #ef4444; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3); }
        .menu-btn.open:hover { background: #dc2626; }
        .side-menu {
          position: fixed; top: 0; right: 0; width: 320px; height: 100vh;
          background: white; transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000; display: flex; flex-direction: column; box-shadow: -5px 0 30px rgba(0, 0, 0, 0.1);
        }
        :global(body.dark) .side-menu { background: #1e293b; }
        .side-menu.open { transform: translateX(0); }
        .logo-section { padding: 32px 24px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; gap: 12px; }
        :global(body.dark) .logo-section { border-bottom-color: #334155; }
        .logo-icon { width: 44px; height: 44px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; }
        .logo-text { display: flex; flex-direction: column; gap: 2px; }
        .logo-name { font-size: 1.1rem; font-weight: 700; color: #1e293b; }
        :global(body.dark) .logo-name { color: white; }
        .logo-role { font-size: 0.65rem; color: #64748b; letter-spacing: 0.5px; }
        .nav-section { flex: 1; padding: 20px 16px; overflow-y: auto; }
        .nav-group { margin-bottom: 24px; }
        .nav-group-title { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; padding: 0 12px 8px 12px; }
        .nav-link {
          display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px;
          text-decoration: none; color: #64748b; font-size: 0.85rem; font-weight: 500;
          transition: all 0.2s ease; cursor: pointer; background: none; border: none; width: 100%; text-align: left;
        }
        :global(body.dark) .nav-link { color: #94a3b8; }
        .nav-link:hover { background: #f8fafc; color: #1e293b; transform: translateX(4px); }
        :global(body.dark) .nav-link:hover { background: #334155; color: white; }
        .nav-link.active { background: #eff6ff; color: #3b82f6; }
        :global(body.dark) .nav-link.active { background: #1e3a5f; color: #60a5fa; }
        .logout-link:hover { background: #fef2f2; color: #ef4444; }
        .nav-icon { width: 20px; display: flex; align-items: center; justify-content: center; }
        .nav-text { flex: 1; }
        .footer-section { padding: 16px 16px 24px 16px; border-top: 1px solid #f0f0f0; }
        :global(body.dark) .footer-section { border-top-color: #334155; }
        .divider { height: 1px; background: #f0f0f0; margin-bottom: 16px; }
        .overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.4); z-index: 999; animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @media (max-width: 768px) {
          .menu-btn { bottom: 20px; right: 20px; width: 50px; height: 50px; }
          .side-menu { width: 100%; max-width: 280px; }
          .logo-section { padding: 24px 20px; }
          .nav-section { padding: 16px 12px; }
          .nav-link { padding: 8px 12px; gap: 10px; }
        }
        .main-content { min-height: 100vh; background: #f8fafc; }
        :global(body.dark) .main-content { background: #0f172a; }
      `}</style>
    </>
  );
};

export default AdminNavigation;