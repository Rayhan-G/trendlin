// ============================================
// FILE: src/pages/bookmarks/index.jsx
// ============================================

import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { formatDistanceToNow, subDays, isAfter } from 'date-fns';

// ============================================
// SVG ICON COMPONENTS
// ============================================
const BookmarkIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const BookmarkCheckIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
  </svg>
);

const StarIcon = ({ filled = false, className = "w-3 h-3" }) => (
  <svg className={`${className} ${filled ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const MoreIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const GridIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const ArrowUpIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const ArrowDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

// ============================================
// FIXED CATEGORIES: Health, Wealth, Tech, Growth, Entertainment, World, Lifestyle
// ============================================
const FIXED_CATEGORIES = [
  { id: 'health', name: 'Health', icon: '❤️', color: '#ef4444', gradient: 'from-red-50 to-red-100' },
  { id: 'wealth', name: 'Wealth', icon: '💰', color: '#f59e0b', gradient: 'from-amber-50 to-amber-100' },
  { id: 'tech', name: 'Tech', icon: '💻', color: '#3b82f6', gradient: 'from-blue-50 to-blue-100' },
  { id: 'growth', name: 'Growth', icon: '🌱', color: '#10b981', gradient: 'from-emerald-50 to-emerald-100' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#ec4899', gradient: 'from-pink-50 to-pink-100' },
  { id: 'world', name: 'World', icon: '🌍', color: '#8b5cf6', gradient: 'from-violet-50 to-violet-100' },
  { id: 'lifestyle', name: 'Lifestyle', icon: '🏝️', color: '#06b6d4', gradient: 'from-cyan-50 to-cyan-100' }
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
  const [viewLayout, setViewLayout] = useState('grid');
  const [selectedBookmark, setSelectedBookmark] = useState(null);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);

  // Load data & auto-clean on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_BOOKMARKS);
    let bookmarksData = stored ? JSON.parse(stored) : getInitialBookmarks();
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

  const showToastMessage = (message, type = 'success') => {
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
        b.excerpt.toLowerCase().includes(query) ||
        (b.notes && b.notes.toLowerCase().includes(query))
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
    return FIXED_CATEGORIES.find(c => c.id === categoryId) || { id: 'uncategorized', name: 'Uncategorized', icon: '📄', color: '#94a3b8', gradient: 'from-gray-50 to-gray-100' };
  };

  // CRUD operations
  const handleDeleteBookmark = (id) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
    setShowDeleteConfirm(null);
    showToastMessage('Bookmark removed', 'success');
  };

  const handleUpdateBookmark = (id, updates) => {
    setBookmarks(prev => prev.map(b => b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b));
    setShowEditModal(false);
    setEditingBookmark(null);
    showToastMessage('Bookmark updated', 'success');
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
    showToastMessage('New bookmark added! Expires in 7 days', 'success');
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
    showToastMessage('Bookmarks exported', 'success');
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.bookmarks && Array.isArray(imported.bookmarks)) {
          const cleanedImported = cleanExpiredBookmarks(imported.bookmarks);
          setBookmarks(cleanedImported);
          showToastMessage(`Imported ${cleanedImported.length} bookmarks`, 'success');
        } else {
          showToastMessage('Invalid file format', 'error');
        }
      } catch (err) {
        showToastMessage('Failed to import', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const stats = { total: bookmarks.length, categories: FIXED_CATEGORIES.length };

  const handleCloseModal = () => {
    setAnimatingOut(true);
    setTimeout(() => {
      setSelectedBookmark(null);
      setAnimatingOut(false);
    }, 200);
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Readora • Smart Bookmarks</title>
        <meta name="description" content="Bookmark manager with 7-day auto-delete and postcard views" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Toast Notification */}
        {toast && (
          <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-5 py-3 rounded-full shadow-lg text-sm font-medium flex items-center gap-2 transition-all animate-in slide-in-from-bottom-5 ${
            toast.type === 'error' ? 'bg-red-500' : 'bg-gray-900'
          } text-white`}>
            {toast.type === 'error' ? '⚠️' : '✓'} {toast.message}
          </div>
        )}

        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md shadow-blue-200/50 text-white transition-transform hover:scale-105">
                  <BookmarkIcon className="w-5 h-5" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-500 bg-clip-text text-transparent tracking-tight">Readora</h1>
                <div className="hidden md:flex items-center gap-4 ml-6 pl-6 border-l border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📚</span>
                    <span className="text-sm font-medium text-gray-700">{stats.total} saved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🗂️</span>
                    <span className="text-sm font-medium text-gray-700">{stats.categories} topics</span>
                  </div>
                  <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full">
                    <span className="text-amber-500">⏱️</span>
                    <span className="text-xs font-medium text-amber-700">7-day auto-delete</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></div>
                  <input 
                    type="text" 
                    placeholder="Search titles, notes..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="pl-9 pr-4 py-2 bg-gray-100 border-0 rounded-full text-sm w-64 focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none transition-all" 
                  />
                </div>
                
                <div className="flex bg-gray-100 rounded-xl p-1">
                  <button onClick={() => setViewLayout('grid')} className={`p-1.5 rounded-lg transition-all ${viewLayout === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    <GridIcon />
                  </button>
                  <button onClick={() => setViewLayout('list')} className={`p-1.5 rounded-lg transition-all ${viewLayout === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    <ListIcon />
                  </button>
                  <button onClick={() => setViewLayout('compact')} className={`p-1.5 rounded-lg transition-all ${viewLayout === 'compact' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    <MenuIcon />
                  </button>
                </div>
                
                <button onClick={handleAddDemoBookmark} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md flex items-center gap-1">
                  <PlusIcon /> Add Demo
                </button>
                <button onClick={handleExport} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
                  <DownloadIcon />
                </button>
                <label className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl cursor-pointer transition-all">
                  <UploadIcon />
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
              </div>
            </div>
            
            {/* Category Filter Bar */}
            <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <button 
                onClick={() => setFilterCategory(null)} 
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  !filterCategory 
                    ? 'bg-gray-900 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Bookmarks
              </button>
              {FIXED_CATEGORIES.map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => setFilterCategory(cat.id)} 
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    filterCategory === cat.id 
                      ? 'shadow-md text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={filterCategory === cat.id ? { backgroundColor: cat.color } : {}}
                >
                  <span>{cat.icon}</span> {cat.name}
                </button>
              ))}
              
              <div className="w-px h-6 bg-gray-200 mx-2"></div>
              
              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-2 py-1 rounded-full text-sm bg-transparent border-0 focus:ring-0 font-medium">
                  <option value="createdAt">Date added</option>
                  <option value="importance">Importance</option>
                  <option value="title">Title</option>
                </select>
                <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="p-1 rounded-lg hover:bg-gray-200 transition">
                  {sortOrder === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {filteredBookmarks.length === 0 ? (
            <div className="text-center py-20 animate-in fade-in-50">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-400 shadow-inner">
                <BookmarkIcon className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">No bookmarks found</h3>
              <p className="text-gray-500 max-w-sm mx-auto">Bookmarks expire after 7 days automatically. Add a demo bookmark to get started!</p>
              <button onClick={handleAddDemoBookmark} className="mt-6 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-md transition-all">+ Add Demo Bookmark</button>
            </div>
          ) : (
            <div className={
              viewLayout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' :
              viewLayout === 'list' ? 'space-y-3' :
              'divide-y divide-gray-100'
            }>
              {filteredBookmarks.map(bookmark => {
                const category = getCategory(bookmark.categoryId);
                
                if (viewLayout === 'grid') {
                  return (
                    <div key={bookmark.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1" onClick={() => setSelectedBookmark(bookmark)}>
                      <div className="relative h-2" style={{ backgroundColor: category.color }} />
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">{category.icon} {category.name}</span>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
                            <button onClick={() => { setEditingBookmark(bookmark); setShowEditModal(true); }} className="p-1.5 hover:bg-gray-100 rounded-xl transition"><EditIcon /></button>
                            <button onClick={() => setShowDeleteConfirm(bookmark.id)} className="p-1.5 hover:bg-red-50 rounded-xl transition"><TrashIcon /></button>
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-lg leading-tight">{bookmark.title}</h3>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2 leading-relaxed">{bookmark.excerpt}</p>
                        {bookmark.notes && (
                          <div className="mb-3 p-2.5 bg-gray-50 rounded-xl text-xs text-gray-500 line-clamp-2 border border-gray-100">📝 {bookmark.notes}</div>
                        )}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(level => <StarIcon key={level} filled={level <= bookmark.importance} className="w-3.5 h-3.5" />)}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                            <ClockIcon />
                            {formatDistanceToNow(new Date(bookmark.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                if (viewLayout === 'list') {
                  return (
                    <div key={bookmark.id} className="group bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50/80 transition-all hover:shadow-md" onClick={() => setSelectedBookmark(bookmark)}>
                      <div className="w-1 h-12 rounded-full" style={{ backgroundColor: category.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-medium text-gray-500">{category.icon} {category.name}</span>
                          <div className="flex gap-0.5 ml-2">
                            {[1,2,3,4,5].map(level => <StarIcon key={level} filled={level <= bookmark.importance} className="w-3 h-3" />)}
                          </div>
                        </div>
                        <h3 className="font-medium text-gray-900 truncate">{bookmark.title}</h3>
                        <p className="text-sm text-gray-500 truncate">{bookmark.excerpt}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-400 font-mono">{formatDistanceToNow(new Date(bookmark.createdAt))}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
                          <button onClick={() => { setEditingBookmark(bookmark); setShowEditModal(true); }} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><EditIcon /></button>
                          <button onClick={() => setShowDeleteConfirm(bookmark.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition"><TrashIcon /></button>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                // Compact view
                return (
                  <div key={bookmark.id} className="group py-3 px-2 flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg transition-all" onClick={() => setSelectedBookmark(bookmark)}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
                    <h4 className="text-sm font-medium text-gray-800 flex-1 truncate">{bookmark.title}</h4>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(level => <StarIcon key={level} filled={level <= bookmark.importance} className="w-2.5 h-2.5" />)}
                    </div>
                    <span className="text-xs text-gray-400 font-mono">{formatDistanceToNow(new Date(bookmark.createdAt))}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
                      <button onClick={() => { setEditingBookmark(bookmark); setShowEditModal(true); }} className="p-1 hover:bg-gray-100 rounded transition"><EditIcon /></button>
                      <button onClick={() => setShowDeleteConfirm(bookmark.id)} className="p-1 hover:bg-red-50 rounded transition"><TrashIcon /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Postcard Modal */}
        {selectedBookmark && (
          <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all ${animatingOut ? 'opacity-0' : 'opacity-100'}`} onClick={handleCloseModal}>
            <div className={`bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden transform transition-all duration-200 ${animatingOut ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`} onClick={e => e.stopPropagation()}>
              <div className="relative h-32 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                <div className="absolute top-4 right-4">
                  <button onClick={handleCloseModal} className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-all text-white"><XIcon /></button>
                </div>
                <div className="text-white text-center">
                  <div className="text-6xl mb-2 drop-shadow-md">{getCategory(selectedBookmark.categoryId).icon}</div>
                  <div className="text-sm opacity-90 font-medium">{getCategory(selectedBookmark.categoryId).name}</div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3 text-blue-600">
                  <BookmarkCheckIcon className="w-5 h-5" />
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">{selectedBookmark.title}</h2>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">{selectedBookmark.excerpt}</p>
                {selectedBookmark.notes && (
                  <div className="bg-amber-50 p-4 rounded-xl mb-4 border border-amber-100">
                    <p className="text-sm text-amber-800"><span className="font-medium">✍️ Private notes:</span> {selectedBookmark.notes}</p>
                  </div>
                )}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(level => <StarIcon key={level} filled={level <= selectedBookmark.importance} className="w-4 h-4" />)}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-400 font-mono">
                    <ClockIcon /> Saved {formatDistanceToNow(new Date(selectedBookmark.createdAt), { addSuffix: true })}
                  </div>
                </div>
                <div className="mt-6 text-center text-xs text-gray-400 border-t pt-4">
                  📌 Bookmarks are automatically deleted 7 days after creation
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingBookmark && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => { setShowEditModal(false); setEditingBookmark(null); }}>
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-5 text-gray-800">Edit Bookmark</h3>
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-gray-700">Category</label>
                  <select 
                    value={editingBookmark.categoryId || ''} 
                    onChange={e => setEditingBookmark({ ...editingBookmark, categoryId: e.target.value })} 
                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  >
                    {FIXED_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-gray-700">Importance (1-5)</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(level => (
                      <button 
                        key={level} 
                        onClick={() => setEditingBookmark({ ...editingBookmark, importance: level })} 
                        className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                          editingBookmark.importance >= level 
                            ? 'bg-amber-400 text-amber-900 shadow-sm' 
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-gray-700">Private Notes</label>
                  <textarea 
                    rows={3} 
                    value={editingBookmark.notes || ''} 
                    onChange={e => setEditingBookmark({ ...editingBookmark, notes: e.target.value })} 
                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all" 
                    placeholder="Add your thoughts..." 
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => { setShowEditModal(false); setEditingBookmark(null); }} className="flex-1 py-2.5 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-all">Cancel</button>
                <button onClick={() => handleUpdateBookmark(editingBookmark.id, { importance: editingBookmark.importance, categoryId: editingBookmark.categoryId, notes: editingBookmark.notes })} className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-md transition-all">Save Changes</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)}>
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
              <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center text-red-500 shadow-inner">
                <AlertTriangleIcon />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Delete Bookmark</h3>
              <p className="text-gray-500 text-sm mb-6">This action cannot be undone. The bookmark will be permanently removed.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2.5 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-all">Cancel</button>
                <button onClick={() => handleDeleteBookmark(showDeleteConfirm)} className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:shadow-md transition-all">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @keyframes slide-in-from-bottom-5 {
          from {
            transform: translateX(-50%) translateY(1rem);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
        .animate-in {
          animation-duration: 0.2s;
          animation-fill-mode: both;
        }
        .slide-in-from-bottom-5 {
          animation-name: slide-in-from-bottom-5;
        }
        .fade-in-50 {
          animation-name: fade-in;
          animation-duration: 0.3s;
        }
        .zoom-in-95 {
          animation-name: zoom-in;
          animation-duration: 0.2s;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoom-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}