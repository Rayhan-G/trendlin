// src/pages/bookmarks/index.jsx
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  Bookmark, Star, Trash2, Edit2, MoreHorizontal, 
  Search, Grid3x3, List, ArrowUp, ArrowDown, Download, X, AlertTriangle 
} from 'lucide-react';

export default function BookmarksPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [layout, setLayout] = useState('grid');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showMenu, setShowMenu] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        
        if (!data.authenticated) {
          router.push('/');
          return;
        }
        
        setUser(data.user);
        
        const { data: bookmarksData, error } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', data.user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setBookmarks(bookmarksData || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [router]);

  const handleDelete = async (id) => {
    const { error } = await supabase.from('bookmarks').delete().eq('id', id);
    if (!error) {
      setBookmarks(prev => prev.filter(b => b.id !== id));
      setShowDeleteConfirm(null);
      setShowMenu(null);
      
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message: 'Bookmark removed', type: 'success', duration: 3000 }
      }));
    }
  };

  const filteredBookmarks = bookmarks
    .filter(b => b.post_title?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let aVal = sortBy === 'created_at' ? new Date(a.created_at).getTime() : (a.post_title || '');
      let bVal = sortBy === 'created_at' ? new Date(b.created_at).getTime() : (b.post_title || '');
      return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });

  const handleExport = () => {
    const data = JSON.stringify({ bookmarks: filteredBookmarks, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookmarks-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <style jsx>{`
          .loading-state {
            min-height: 60vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e2e8f0;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="bookmarks-page">
      <div className="bookmarks-container">
        {/* Header */}
        <div className="page-header">
          <Link href="/" className="back-link">
            ← Back to Home
          </Link>
          <div className="header-title">
            <Bookmark className="title-icon" />
            <h1>My Bookmarks</h1>
          </div>
          <button onClick={handleExport} className="export-btn">
            <Download size={16} />
            Export
          </button>
        </div>

        {/* Controls */}
        <div className="controls-bar">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="view-controls">
            <button
              onClick={() => setLayout('grid')}
              className={`view-btn ${layout === 'grid' ? 'active' : ''}`}
            >
              <Grid3x3 size={18} />
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`view-btn ${layout === 'list' ? 'active' : ''}`}
            >
              <List size={18} />
            </button>
          </div>

          <div className="sort-controls">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="created_at">Date Saved</option>
              <option value="post_title">Title</option>
            </select>
            <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
              {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            </button>
          </div>
        </div>

        {/* Bookmarks Count */}
        <div className="results-count">
          {filteredBookmarks.length} {filteredBookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
        </div>

        {/* Bookmarks Grid/List - FIXED OVERFLOW */}
        {filteredBookmarks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔖</div>
            <h3>No bookmarks yet</h3>
            <p>Save your favorite posts by clicking the bookmark button on any article.</p>
            <Link href="/" className="browse-link">Browse posts →</Link>
          </div>
        ) : (
          <div className={`bookmarks-${layout}`}>
            {filteredBookmarks.map((bookmark) => (
              <div key={bookmark.id} className={`bookmark-card ${layout}`}>
                <Link href={`/post/${bookmark.post_slug || bookmark.post_id}`} className="card-link">
                  {bookmark.featured_image_url && layout === 'grid' && (
                    <div className="card-image">
                      <img src={bookmark.featured_image_url} alt={bookmark.post_title} />
                    </div>
                  )}
                  <div className="card-body">
                    <div className="stars">
                      {[1,2,3,4,5].map(l => (
                        <Star key={l} size={14} className={l <= (bookmark.importance_level || 3) ? 'star-filled' : 'star-empty'} />
                      ))}
                    </div>
                    <h3>{bookmark.post_title}</h3>
                    {layout === 'list' && (
                      <p>{bookmark.post_excerpt?.substring(0, 120)}...</p>
                    )}
                    <div className="card-meta">
                      <span>{formatDistanceToNow(new Date(bookmark.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </Link>
                <div className="card-actions">
                  <button 
                    onClick={() => setShowMenu(showMenu === bookmark.id ? null : bookmark.id)}
                    className="menu-trigger"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  {showMenu === bookmark.id && (
                    <div className="menu-dropdown">
                      <button onClick={() => {
                        setShowMenu(null);
                        // Edit functionality
                      }}>
                        <Edit2 size={14} /> Edit
                      </button>
                      <button onClick={() => setShowDeleteConfirm(bookmark.id)} className="danger">
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">🗑️</div>
            <h3>Delete Bookmark?</h3>
            <p>This action cannot be undone.</p>
            <div className="modal-buttons">
              <button onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} className="danger">Delete</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .bookmarks-page {
          min-height: calc(100vh - 64px);
          background: #f8fafc;
          padding: 24px;
        }
        
        .bookmarks-container {
          max-width: 1400px;
          margin: 0 auto;
        }
        
        /* Header */
        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .back-link {
          color: #64748b;
          text-decoration: none;
          font-size: 14px;
          padding: 8px 16px;
          background: white;
          border-radius: 12px;
          transition: all 0.2s;
        }
        
        .back-link:hover {
          background: #f1f5f9;
          color: #1e293b;
        }
        
        .header-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .title-icon {
          width: 32px;
          height: 32px;
          color: #3b82f6;
        }
        
        .header-title h1 {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }
        
        .export-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .export-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }
        
        /* Controls Bar */
        .controls-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 20px;
          align-items: center;
        }
        
        .search-box {
          flex: 1;
          min-width: 200px;
          display: flex;
          align-items: center;
          gap: 10px;
          background: white;
          padding: 10px 16px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }
        
        .search-box input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 14px;
          background: transparent;
        }
        
        .view-controls {
          display: flex;
          gap: 4px;
          background: white;
          padding: 4px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }
        
        .view-btn {
          padding: 6px 12px;
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          color: #94a3b8;
          transition: all 0.2s;
        }
        
        .view-btn.active {
          background: #3b82f6;
          color: white;
        }
        
        .sort-controls {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        
        .sort-controls select {
          padding: 8px 12px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 13px;
        }
        
        .sort-controls button {
          padding: 8px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          cursor: pointer;
        }
        
        .results-count {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        /* GRID LAYOUT - FIXED NO OVERFLOW */
        .bookmarks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        /* LIST LAYOUT */
        .bookmarks-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        /* BOOKMARK CARD */
        .bookmark-card {
          position: relative;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.2s;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        
        .bookmark-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }
        
        .bookmark-card.list {
          display: flex;
        }
        
        .card-link {
  text-decoration: none;
          color: inherit;
          display: block;
          flex: 1;
        }
        
        .card-image {
          height: 160px;
          overflow: hidden;
        }
        
        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .card-body {
          padding: 16px;
        }
        
        .stars {
          display: flex;
          gap: 2px;
          margin-bottom: 8px;
        }
        
        .star-filled {
          color: #fbbf24;
          fill: #fbbf24;
        }
        
        .star-empty {
          color: #cbd5e1;
        }
        
        .card-body h3 {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 8px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .card-body p {
          font-size: 13px;
          color: #64748b;
          margin: 0 0 12px;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .card-meta {
          font-size: 11px;
          color: #94a3b8;
        }
        
        .card-actions {
          position: absolute;
          top: 12px;
          right: 12px;
        }
        
        .menu-trigger {
          background: rgba(255,255,255,0.9);
          border: none;
          padding: 6px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
        }
        
        .menu-dropdown {
          position: absolute;
          top: 36px;
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border: 1px solid #e2e8f0;
          min-width: 120px;
          z-index: 10;
          overflow: hidden;
        }
        
        .menu-dropdown button {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 14px;
          background: white;
          border: none;
          font-size: 13px;
          cursor: pointer;
          text-align: left;
        }
        
        .menu-dropdown button:hover {
          background: #f8fafc;
        }
        
        .menu-dropdown button.danger {
          color: #ef4444;
        }
        
        .menu-dropdown button.danger:hover {
          background: #fef2f2;
        }
        
        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 24px;
        }
        
        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }
        
        .empty-state h3 {
          font-size: 20px;
          color: #0f172a;
          margin: 0 0 8px;
        }
        
        .empty-state p {
          color: #64748b;
          margin-bottom: 24px;
        }
        
        .browse-link {
          display: inline-block;
          padding: 10px 24px;
          background: #3b82f6;
          color: white;
          text-decoration: none;
          border-radius: 40px;
          font-size: 14px;
        }
        
        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal {
          background: white;
          border-radius: 24px;
          padding: 32px;
          text-align: center;
          max-width: 320px;
          width: 90%;
        }
        
        .modal-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        .modal h3 {
          margin: 0 0 8px;
          font-size: 20px;
        }
        
        .modal p {
          color: #64748b;
          margin-bottom: 24px;
        }
        
        .modal-buttons {
          display: flex;
          gap: 12px;
        }
        
        .modal-buttons button {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .modal-buttons button:first-child {
          background: #f1f5f9;
        }
        
        .modal-buttons button.danger {
          background: #ef4444;
          color: white;
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .bookmarks-page {
            padding: 16px;
          }
          
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .controls-bar {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-box {
            width: 100%;
          }
          
          .view-controls, .sort-controls {
            justify-content: space-between;
          }
          
          .bookmarks-grid {
            grid-template-columns: 1fr;
          }
          
          .bookmark-card.list {
            flex-direction: column;
          }
        }
        
        /* Dark mode */
        :global(.dark) .bookmarks-page {
          background: #0f172a;
        }
        
        :global(.dark) .back-link,
        :global(.dark) .search-box,
        :global(.dark) .view-controls,
        :global(.dark) .sort-controls select,
        :global(.dark) .sort-controls button,
        :global(.dark) .bookmark-card,
        :global(.dark) .empty-state {
          background: #1e293b;
          border-color: #334155;
        }
        
        :global(.dark) .header-title h1,
        :global(.dark) .card-body h3,
        :global(.dark) .empty-state h3 {
          color: #f1f5f9;
        }
        
        :global(.dark) .back-link,
        :global(.dark) .card-meta,
        :global(.dark) .results-count,
        :global(.dark) .empty-state p {
          color: #94a3b8;
        }
        
        :global(.dark) .search-box input {
          color: #f1f5f9;
        }
        
        :global(.dark) .menu-trigger,
        :global(.dark) .menu-dropdown button {
          background: #334155;
          color: #f1f5f9;
        }
      `}</style>
    </div>
  );
}