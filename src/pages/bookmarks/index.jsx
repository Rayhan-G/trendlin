// ============================================
// COMPLETE BOOKMARK PAGE - ALL FEATURES
// ============================================
// FILE: src/pages/bookmarks/index.jsx

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../../lib/supabase';  
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import Link from 'next/link';
import debounce from 'lodash/debounce';

// ============================================
// BLOCK 1: ALL ICON IMPORTS
// ============================================
import {
  Bookmark, BookmarkCheck, Loader2, FolderPlus, Star, MoreHorizontal, Share2,
  Trash2, Edit2, X, Check, Plus, Search, Filter, ChevronDown, Grid3x3, List,
  Clock, AlertCircle, FolderOpen, Tag, ExternalLink, Archive, Bell, Calendar,
  Link2, Sparkles, Layers, TrendingUp, BarChart3, Menu, ChevronRight, Cloud,
  Zap, Shield, Users, Globe, Lock, Eye, Heart, MessageCircle, RefreshCw,
  Settings, Download, Upload, Move, Copy, Pin, Unlock, CheckCircle2, XCircle,
  AlertTriangle, Info, FileText, Layout, Columns, Rows, Maximize2, Minimize2,
  SlidersHorizontal, PlusCircle, MinusCircle, ArrowUpDown, ArrowUp, ArrowDown,
  Moon, Sun, Monitor, Palette, Type
} from 'lucide-react';

// ============================================
// BLOCK 2: CUSTOM HOOKS
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
// BLOCK 3: MAIN COMPONENT
// ============================================

export default function BookmarksPage() {
  const router = useRouter();
  
  // State Management
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [batchMode, setBatchMode] = useState(false);
  
  // Filter & View State
  const [filter, setFilter] = useState({
    category: null, importance: null, search: '',
    sortBy: 'created_at', sortOrder: 'desc', dateRange: 'all'
  });
  const [view, setView] = useLocalStorage('bookmark-view', {
    layout: 'grid', density: 'comfortable', showFilters: true, showSidebar: true
  });
  
  const debouncedSearch = useDebounce(filter.search, 300);
  const containerRef = useRef(null);

  // ============================================
  // BLOCK 4: DATA FETCHING
  // ============================================

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
          await Promise.all([
            fetchBookmarks(data.user.id),
            fetchCategories(data.user.id)
          ]);
        } else {
          router.push('/login');
        }
      } catch (error) {
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const fetchBookmarks = async (userId) => {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*, categories:category_id(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    setBookmarks(data || []);
  };

  const fetchCategories = async (userId) => {
    const { data, error } = await supabase
      .from('bookmark_categories')
      .select('*')
      .eq('user_id', userId)
      .order('position', { ascending: true });
    if (error) throw error;
    
    // Build category hierarchy
    const categoryMap = new Map();
    const roots = [];
    data?.forEach(cat => categoryMap.set(cat.id, { ...cat, child_categories: [] }));
    categoryMap.forEach(cat => {
      if (cat.parent_id && categoryMap.has(cat.parent_id)) {
        categoryMap.get(cat.parent_id).child_categories.push(cat);
      } else {
        roots.push(cat);
      }
    });
    setCategories(roots);
  };

  // ============================================
  // BLOCK 5: FILTERING & SORTING LOGIC
  // ============================================

  const filteredAndSortedBookmarks = useMemo(() => {
    let filtered = [...bookmarks];

    // Search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(b => 
        b.post_title.toLowerCase().includes(searchLower) ||
        (b.post_excerpt && b.post_excerpt.toLowerCase().includes(searchLower)) ||
        (b.notes && b.notes.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (filter.category) {
      filtered = filtered.filter(b => b.category_id === filter.category);
    }

    // Importance filter
    if (filter.importance) {
      filtered = filtered.filter(b => b.importance_level === filter.importance);
    }

    // Date range filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    switch (filter.dateRange) {
      case 'today':
        filtered = filtered.filter(b => new Date(b.created_at) >= today);
        break;
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        filtered = filtered.filter(b => new Date(b.created_at) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        filtered = filtered.filter(b => new Date(b.created_at) >= monthAgo);
        break;
      case 'year':
        const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
        filtered = filtered.filter(b => new Date(b.created_at) >= yearAgo);
        break;
      default: break;
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal = a[filter.sortBy];
      let bVal = b[filter.sortBy];
      if (filter.sortBy === 'created_at' || filter.sortBy === 'updated_at') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      return filter.sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });

    return filtered;
  }, [bookmarks, filter, debouncedSearch]);

  // Helper functions
  const getAllCategoriesFlat = useCallback((categoryList = categories) => {
    const flat = [];
    const traverse = (cats) => {
      cats.forEach(cat => {
        flat.push(cat);
        if (cat.child_categories && cat.child_categories.length) {
          traverse(cat.child_categories);
        }
      });
    };
    traverse(categoryList);
    return flat;
  }, [categories]);

  const getCategoryColor = (categoryId) => {
    if (!categoryId) return '#64748b';
    const findColor = (cats) => {
      for (const cat of cats) {
        if (cat.id === categoryId) return cat.color;
        if (cat.child_categories) {
          const found = findColor(cat.child_categories);
          if (found) return found;
        }
      }
      return null;
    };
    return findColor(categories) || '#64748b';
  };

  const getCategoryName = (categoryId) => {
    if (!categoryId) return 'Uncategorized';
    const findName = (cats) => {
      for (const cat of cats) {
        if (cat.id === categoryId) return cat.name;
        if (cat.child_categories) {
          const found = findName(cat.child_categories);
          if (found) return found;
        }
      }
      return null;
    };
    return findName(categories) || 'Uncategorized';
  };

  // ============================================
  // BLOCK 6: CRUD OPERATIONS
  // ============================================

  const handleDeleteBookmark = async (id) => {
    const { error } = await supabase.from('bookmarks').delete().eq('id', id);
    if (error) throw error;
    setBookmarks(prev => prev.filter(b => b.id !== id));
    setSelectedIds(prev => { const newSet = new Set(prev); newSet.delete(id); return newSet; });
    toast.success('Bookmark removed');
    setShowDeleteConfirm(null);
  };

  const handleBatchDelete = async () => {
    const ids = Array.from(selectedIds);
    const { error } = await supabase.from('bookmarks').delete().in('id', ids);
    if (error) throw error;
    setBookmarks(prev => prev.filter(b => !selectedIds.has(b.id)));
    setSelectedIds(new Set());
    setBatchMode(false);
    toast.success(`Removed ${ids.length} bookmarks`);
  };

  const handleBatchMove = async (targetCategoryId) => {
    const ids = Array.from(selectedIds);
    const { error } = await supabase
      .from('bookmarks')
      .update({ category_id: targetCategoryId, updated_at: new Date().toISOString() })
      .in('id', ids);
    if (error) throw error;
    setBookmarks(prev => prev.map(b => 
      selectedIds.has(b.id) ? { ...b, category_id: targetCategoryId } : b
    ));
    setSelectedIds(new Set());
    setBatchMode(false);
    toast.success(`Moved ${ids.length} bookmarks`);
  };

  const handleUpdateBookmark = async (id, updates) => {
    const { error } = await supabase
      .from('bookmarks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    setBookmarks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    toast.success('Bookmark updated');
    setShowEditModal(false);
  };

  const handleCreateCategory = async (name, icon, color, parentId = null) => {
    const { data, error } = await supabase
      .from('bookmark_categories')
      .insert({ 
        user_id: user.id, 
        name, 
        icon, 
        color, 
        parent_id: parentId,
        position: getAllCategoriesFlat().length 
      })
      .select()
      .single();
    if (error) throw error;
    await fetchCategories(user.id);
    toast.success('Category created');
    setShowCreateCategoryModal(false);
  };

  const handleDeleteCategory = async (categoryId) => {
    const { error } = await supabase
      .from('bookmark_categories')
      .delete()
      .eq('id', categoryId);
    if (error) throw error;
    await fetchCategories(user.id);
    toast.success('Category deleted');
  };

  const handleSync = async () => {
    setSyncing(true);
    await Promise.all([fetchBookmarks(user.id), fetchCategories(user.id)]);
    toast.success('Synced with cloud');
    setSyncing(false);
  };

  const handleExport = async () => {
    const exportData = { 
      bookmarks: filteredAndSortedBookmarks, 
      categories: getAllCategoriesFlat(),
      exportDate: new Date().toISOString(),
      version: '2.0',
      totalCount: bookmarks.length
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookmarks-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${bookmarks.length} bookmarks exported`);
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported.bookmarks && Array.isArray(imported.bookmarks)) {
          let successCount = 0;
          for (const bookmark of imported.bookmarks) {
            const { error } = await supabase.from('bookmarks').insert({
              user_id: user.id,
              post_id: bookmark.post_id,
              post_title: bookmark.post_title,
              post_slug: bookmark.post_slug,
              post_excerpt: bookmark.post_excerpt,
              category_id: bookmark.category_id,
              importance_level: bookmark.importance_level || 3,
              notes: bookmark.notes || ''
            });
            if (!error) successCount++;
          }
          await fetchBookmarks(user.id);
          toast.success(`Imported ${successCount} bookmarks`);
        }
      } catch (error) {
        toast.error('Invalid import file');
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your library...</p>
        </div>
      </div>
    );
  }

  const allCategoriesFlat = getAllCategoriesFlat();
  const stats = {
    total: bookmarks.length,
    categories: allCategoriesFlat.length,
    highImportance: bookmarks.filter(b => b.importance_level >= 4).length
  };

  // ============================================
  // BLOCK 7: RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Stats */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <Bookmark className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  Readora
                </h1>
              </div>
              <div className="hidden md:flex items-center gap-4 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <BookmarkCheck className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">{stats.total}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <FolderPlus className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">{stats.categories}</span>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-2">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={filter.search}
                  onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-full text-sm w-64 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Layout Toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {(['grid', 'list', 'compact']).map((layout) => (
                  <button
                    key={layout}
                    onClick={() => setView(prev => ({ ...prev, layout }))}
                    className={`p-1.5 rounded transition-colors ${view.layout === layout ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                  >
                    {layout === 'grid' && <Grid3x3 className="w-4 h-4" />}
                    {layout === 'list' && <List className="w-4 h-4" />}
                    {layout === 'compact' && <Menu className="w-4 h-4" />}
                  </button>
                ))}
              </div>

              {/* Sync Button */}
              <button onClick={handleSync} disabled={syncing} className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
              </button>

              {/* Export Button */}
              <button onClick={handleExport} className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <Download className="w-5 h-5" />
              </button>

              {/* Import Button */}
              <label className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">
                <Upload className="w-5 h-5" />
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>

              {/* Batch Mode Toggle */}
              <button
                onClick={() => setBatchMode(!batchMode)}
                className={`p-2 rounded-lg transition-colors ${batchMode ? 'bg-blue-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                <CheckCircle2 className="w-5 h-5" />
              </button>

              {/* Settings Button */}
              <button
                onClick={() => setView(prev => ({ ...prev, showFilters: !prev.showFilters }))}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          {view.showFilters && (
            <div className="flex items-center gap-3 py-3 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setFilter(prev => ({ ...prev, category: null }))}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  !filter.category
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                All
              </button>
              
              {categories.map(cat => (
                <CategoryFilterButton
                  key={cat.id}
                  category={cat}
                  isActive={filter.category === cat.id}
                  onClick={() => setFilter(prev => ({ ...prev, category: cat.id }))}
                />
              ))}
              
              <button
                onClick={() => setShowCreateCategoryModal(true)}
                className="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                New Category
              </button>

              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

              <select
                value={filter.sortBy}
                onChange={(e) => setFilter(prev => ({ ...prev, sortBy: e.target.value }))}
                className="px-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-blue-500"
              >
                <option value="created_at">Date Added</option>
                <option value="updated_at">Last Updated</option>
                <option value="importance_level">Importance</option>
                <option value="post_title">Title</option>
              </select>

              <button
                onClick={() => setFilter(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800"
              >
                {filter.sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              </button>

              <select
                value={filter.dateRange}
                onChange={(e) => setFilter(prev => ({ ...prev, dateRange: e.target.value }))}
                className="px-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>

              <select
                value={filter.importance || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, importance: e.target.value ? parseInt(e.target.value) : null }))}
                className="px-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Importance</option>
                <option value="5">⭐ 5 - Critical</option>
                <option value="4">⭐ 4 - High</option>
                <option value="3">⭐ 3 - Medium</option>
                <option value="2">⭐ 2 - Low</option>
                <option value="1">⭐ 1 - Optional</option>
              </select>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Batch Actions Floating Bar */}
        <AnimatePresence>
          {batchMode && selectedIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center gap-4"
            >
              <span className="text-sm font-medium">{selectedIds.size} selected</span>
              <button onClick={() => setSelectedIds(new Set())} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
              <button onClick={handleBatchDelete} className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              
              <select
                onChange={(e) => e.target.value && handleBatchMove(e.target.value)}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                defaultValue=""
              >
                <option value="" disabled>Move to Category</option>
                <option value="">Uncategorized</option>
                {allCategoriesFlat.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {filteredAndSortedBookmarks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Bookmark className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No bookmarks found</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
              {bookmarks.length === 0 
                ? "You haven't saved any bookmarks yet. Start saving your favorite content!"
                : "Try adjusting your filters to see more results."}
            </p>
          </div>
        )}

        {/* Bookmark Grid/List/Compact Layout */}
        <div ref={containerRef} className="space-y-3">
          <div className={`
            ${view.layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : ''}
            ${view.layout === 'list' ? 'space-y-2' : ''}
            ${view.layout === 'compact' ? 'divide-y divide-gray-100 dark:divide-gray-800' : ''}
          `}>
            {filteredAndSortedBookmarks.map((bookmark) => (
              <React.Fragment key={bookmark.id}>
                {view.layout === 'grid' && (
                  <BookmarkGridCard
                    bookmark={bookmark}
                    selected={selectedIds.has(bookmark.id)}
                    onSelect={(id, selected) => {
                      setSelectedIds(prev => {
                        const newSet = new Set(prev);
                        selected ? newSet.add(id) : newSet.delete(id);
                        return newSet;
                      });
                    }}
                    batchMode={batchMode}
                    onEdit={() => { setSelectedBookmark(bookmark); setShowEditModal(true); }}
                    onDelete={() => setShowDeleteConfirm(bookmark.id)}
                    categoryName={getCategoryName(bookmark.category_id)}
                    categoryColor={getCategoryColor(bookmark.category_id)}
                  />
                )}
                {view.layout === 'list' && (
                  <BookmarkListCard
                    bookmark={bookmark}
                    selected={selectedIds.has(bookmark.id)}
                    onSelect={(id, selected) => {
                      setSelectedIds(prev => {
                        const newSet = new Set(prev);
                        selected ? newSet.add(id) : newSet.delete(id);
                        return newSet;
                      });
                    }}
                    batchMode={batchMode}
                    onEdit={() => { setSelectedBookmark(bookmark); setShowEditModal(true); }}
                    onDelete={() => setShowDeleteConfirm(bookmark.id)}
                    categoryName={getCategoryName(bookmark.category_id)}
                    categoryColor={getCategoryColor(bookmark.category_id)}
                  />
                )}
                {view.layout === 'compact' && (
                  <BookmarkCompactCard
                    bookmark={bookmark}
                    selected={selectedIds.has(bookmark.id)}
                    onSelect={(id, selected) => {
                      setSelectedIds(prev => {
                        const newSet = new Set(prev);
                        selected ? newSet.add(id) : newSet.delete(id);
                        return newSet;
                      });
                    }}
                    batchMode={batchMode}
                    onEdit={() => { setSelectedBookmark(bookmark); setShowEditModal(true); }}
                    onDelete={() => setShowDeleteConfirm(bookmark.id)}
                    categoryName={getCategoryName(bookmark.category_id)}
                    categoryColor={getCategoryColor(bookmark.category_id)}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showEditModal && selectedBookmark && (
          <EditBookmarkModal
            bookmark={selectedBookmark}
            categories={allCategoriesFlat}
            onClose={() => setShowEditModal(false)}
            onSave={handleUpdateBookmark}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateCategoryModal && (
          <CreateCategoryModal
            categories={categories}
            onClose={() => setShowCreateCategoryModal(false)}
            onCreate={handleCreateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <DeleteConfirmModal
            onConfirm={() => handleDeleteBookmark(showDeleteConfirm)}
            onCancel={() => setShowDeleteConfirm(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// BLOCK 8: CATEGORY FILTER BUTTON
// ============================================

function CategoryFilterButton({ category, isActive, onClick }) {
  const [showChildren, setShowChildren] = useState(false);
  const hasChildren = category.child_categories && category.child_categories.length > 0;

  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
          isActive
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        <span>{category.icon}</span>
        {category.name}
        {hasChildren && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowChildren(!showChildren); }}
            className="ml-1 p-0.5 hover:bg-white/20 rounded"
          >
            <ChevronDown className={`w-3 h-3 transition-transform ${showChildren ? 'rotate-180' : ''}`} />
          </button>
        )}
      </button>
      
      {hasChildren && showChildren && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 min-w-[150px]">
          {category.child_categories.map(child => (
            <button
              key={child.id}
              onClick={() => { onClick(); setShowChildren(false); }}
              className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <span>{child.icon}</span> {child.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// BLOCK 9: GRID VIEW CARD
// ============================================

function BookmarkGridCard({ bookmark, selected, onSelect, batchMode, onEdit, onDelete, categoryName, categoryColor }) {
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className={`group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm border overflow-hidden transition-all ${
        selected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200 dark:border-gray-700 hover:shadow-xl'
      }`}
    >
      {batchMode && (
        <div className="absolute top-3 left-3 z-10">
          <button
            onClick={() => onSelect(bookmark.id, !selected)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              selected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white dark:bg-gray-700'
            }`}
          >
            {selected && <Check className="w-3 h-3 text-white" />}
          </button>
        </div>
      )}

      <div className="absolute top-3 right-3 z-10" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <MoreHorizontal className="w-4 h-4 text-gray-500" />
        </button>
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[120px] z-20"
            >
              <button onClick={onEdit} className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={onDelete} className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColor }} />
          <span className="text-xs text-gray-500 dark:text-gray-400">{categoryName}</span>
        </div>

        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {bookmark.post_title}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {bookmark.post_excerpt || 'No description available'}
        </p>

        {bookmark.notes && (
          <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              📝 {bookmark.notes}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(level => (
              <Star
                key={level}
                className={`w-3 h-3 ${
                  level <= bookmark.importance_level
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(bookmark.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// BLOCK 10: LIST VIEW CARD
// ============================================

function BookmarkListCard({ bookmark, selected, onSelect, batchMode, onEdit, onDelete, categoryName, categoryColor }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`group bg-white dark:bg-gray-800 rounded-xl shadow-sm border ${
        selected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/80'
      }`}
    >
      <div className="flex items-center gap-4 p-4">
        {batchMode && (
          <button
            onClick={() => onSelect(bookmark.id, !selected)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
              selected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white dark:bg-gray-700'
            }`}
          >
            {selected && <Check className="w-3 h-3 text-white" />}
          </button>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColor }} />
            <span className="text-xs text-gray-500 dark:text-gray-400">{categoryName}</span>
            <div className="flex items-center gap-0.5 ml-2">
              {[1, 2, 3, 4, 5].map(level => (
                <Star
                  key={level}
                  className={`w-3 h-3 ${
                    level <= bookmark.importance_level
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <h3 className="font-medium text-gray-900 dark:text-white truncate">
            {bookmark.post_title}
          </h3>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {bookmark.post_excerpt || 'No description'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(bookmark.created_at), { addSuffix: true })}
          </span>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <Edit2 className="w-4 h-4 text-gray-500" />
            </button>
            <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30">
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// BLOCK 11: COMPACT VIEW CARD
// ============================================

function BookmarkCompactCard({ bookmark, selected, onSelect, batchMode, onEdit, onDelete, categoryName, categoryColor }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`group border-b border-gray-100 dark:border-gray-800 ${
        selected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
      }`}
    >
      <div className="flex items-center gap-3 py-2 px-3">
        {batchMode && (
          <button
            onClick={() => onSelect(bookmark.id, !selected)}
            className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
              selected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white dark:bg-gray-700'
            }`}
          >
            {selected && <Check className="w-2.5 h-2.5 text-white" />}
          </button>
        )}

        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: categoryColor }} />
        
        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">
          {bookmark.post_title}
        </h4>
        
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map(level => (
            <Star
              key={level}
              className={`w-2.5 h-2.5 ${
                level <= bookmark.importance_level
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          ))}
        </div>
        
        <span className="text-xs text-gray-400">
          {formatDistanceToNow(new Date(bookmark.created_at))}
        </span>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
            <Edit2 className="w-3 h-3 text-gray-500" />
          </button>
          <button onClick={onDelete} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30">
            <Trash2 className="w-3 h-3 text-red-500" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// BLOCK 12: EDIT BOOKMARK MODAL
// ============================================

function EditBookmarkModal({ bookmark, categories, onClose, onSave }) {
  const [importance, setImportance] = useState(bookmark.importance_level);
  const [categoryId, setCategoryId] = useState(bookmark.category_id);
  const [notes, setNotes] = useState(bookmark.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    await onSave(bookmark.id, { importance_level: importance, category_id: categoryId, notes });
    setSaving(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Bookmark</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={categoryId || ''}
              onChange={(e) => setCategoryId(e.target.value || null)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Uncategorized</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Importance Level
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(level => (
                <button
                  key={level}
                  onClick={() => setImportance(level)}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                    importance >= level
                      ? 'bg-yellow-400 text-yellow-900'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Private Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Add your thoughts about this post..."
            />
          </div>
        </div>

        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// BLOCK 13: CREATE CATEGORY MODAL
// ============================================

function CreateCategoryModal({ categories, onClose, onCreate, onDeleteCategory }) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📁');
  const [color, setColor] = useState('#3b82f6');
  const [parentId, setParentId] = useState(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const icons = ['📁', '📘', '💡', '🎯', '💼', '🎨', '🔧', '📊', '🎓', '🏆', '⭐', '❤️', '🔖', '📌', '✨', '🎵', '🎬', '📰', '🛒', '💻'];
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

  const getAllCategoriesForSelect = (cats, level = 0) => {
    let result = [];
    cats.forEach(cat => {
      result.push({ ...cat, level });
      if (cat.child_categories && cat.child_categories.length) {
        result = result.concat(getAllCategoriesForSelect(cat.child_categories, level + 1));
      }
    });
    return result;
  };

  const flatCategories = getAllCategoriesForSelect(categories);

  if (deleteMode) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={() => { setDeleteMode(false); setCategoryToDelete(null); }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delete Category</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete "{categoryToDelete?.name}"? Bookmarks in this category will become uncategorized.
            </p>
            <div className="flex gap-3">
              <button onClick={() => { setDeleteMode(false); setCategoryToDelete(null); }} className="flex-1 px-4 py-2 bg-gray-100 rounded-lg">
                Cancel
              </button>
              <button onClick={() => { onDeleteCategory(categoryToDelete.id); setDeleteMode(false); setCategoryToDelete(null); onClose(); }} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg">
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Manage Categories</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {flatCategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Existing Categories
              </label>
              <div className="space-y-1 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                {flatCategories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                    <div className="flex items-center gap-2" style={{ marginLeft: `${cat.level * 20}px` }}>
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{cat.name}</span>
                    </div>
                    <button
                      onClick={() => { setCategoryToDelete(cat); setDeleteMode(true); }}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Create New Category</h4>
            
            <div className="mb-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Category name (e.g., Design, Development)"
                autoFocus
              />
            </div>

            <div className="mb-3">
              <select
                value={parentId || ''}
                onChange={(e) => setParentId(e.target.value || null)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">No Parent (Top Level)</option>
                {flatCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {'  '.repeat(cat.level)}{cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Icon</label>
              <div className="flex gap-2 flex-wrap">
                {icons.map(ic => (
                  <button
                    key={ic}
                    onClick={() => setIcon(ic)}
                    className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                      icon === ic ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Color</label>
              <div className="flex gap-2 flex-wrap">
                {colors.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200">
            Close
          </button>
          <button
            onClick={() => name.trim() && onCreate(name, icon, color, parentId)}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Create Category
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// BLOCK 14: DELETE CONFIRMATION MODAL
// ============================================

function DeleteConfirmModal({ onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Bookmark</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to delete this bookmark? This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onCancel} className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}