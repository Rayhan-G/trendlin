// ============================================
// FILE: src/pages/bookmarks/index.jsx
// ============================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import Head from 'next/head';
import { formatDistanceToNow, subDays, isAfter } from 'date-fns';

// ============================================
// SVG ICON COMPONENTS (replacing lucide-react)
// ============================================
const Icon = ({ name, className = "w-5 h-5", filled = false }) => {
  const icons = {
    bookmark: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>,
    bookmarkCheck: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" /></svg>,
    star: <svg className={`${className} ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
    more: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>,
    trash: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    edit: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
    x: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
    check: <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
    plus: <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
    search: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    grid: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    list: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
    menu: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
    refresh: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    download: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
    upload: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
    chevronDown: <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
    arrowUp: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>,
    arrowDown: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
    clock: <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    alertTriangle: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
  };
  return icons[name] || null;
};

// ============================================
// FIXED CATEGORIES: Health, Wealth, Tech, Growth, Entertainment, World, Lifestyle
// ============================================
const FIXED_CATEGORIES = [
  { id: 'health', name: 'Health', icon: '❤️', color: '#ef4444' },
  { id: 'wealth', name: 'Wealth', icon: '💰', color: '#f59e0b' },
  { id: 'tech', name: 'Tech', icon: '💻', color: '#3b82f6' },
  { id: 'growth', name: 'Growth', icon: '🌱', color: '#10b981' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#ec4899' },
  { id: 'world', name: 'World', icon: '🌍', color: '#8b5cf6' },
  { id: 'lifestyle', name: 'Lifestyle', icon: '🏝️', color: '#06b6d4' }
];

// Storage keys
const STORAGE_BOOKMARKS = 'readora_bookmarks_v2';

// Helper: Remove bookmarks older than 7 days
const cleanExpiredBookmarks = (bookmarks) => {
  const sevenDaysAgo = subDays(new Date(), 7);
  return bookmarks.filter(b => isAfter(new Date(b.createdAt), sevenDaysAgo));
};

// Sample bookmarks
const getInitialBookmarks = () => {
  const now = new Date();
  const daysAgo = (days) => {
    const d = new Date(now);
    d.setDate(now.getDate() - days);
    return d.toISOString();
  };
  return [
    { id: '1', title: 'The Science of Sleep: Optimize Your Rest', excerpt: 'Deep dive into circadian rhythms and practical tips for better recovery.', slug: 'sleep-optimization', categoryId: 'health', importance: 5, notes: 'Try the 90-minute sleep cycle method', createdAt: daysAgo(2) },
    { id: '2', title: 'Compound Interest: The 8th Wonder of the World', excerpt: 'How small consistent investments create massive wealth over time.', slug: 'compound-interest', categoryId: 'wealth', importance: 5, notes: 'Start early, automate savings', createdAt: daysAgo(4) },
    { id: '3', title: 'AI Agents in 2025: What Developers Must Know', excerpt: 'Latest breakthroughs in autonomous agents and LLM orchestration.', slug: 'ai-agents-2025', categoryId: 'tech', importance: 4, notes: 'Explore LangGraph and AutoGen frameworks', createdAt: daysAgo(3) },
    { id: '4', title: 'Atomic Habits: Tiny Changes, Remarkable Results', excerpt: 'Master the art of habit stacking and environment design.', slug: 'atomic-habits', categoryId: 'growth', importance: 5, notes: 'Identity-based habits are the key', createdAt: daysAgo(6) },
    { id: '5', title: 'Top 10 Movies That Redefined Cinema', excerpt: 'From Inception to Parasite – a curated list of masterpieces.', slug: 'best-movies', categoryId: 'entertainment', importance: 3, notes: 'Weekend watchlist ready', createdAt: daysAgo(8) },
    { id: '6', title: 'Global Inflation Trends 2025', excerpt: 'Central bank policies and their impact on emerging markets.', slug: 'global-inflation', categoryId: 'world', importance: 4, notes: 'Important for portfolio diversification', createdAt: daysAgo(1) },
    { id: '7', title: 'Minimalist Living: Declutter Your Life', excerpt: 'Practical steps to reduce chaos and focus on what matters.', slug: 'minimalist-living', categoryId: 'lifestyle', importance: 4, notes: 'Started with my closet!', createdAt: daysAgo(5) }
  ];
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [filterCategory, setFilterCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewLayout, setViewLayout] = useState('grid'); // grid, list, compact
  const [selectedBookmark, setSelectedBookmark] = useState(null); // for postcard modal
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load data & auto-clean on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_BOOKMARKS);
    let bookmarksData = stored ? JSON.parse(stored) : getInitialBookmarks();
    // Apply 7-day auto-delete
    const cleaned = cleanExpiredBookmarks(bookmarksData);
    if (cleaned.length !== bookmarksData.length) {
      bookmarksData = cleaned;
      localStorage.setItem(STORAGE_BOOKMARKS, JSON.stringify(bookmarksData));
    }
    setBookmarks(bookmarksData);
    setIsHydrated(true);
  }, []);

  // Save to localStorage whenever bookmarks change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_BOOKMARKS, JSON.stringify(bookmarks));
    }
  }, [bookmarks, isHydrated]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Filtered & sorted bookmarks
  const filteredBookmarks = useMemo(() => {
    let filtered = [...bookmarks];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b => 
        b.title.toLowerCase().includes(query) || 
        b.excerpt.toLowerCase().includes(query)
      );
    }
    
    if (filterCategory) {
      filtered = filtered.filter(b => b.categoryId === filterCategory);
    }
    
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      if (sortBy === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      if (sortBy === 'title') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
    
    return filtered;
  }, [bookmarks, searchQuery, filterCategory, sortBy, sortOrder]);

  const getCategory = (categoryId) => {
    return FIXED_CATEGORIES.find(c => c.id === categoryId) || { name: 'Uncategorized', icon: '📄', color: '#94a3b8' };
  };

  // CRUD operations
  const handleDeleteBookmark = (id) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
    setShowDeleteConfirm(null);
    showToast('Bookmark removed', 'success');
  };

  const handleUpdateBookmark = (id, updates) => {
    setBookmarks(prev => prev.map(b => b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b));
    setShowEditModal(false);
    setEditingBookmark(null);
    showToast('Bookmark updated', 'success');
  };

  const handleAddDemoBookmark = () => {
    const newBookmark = {
      id: Date.now().toString(),
      title: 'New: The Future of Digital Reading',
      excerpt: 'Exploring how AI and interactive formats are transforming how we consume written content.',
      slug: `new-post-${Date.now()}`,
      categoryId: 'tech',
      importance: 3,
      notes: 'Added via quick save - will auto-delete after 7 days',
      createdAt: new Date().toISOString()
    };
    setBookmarks(prev => [newBookmark, ...prev]);
    showToast('New bookmark added! Expires in 7 days', 'success');
  };

  const handleExport = () => {
    const data = JSON.stringify({ bookmarks, categories: FIXED_CATEGORIES, exportDate: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `readora-bookmarks-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Bookmarks exported', 'success');
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.bookmarks && Array.isArray(imported.bookmarks)) {
          // Clean imported bookmarks for 7-day rule
          const cleanedImported = cleanExpiredBookmarks(imported.bookmarks);
          setBookmarks(cleanedImported);
          showToast(`Imported ${cleanedImported.length} bookmarks`, 'success');
        } else {
          showToast('Invalid file format', 'error');
        }
      } catch (err) {
        showToast('Failed to import', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const stats = { total: bookmarks.length, categories: FIXED_CATEGORIES.length };

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div><p className="text-gray-500">Loading your library...</p></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Readora • Smart Bookmarks</title>
        <meta name="description" content="Bookmark manager with 7-day auto-delete and postcard views" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-2.5 rounded-full shadow-lg text-sm">
            {toast.message}
          </div>
        )}

        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md text-white">
                  {Icon({ name: 'bookmark', className: "w-5 h-5" })}
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Readora</h1>
                <div className="hidden md:flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                  <span className="text-sm text-gray-500">📚 {stats.total} bookmarks</span>
                  <span className="text-sm text-gray-500">🗂️ {stats.categories} collections</span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">⏱️ 7-day auto-delete</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{Icon({ name: 'search' })}</div>
                  <input type="text" placeholder="Search bookmarks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 bg-gray-100 border-0 rounded-full text-sm w-56 focus:ring-2 focus:ring-blue-400 outline-none" />
                </div>
                
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {['grid', 'list', 'compact'].map(layout => (
                    <button key={layout} onClick={() => setViewLayout(layout)} className={`p-1.5 rounded transition ${viewLayout === layout ? 'bg-white shadow-sm' : ''}`}>
                      {layout === 'grid' && Icon({ name: 'grid' })}
                      {layout === 'list' && Icon({ name: 'list' })}
                      {layout === 'compact' && Icon({ name: 'menu' })}
                    </button>
                  ))}
                </div>
                
                <button onClick={handleAddDemoBookmark} className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition flex items-center gap-1">
                  {Icon({ name: 'plus' })} Add Demo
                </button>
                <button onClick={handleExport} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">{Icon({ name: 'download' })}</button>
                <label className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">
                  {Icon({ name: 'upload' })}
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
              </div>
            </div>
            
            {/* Category Filter Bar - Health, Wealth, Tech, Growth, Entertainment, World, Lifestyle */}
            <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
              <button onClick={() => setFilterCategory(null)} className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${!filterCategory ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                All
              </button>
              {FIXED_CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setFilterCategory(cat.id)} className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1 ${filterCategory === cat.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  <span>{cat.icon}</span> {cat.name}
                </button>
              ))}
              
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-1.5 rounded-full text-sm bg-gray-100 border-0">
                <option value="createdAt">Date added</option>
                <option value="importance">Importance</option>
                <option value="title">Title</option>
              </select>
              <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="p-1.5 rounded-lg bg-gray-100">
                {sortOrder === 'asc' ? Icon({ name: 'arrowUp' }) : Icon({ name: 'arrowDown' })}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {filteredBookmarks.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">{Icon({ name: 'bookmark', className: "w-10 h-10" })}</div>
              <h3 className="text-xl font-semibold mb-2">No bookmarks found</h3>
              <p className="text-gray-500">Bookmarks expire after 7 days automatically. Add a demo bookmark to get started!</p>
              <button onClick={handleAddDemoBookmark} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">+ Add Demo Bookmark</button>
            </div>
          ) : (
            <div className={
              viewLayout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' :
              viewLayout === 'list' ? 'space-y-3' :
              'divide-y divide-gray-200'
            }>
              {filteredBookmarks.map(bookmark => {
                const category = getCategory(bookmark.categoryId);
                const commonProps = { bookmark, category, onView: () => setSelectedBookmark(bookmark), onEdit: () => { setEditingBookmark(bookmark); setShowEditModal(true); }, onDelete: () => setShowDeleteConfirm(bookmark.id) };
                
                if (viewLayout === 'grid') return <GridCard key={bookmark.id} {...commonProps} />;
                if (viewLayout === 'list') return <ListCard key={bookmark.id} {...commonProps} />;
                return <CompactCard key={bookmark.id} {...commonProps} />;
              })}
            </div>
          )}
        </main>

        {/* Postcard Modal */}
        {selectedBookmark && (
          <PostcardModal bookmark={selectedBookmark} category={getCategory(selectedBookmark.categoryId)} onClose={() => setSelectedBookmark(null)} />
        )}

        {/* Edit Modal */}
        {showEditModal && editingBookmark && (
          <EditModal bookmark={editingBookmark} categories={FIXED_CATEGORIES} onClose={() => { setShowEditModal(false); setEditingBookmark(null); }} onSave={handleUpdateBookmark} />
        )}

        {/* Delete Confirm Modal */}
        {showDeleteConfirm && (
          <DeleteConfirmModal onConfirm={() => handleDeleteBookmark(showDeleteConfirm)} onCancel={() => setShowDeleteConfirm(null)} />
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}

// ============================================
// GRID CARD COMPONENT
// ============================================
function GridCard({ bookmark, category, onView, onEdit, onDelete }) {
  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all cursor-pointer overflow-hidden" onClick={onView}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
            <span className="text-xs text-gray-500">{category.icon} {category.name}</span>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition" onClick={e => e.stopPropagation()}>
            <button onClick={onEdit} className="p-1.5 hover:bg-gray-100 rounded-lg">{Icon({ name: 'edit' })}</button>
            <button onClick={onDelete} className="p-1.5 hover:bg-red-50 rounded-lg">{Icon({ name: 'trash' })}</button>
          </div>
        </div>
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{bookmark.title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{bookmark.excerpt}</p>
        {bookmark.notes && (
          <div className="mb-3 p-2 bg-gray-50 rounded-lg text-xs text-gray-500 line-clamp-2">📝 {bookmark.notes}</div>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(level => Icon({ name: 'star', className: "w-3 h-3", filled: level <= bookmark.importance }))}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            {Icon({ name: 'clock' })}
            {formatDistanceToNow(new Date(bookmark.createdAt), { addSuffix: true })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// LIST CARD COMPONENT
// ============================================
function ListCard({ bookmark, category, onView, onEdit, onDelete }) {
  return (
    <div className="group bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition" onClick={onView}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
          <span className="text-xs text-gray-500">{category.icon} {category.name}</span>
          <div className="flex gap-0.5 ml-2">
            {[1,2,3,4,5].map(level => Icon({ name: 'star', className: "w-3 h-3", filled: level <= bookmark.importance }))}
          </div>
        </div>
        <h3 className="font-medium text-gray-900 truncate">{bookmark.title}</h3>
        <p className="text-sm text-gray-500 truncate">{bookmark.excerpt}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(bookmark.createdAt))}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100" onClick={e => e.stopPropagation()}>
          <button onClick={onEdit} className="p-1.5 hover:bg-gray-200 rounded">{Icon({ name: 'edit' })}</button>
          <button onClick={onDelete} className="p-1.5 hover:bg-red-100 rounded">{Icon({ name: 'trash' })}</button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPACT CARD COMPONENT
// ============================================
function CompactCard({ bookmark, category, onView, onEdit, onDelete }) {
  return (
    <div className="group py-3 px-2 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition" onClick={onView}>
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: category.color }} />
      <h4 className="text-sm font-medium text-gray-900 flex-1 truncate">{bookmark.title}</h4>
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(level => Icon({ name: 'star', className: "w-2.5 h-2.5", filled: level <= bookmark.importance }))}
      </div>
      <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(bookmark.createdAt))}</span>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100" onClick={e => e.stopPropagation()}>
        <button onClick={onEdit} className="p-1 hover:bg-gray-200 rounded">{Icon({ name: 'edit' })}</button>
        <button onClick={onDelete} className="p-1 hover:bg-red-100 rounded">{Icon({ name: 'trash' })}</button>
      </div>
    </div>
  );
}

// ============================================
// POSTCARD MODAL (Click on any bookmark)
// ============================================
function PostcardModal({ bookmark, category, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="relative h-32 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
          <div className="absolute top-4 right-4"><button onClick={onClose} className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 text-white">{Icon({ name: 'x' })}</button></div>
          <div className="text-white text-center">
            <div className="text-6xl mb-2">{category.icon}</div>
            <div className="text-sm opacity-90">{category.name}</div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3 text-blue-600">{Icon({ name: 'bookmarkCheck', className: "w-5 h-5" })}<h2 className="text-xl font-bold text-gray-900">{bookmark.title}</h2></div>
          <p className="text-gray-600 mb-4 leading-relaxed">{bookmark.excerpt}</p>
          {bookmark.notes && (
            <div className="bg-amber-50 p-3 rounded-lg mb-4 border border-amber-100">
              <p className="text-sm text-amber-800"><span className="font-medium">✍️ Private notes:</span> {bookmark.notes}</p>
            </div>
          )}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex gap-1">
              {[1,2,3,4,5].map(level => Icon({ name: 'star', className: "w-4 h-4", filled: level <= bookmark.importance }))}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              {Icon({ name: 'clock' })} Saved {formatDistanceToNow(new Date(bookmark.createdAt), { addSuffix: true })}
            </div>
          </div>
          <div className="mt-5 text-center text-xs text-gray-400 border-t pt-4">
            📌 Bookmarks are automatically deleted 7 days after creation
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// EDIT MODAL
// ============================================
function EditModal({ bookmark, categories, onClose, onSave }) {
  const [importance, setImportance] = useState(bookmark.importance);
  const [categoryId, setCategoryId] = useState(bookmark.categoryId);
  const [notes, setNotes] = useState(bookmark.notes || '');
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">Edit Bookmark</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Category</label>
            <select value={categoryId || ''} onChange={e => setCategoryId(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400">
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Importance (1-5)</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(level => (
                <button key={level} onClick={() => setImportance(level)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${importance >= level ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-100'}`}>{level}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Private Notes</label>
            <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="Add your thoughts..." />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2 bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={() => onSave(bookmark.id, { importance, categoryId, notes })} className="flex-1 py-2 bg-blue-500 text-white rounded-lg">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// DELETE CONFIRM MODAL
// ============================================
function DeleteConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={onCancel}>
      <div className="bg-white rounded-xl max-w-sm w-full p-6 text-center" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center text-red-500">{Icon({ name: 'alertTriangle' })}</div>
        <h3 className="text-lg font-semibold mb-2">Delete Bookmark</h3>
        <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2 bg-red-500 text-white rounded-lg">Delete</button>
        </div>
      </div>
    </div>
  );
}

// Helper Icon function
function Icon({ name, className = "w-5 h-5", filled = false }) {
  const icons = {
    bookmark: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>,
    bookmarkCheck: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" /></svg>,
    star: <svg className={`${className} ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
    edit: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
    trash: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    x: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
    clock: <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    alertTriangle: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    search: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    grid: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    list: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
    menu: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
    plus: <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
    download: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
    upload: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
    arrowUp: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>,
    arrowDown: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
  };
  return icons[name] || null;
}