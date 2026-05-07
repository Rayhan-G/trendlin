// src/pages/bookmarks/index.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';
import debounce from 'lodash/debounce';

// ============================================
// ICON IMPORTS (keeping only what we need)
// ============================================
import {
  Bookmark, BookmarkCheck, Loader2, FolderPlus, Star, MoreHorizontal,
  Trash2, Edit2, X, Check, Plus, Search, Grid3x3, List,
  Clock, AlertTriangle, RefreshCw, Download, Upload, CheckCircle2,
  SlidersHorizontal, ArrowUp, ArrowDown, Menu
} from 'lucide-react';

// ============================================
// CUSTOM HOOKS
// ============================================

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch { return initialValue; }
  });
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch { }
  };
  return [storedValue, setValue];
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function BookmarksPage() {
  const router = useRouter();
  
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookmark, setSelectedBookmark] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  const [filter, setFilter] = useState({
    search: '',
    sortBy: 'created_at', 
    sortOrder: 'desc'
  });
  const [view, setView] = useLocalStorage('bookmark-view', {
    layout: 'grid'
  });
  
  const debouncedSearch = useDebounce(filter.search, 300);

  // ============================================
  // FETCH USER AND BOOKMARKS
  // ============================================

  useEffect(() => {
    const fetchUserAndBookmarks = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        
        if (!data.authenticated) {
          router.push('/');
          return;
        }
        
        setUser(data.user);
        await fetchBookmarks(data.user.id);
      } catch (error) {
        console.error('Error:', error);
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Failed to load bookmarks', type: 'error', duration: 3000 }
        }));
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndBookmarks();
  }, [router]);

  const fetchBookmarks = async (userId) => {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setBookmarks(data || []);
  };

  // ============================================
  // FILTERED BOOKMARKS
  // ============================================

  const filteredBookmarks = useMemo(() => {
    let filtered = [...bookmarks];

    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(b => 
        b.post_title.toLowerCase().includes(searchLower) ||
        (b.post_excerpt && b.post_excerpt.toLowerCase().includes(searchLower))
      );
    }

    filtered.sort((a, b) => {
      let aVal = a[filter.sortBy];
      let bVal = b[filter.sortBy];
      if (filter.sortBy === 'created_at') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      return filter.sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });

    return filtered;
  }, [bookmarks, filter, debouncedSearch]);

  // ============================================
  // DELETE BOOKMARK - FIXED
  // ============================================
  const handleDeleteBookmark = async (id) => {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id);
    
    if (error) {
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message: 'Failed to delete bookmark', type: 'error', duration: 3000 }
      }));
      return;
    }
    
    setBookmarks(prev => prev.filter(b => b.id !== id));
    setShowDeleteConfirm(null);
    
    // Notify bookmark buttons on other pages to update
    const deletedBookmark = bookmarks.find(b => b.id === id);
    if (deletedBookmark) {
      window.dispatchEvent(new CustomEvent('bookmarkUpdated', { 
        detail: { postId: deletedBookmark.post_id, isBookmarked: false }
      }));
    }
    
    window.dispatchEvent(new CustomEvent('showToast', { 
      detail: { message: 'Bookmark removed', type: 'success', duration: 3000 }
    }));
  };

  const handleUpdateBookmark = async (id, updates) => {
    const { error } = await supabase
      .from('bookmarks')
      .update({ 
        importance_level: updates.importance_level, 
        notes: updates.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message: 'Failed to update bookmark', type: 'error', duration: 3000 }
      }));
      return;
    }
    
    setBookmarks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    setShowEditModal(false);
    
    window.dispatchEvent(new CustomEvent('showToast', { 
      detail: { message: 'Bookmark updated', type: 'success', duration: 3000 }
    }));
  };

  const handleExport = () => {
    const exportData = { 
      bookmarks: filteredBookmarks, 
      exportDate: new Date().toISOString(),
      totalCount: bookmarks.length
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookmarks-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    window.dispatchEvent(new CustomEvent('showToast', { 
      detail: { message: `${bookmarks.length} bookmarks exported`, type: 'success', duration: 3000 }
    }));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="spinner" />
        <style jsx>{`
          .loading-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f5f5f5;
          }
          .spinner {
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            color: #3b82f6;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
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
          <div className="header-left">
            <Link href="/" className="back-button">
              ← Back to Home
            </Link>
          </div>
          <div className="header-center">
            <div className="logo-icon">
              <Bookmark className="w-5 h-5" />
            </div>
            <h1>My Bookmarks</h1>
            <p className="bookmark-count">{bookmarks.length} saved {bookmarks.length === 1 ? 'post' : 'posts'}</p>
          </div>
          <div className="header-right">
            <button onClick={handleExport} className="export-btn" title="Export bookmarks">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search your bookmarks..."
              value={filter.search}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              className="search-input"
            />
          </div>
          
          <div className="view-controls">
            <button
              onClick={() => setView(prev => ({ ...prev, layout: 'grid' }))}
              className={`view-btn ${view.layout === 'grid' ? 'active' : ''}`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView(prev => ({ ...prev, layout: 'list' }))}
              className={`view-btn ${view.layout === 'list' ? 'active' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="sort-section">
          <span className="sort-label">Sort by:</span>
          <select
            value={filter.sortBy}
            onChange={(e) => setFilter(prev => ({ ...prev, sortBy: e.target.value }))}
            className="sort-select"
          >
            <option value="created_at">Date Saved</option>
            <option value="post_title">Title</option>
          </select>
          <button
            onClick={() => setFilter(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
            className="sort-order-btn"
          >
            {filter.sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Bookmarks Grid/List */}
        {filteredBookmarks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔖</div>
            <h2>No bookmarks yet</h2>
            <p>Save your favorite posts by clicking the bookmark button on any article.</p>
            <Link href="/" className="browse-button">
              Browse Posts →
            </Link>
          </div>
        ) : (
          <div className={`bookmarks-${view.layout}`}>
            {filteredBookmarks.map((bookmark) => (
              <React.Fragment key={bookmark.id}>
                {view.layout === 'grid' ? (
                  <BookmarkGridCard
                    bookmark={bookmark}
                    onEdit={() => { setSelectedBookmark(bookmark); setShowEditModal(true); }}
                    onDelete={() => setShowDeleteConfirm(bookmark.id)}
                  />
                ) : (
                  <BookmarkListCard
                    bookmark={bookmark}
                    onEdit={() => { setSelectedBookmark(bookmark); setShowEditModal(true); }}
                    onDelete={() => setShowDeleteConfirm(bookmark.id)}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedBookmark && (
        <EditBookmarkModal
          bookmark={selectedBookmark}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateBookmark}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          onConfirm={() => handleDeleteBookmark(showDeleteConfirm)}
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}

      <style jsx>{`
        .bookmarks-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
          padding: 20px;
        }
        .bookmarks-container {
          max-width: 1400px;
          margin: 0 auto;
        }
        
        /* Header Styles */
        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          padding: 24px 32px;
          background: white;
          border-radius: 24px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        .back-button {
          text-decoration: none;
          color: #6b7280;
          font-size: 14px;
          padding: 8px 16px;
          border-radius: 12px;
          background: #f3f4f6;
          transition: all 0.2s;
        }
        .back-button:hover {
          background: #e5e7eb;
          color: #374151;
        }
        .header-center {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .logo-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .header-center h1 {
          margin: 0;
          font-size: 24px;
          color: #1f2937;
        }
        .bookmark-count {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
        }
        .export-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #f3f4f6;
          border: none;
          border-radius: 12px;
          color: #374151;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .export-btn:hover {
          background: #e5e7eb;
        }
        
        /* Search Section */
        .search-section {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }
        .search-wrapper {
          flex: 1;
          position: relative;
        }
        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          color: #9ca3af;
        }
        .search-input {
          width: 100%;
          padding: 12px 16px 12px 48px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }
        .search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        .view-controls {
          display: flex;
          gap: 8px;
          background: white;
          padding: 4px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }
        .view-btn {
          padding: 8px 12px;
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          color: #9ca3af;
          transition: all 0.2s;
        }
        .view-btn.active {
          background: #3b82f6;
          color: white;
        }
        
        /* Sort Section */
        .sort-section {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding: 12px 16px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }
        .sort-label {
          font-size: 13px;
          color: #6b7280;
        }
        .sort-select {
          padding: 6px 12px;
          background: #f3f4f6;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
        }
        .sort-order-btn {
          padding: 6px;
          background: #f3f4f6;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          color: #6b7280;
        }
        
        /* Grid Layout - FIXED OVERFLOW */
        .bookmarks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }
        
        /* List Layout */
        .bookmarks-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: white;
          border-radius: 24px;
          margin-top: 40px;
        }
        .empty-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        .empty-state h2 {
          margin: 0 0 10px;
          color: #1f2937;
        }
        .empty-state p {
          color: #6b7280;
          margin-bottom: 24px;
        }
        .browse-button {
          display: inline-block;
          padding: 12px 28px;
          background: #3b82f6;
          color: white;
          text-decoration: none;
          border-radius: 40px;
          font-weight: 500;
          transition: background 0.2s;
        }
        .browse-button:hover {
          background: #2563eb;
        }
        
        @media (max-width: 768px) {
          .bookmarks-page {
            padding: 12px;
          }
          .page-header {
            padding: 16px;
            flex-direction: column;
            gap: 16px;
          }
          .bookmarks-grid {
            grid-template-columns: 1fr;
          }
          .search-section {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

// ============================================
// GRID VIEW CARD - FIXED LINKS & STYLING
// ============================================

function BookmarkGridCard({ bookmark, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // FIXED: Correct post URL - adjust based on your actual post URL structure
  const postUrl = bookmark.post_slug 
    ? `/post/${bookmark.post_slug}` 
    : `/post/${bookmark.post_id}`;

  return (
    <div className="bookmark-card">
      <Link href={postUrl} className="card-link">
        {bookmark.featured_image_url && (
          <div className="card-image">
            <img src={bookmark.featured_image_url} alt={bookmark.post_title} />
          </div>
        )}
        <div className="card-content">
          <div className="importance-stars">
            {[1, 2, 3, 4, 5].map(level => (
              <Star
                key={level}
                className={`star ${level <= (bookmark.importance_level || 3) ? 'filled' : ''}`}
              />
            ))}
          </div>
          <h3>{bookmark.post_title}</h3>
          <p>{bookmark.post_excerpt?.substring(0, 100)}...</p>
          <div className="card-footer">
            <span className="date">
              Saved {formatDistanceToNow(new Date(bookmark.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </Link>
      <div className="card-actions" ref={menuRef}>
        <button onClick={() => setShowMenu(!showMenu)} className="menu-btn">
          <MoreHorizontal className="w-4 h-4" />
        </button>
        {showMenu && (
          <div className="menu-dropdown">
            <button onClick={onEdit} className="menu-item">
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
            <button onClick={onDelete} className="menu-item delete">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .bookmark-card {
          position: relative;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: all 0.2s;
        }
        .bookmark-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -8px rgba(0,0,0,0.15);
        }
        .card-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }
        .card-image {
          height: 160px;
          overflow: hidden;
          background: #f3f4f6;
        }
        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }
        .bookmark-card:hover .card-image img {
          transform: scale(1.05);
        }
        .card-content {
          padding: 16px;
        }
        .importance-stars {
          display: flex;
          gap: 2px;
          margin-bottom: 8px;
        }
        .star {
          width: 14px;
          height: 14px;
          color: #d1d5db;
        }
        .star.filled {
          color: #fbbf24;
          fill: #fbbf24;
        }
        .card-content h3 {
          margin: 0 0 8px;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .card-content p {
          margin: 0 0 12px;
          font-size: 13px;
          color: #6b7280;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .card-footer {
          display: flex;
          justify-content: flex-start;
        }
        .date {
          font-size: 11px;
          color: #9ca3af;
        }
        .card-actions {
          position: absolute;
          top: 12px;
          right: 12px;
        }
        .menu-btn {
          background: rgba(255,255,255,0.9);
          border: none;
          padding: 6px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          transition: all 0.2s;
        }
        .menu-btn:hover {
          background: white;
          color: #374151;
        }
        .menu-dropdown {
          position: absolute;
          top: 36px;
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border: 1px solid #e5e7eb;
          min-width: 120px;
          z-index: 10;
          overflow: hidden;
        }
        .menu-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 14px;
          background: white;
          border: none;
          font-size: 13px;
          color: #374151;
          cursor: pointer;
          transition: background 0.2s;
          text-align: left;
        }
        .menu-item:hover {
          background: #f3f4f6;
        }
        .menu-item.delete {
          color: #ef4444;
        }
        .menu-item.delete:hover {
          background: #fee2e2;
        }
      `}</style>
    </div>
  );
}

// ============================================
// LIST VIEW CARD
// ============================================

function BookmarkListCard({ bookmark, onEdit, onDelete }) {
  const postUrl = bookmark.post_slug 
    ? `/post/${bookmark.post_slug}` 
    : `/post/${bookmark.post_id}`;

  return (
    <div className="bookmark-list-item">
      <Link href={postUrl} className="list-link">
        <div className="list-content">
          <div className="list-stars">
            {[1, 2, 3, 4, 5].map(level => (
              <Star
                key={level}
                className={`star ${level <= (bookmark.importance_level || 3) ? 'filled' : ''}`}
              />
            ))}
          </div>
          <h3>{bookmark.post_title}</h3>
          <p>{bookmark.post_excerpt?.substring(0, 80)}...</p>
          <span className="list-date">
            Saved {formatDistanceToNow(new Date(bookmark.created_at), { addSuffix: true })}
          </span>
        </div>
      </Link>
      <div className="list-actions">
        <button onClick={onEdit} className="action-btn" title="Edit">
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={onDelete} className="action-btn delete" title="Delete">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <style jsx>{`
        .bookmark-list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
          padding: 16px 20px;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: all 0.2s;
        }
        .bookmark-list-item:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .list-link {
          flex: 1;
          text-decoration: none;
          color: inherit;
        }
        .list-content {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .list-stars {
          display: flex;
          gap: 2px;
        }
        .star {
          width: 14px;
          height: 14px;
          color: #d1d5db;
        }
        .star.filled {
          color: #fbbf24;
          fill: #fbbf24;
        }
        .list-content h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }
        .list-content p {
          margin: 0;
          font-size: 13px;
          color: #6b7280;
        }
        .list-date {
          font-size: 11px;
          color: #9ca3af;
        }
        .list-actions {
          display: flex;
          gap: 8px;
        }
        .action-btn {
          padding: 8px;
          background: #f3f4f6;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.2s;
        }
        .action-btn:hover {
          background: #e5e7eb;
          color: #374151;
        }
        .action-btn.delete:hover {
          background: #fee2e2;
          color: #ef4444;
        }
      `}</style>
    </div>
  );
}

// ============================================
// EDIT BOOKMARK MODAL
// ============================================

function EditBookmarkModal({ bookmark, onClose, onSave }) {
  const [importance, setImportance] = useState(bookmark.importance_level || 3);
  const [notes, setNotes] = useState(bookmark.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    await onSave(bookmark.id, { importance_level: importance, notes });
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Bookmark</h3>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>
        <div className="modal-body">
          <div>
            <label>Importance Level</label>
            <div className="importance-buttons">
              {[1, 2, 3, 4, 5].map(level => (
                <button
                  key={level}
                  onClick={() => setImportance(level)}
                  className={`importance-btn ${importance >= level ? 'active' : ''}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label>Private Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Add your thoughts about this post..."
            />
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="cancel-btn">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="save-btn">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <style jsx>{`
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
        .modal-content {
          background: white;
          border-radius: 24px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow: auto;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
        }
        .modal-header h3 {
          margin: 0;
          font-size: 18px;
        }
        .close-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #9ca3af;
        }
        .modal-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .modal-body label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }
        .importance-buttons {
          display: flex;
          gap: 8px;
        }
        .importance-btn {
          flex: 1;
          padding: 8px;
          background: #f3f4f6;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }
        .importance-btn.active {
          background: #fbbf24;
          color: #78350f;
        }
        textarea {
          width: 100%;
          padding: 12px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          font-size: 14px;
          resize: vertical;
        }
        .modal-footer {
          display: flex;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid #e5e7eb;
        }
        .cancel-btn {
          flex: 1;
          padding: 10px;
          background: #f3f4f6;
          border: none;
          border-radius: 12px;
          cursor: pointer;
        }
        .save-btn {
          flex: 1;
          padding: 10px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 500;
        }
        .save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

// ============================================
// DELETE CONFIRMATION MODAL
// ============================================

function DeleteConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon">🗑️</div>
        <h3>Delete Bookmark?</h3>
        <p>This action cannot be undone.</p>
        <div className="confirm-buttons">
          <button onClick={onCancel} className="cancel-btn">Cancel</button>
          <button onClick={onConfirm} className="delete-btn">Delete</button>
        </div>
      </div>

      <style jsx>{`
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
        .confirm-modal {
          background: white;
          border-radius: 24px;
          padding: 32px;
          text-align: center;
          max-width: 320px;
          width: 90%;
        }
        .confirm-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        .confirm-modal h3 {
          margin: 0 0 8px;
          font-size: 20px;
        }
        .confirm-modal p {
          margin: 0 0 24px;
          color: #6b7280;
        }
        .confirm-buttons {
          display: flex;
          gap: 12px;
        }
        .cancel-btn {
          flex: 1;
          padding: 10px;
          background: #f3f4f6;
          border: none;
          border-radius: 12px;
          cursor: pointer;
        }
        .delete-btn {
          flex: 1;
          padding: 10px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}