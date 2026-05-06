// ============================================
// COMPLETE BOOKMARK PAGE - PRODUCTION READY
// ============================================
// FILE: src/components/frontend/BookmarkPage.tsx

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { useVirtualizer } from '@tanstack/react-virtual';

// ============================================
// BLOCK 1: ICON IMPORTS
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
// BLOCK 2: TYPE DEFINITIONS
// ============================================

interface BookmarkItem {
  id: string;
  user_id: string;
  post_id: number;
  post_title: string;
  post_slug: string;
  post_excerpt: string;
  featured_image_url: string | null;
  category_id: string | null;
  importance_level: number;
  notes: string | null;
  custom_metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  categories?: BookmarkCategory;
}

interface BookmarkCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  user_id: string;
  position: number;
  is_default: boolean;
  parent_id: string | null;
  child_categories?: BookmarkCategory[];
}

interface FilterState {
  category: string | null;
  importance: number | null;
  search: string;
  sortBy: 'created_at' | 'updated_at' | 'importance_level' | 'post_title';
  sortOrder: 'asc' | 'desc';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
}

interface ViewState {
  layout: 'grid' | 'list' | 'compact';
  density: 'comfortable' | 'compact' | 'spacious';
  showFilters: boolean;
  showSidebar: boolean;
}

// ============================================
// BLOCK 3: CUSTOM HOOKS
// ============================================

// Hook: Debounce search input
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Hook: Persist view preferences
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch { return initialValue; }
  });
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch { }
  };
  return [storedValue, setValue];
}

// ============================================
// BLOCK 4: MAIN COMPONENT
// ============================================

export default function BookmarkPage() {
  // State Management
  const [user, setUser] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [categories, setCategories] = useState<BookmarkCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchMode, setBatchMode] = useState(false);
  
  // Filter & View State
  const [filter, setFilter] = useState<FilterState>({
    category: null, importance: null, search: '',
    sortBy: 'created_at', sortOrder: 'desc', dateRange: 'all'
  });
  const [view, setView] = useLocalStorage<ViewState>('bookmark-view', {
    layout: 'grid', density: 'comfortable', showFilters: true, showSidebar: true
  });
  
  const debouncedSearch = useDebounce(filter.search, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  // ============================================
  // BLOCK 5: DATA FETCHING
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
        }
      } catch (error) {
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const fetchBookmarks = async (userId: string) => {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*, categories:category_id(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    setBookmarks(data || []);
  };

  const fetchCategories = async (userId: string) => {
    const { data, error } = await supabase
      .from('bookmark_categories')
      .select('*')
      .eq('user_id', userId)
      .order('position', { ascending: true });
    if (error) throw error;
    
    // Build category hierarchy
    const categoryMap = new Map<string, BookmarkCategory>();
    const roots: BookmarkCategory[] = [];
    data?.forEach(cat => categoryMap.set(cat.id, { ...cat, child_categories: [] }));
    categoryMap.forEach(cat => {
      if (cat.parent_id && categoryMap.has(cat.parent_id)) {
        categoryMap.get(cat.parent_id)!.child_categories!.push(cat);
      } else {
        roots.push(cat);
      }
    });
    setCategories(roots);
  };

  // ============================================
  // BLOCK 6: FILTERING & SORTING LOGIC
  // ============================================

  const filteredAndSortedBookmarks = useMemo(() => {
    let filtered = [...bookmarks];

    // Search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(b => 
        b.post_title.toLowerCase().includes(searchLower) ||
        b.post_excerpt?.toLowerCase().includes(searchLower) ||
        b.notes?.toLowerCase().includes(searchLower)
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
      case 'today': filtered = filtered.filter(b => new Date(b.created_at) >= today); break;
      case 'week': filtered = filtered.filter(b => new Date(b.created_at) >= new Date(now.setDate(now.getDate() - 7))); break;
      case 'month': filtered = filtered.filter(b => new Date(b.created_at) >= new Date(now.setMonth(now.getMonth() - 1))); break;
      case 'year': filtered = filtered.filter(b => new Date(b.created_at) >= new Date(now.setFullYear(now.getFullYear() - 1))); break;
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal: any = a[filter.sortBy];
      let bVal: any = b[filter.sortBy];
      if (filter.sortBy === 'created_at' || filter.sortBy === 'updated_at') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      return filter.sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });

    return filtered;
  }, [bookmarks, filter, debouncedSearch]);

  // Virtual scrolling for performance
  const virtualizer = useVirtualizer({
    count: filteredAndSortedBookmarks.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => view.layout === 'grid' ? 280 : view.layout === 'list' ? 120 : 80,
    overscan: 5
  });

  // ============================================
  // BLOCK 7: CRUD OPERATIONS
  // ============================================

  const handleDeleteBookmark = async (id: string) => {
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

  const handleUpdateBookmark = async (id: string, updates: Partial<BookmarkItem>) => {
    const { error } = await supabase
      .from('bookmarks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    setBookmarks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    toast.success('Bookmark updated');
    setShowEditModal(false);
  };

  const handleCreateCategory = async (name: string, icon: string, color: string) => {
    const { data, error } = await supabase
      .from('bookmark_categories')
      .insert({ user_id: user.id, name, icon, color, position: categories.length })
      .select()
      .single();
    if (error) throw error;
    setCategories(prev => [...prev, { ...data, child_categories: [] }]);
    toast.success('Category created');
    setShowCreateCategoryModal(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    await Promise.all([fetchBookmarks(user.id), fetchCategories(user.id)]);
    toast.success('Synced with cloud');
    setSyncing(false);
  };

  const handleExport = async () => {
    const exportData = { bookmarks: filteredAndSortedBookmarks, categories, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookmarks-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Bookmarks exported');
  };

  // Helper functions
  const getCategoryColor = (categoryId: string | null): string => {
    if (!categoryId) return '#64748b';
    const findColor = (cats: BookmarkCategory[]): string | null => {
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

  const getCategoryName = (categoryId: string | null): string => {
    if (!categoryId) return 'Uncategorized';
    const findName = (cats: BookmarkCategory[]): string | null => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your library...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // BLOCK 8: RENDER - HEADER SECTION
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
                <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
                  <Bookmark className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  Readora
                </h1>
              </div>
              <div className="hidden md:flex items-center gap-4 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <BookmarkCheck className="w-4 h-4 text-primary-500" />
                  <span className="text-sm font-medium">{bookmarks.length}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <FolderPlus className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">{categories.length}</span>
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
                  className="pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-full text-sm w-64 focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Layout Toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {(['grid', 'list', 'compact'] as const).map((layout) => (
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

              {/* Action Buttons */}
              <button onClick={handleSync} disabled={syncing} className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900">
                <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={handleExport} className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900">
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => setBatchMode(!batchMode)}
                className={`p-2 rounded-lg transition-colors ${batchMode ? 'bg-primary-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100'}`}
              >
                <CheckCircle2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          {view.showFilters && (
            <div className="flex items-center gap-3 py-3 overflow-x-auto">
              <button
                onClick={() => setFilter(prev => ({ ...prev, category: null }))}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${!filter.category ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFilter(prev => ({ ...prev, category: cat.id }))}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1 ${filter.category === cat.id ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}
                >
                  <span>{cat.icon}</span> {cat.name}
                </button>
              ))}
              <button
                onClick={() => setShowCreateCategoryModal(true)}
                className="px-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-gray-800 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> New Category
              </button>

              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

              <select
                value={filter.sortBy}
                onChange={(e) => setFilter(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="px-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-gray-800 border-0"
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
                onChange={(e) => setFilter(prev => ({ ...prev, dateRange: e.target.value as any }))}
                className="px-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-gray-800 border-0"
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
                className="px-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-gray-800 border-0"
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

      {/* ============================================ */}
      {/* BLOCK 9: MAIN CONTENT WITH VIRTUAL SCROLLING */}
      {/* ============================================ */}

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Batch Actions Floating Bar */}
        <AnimatePresence>
          {batchMode && selectedIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border px-6 py-3 flex items-center gap-4"
            >
              <span className="text-sm font-medium">{selectedIds.size} selected</span>
              <button onClick={() => setSelectedIds(new Set())} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-200" />
              <button onClick={handleBatchDelete} className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                <Move className="w-4 h-4" /> Move to Category
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Virtualized Bookmark List */}
        <div ref={containerRef} className="h-[calc(100vh-140px)] overflow-auto">
          <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const bookmark = filteredAndSortedBookmarks[virtualItem.index];
              if (!bookmark) return null;
              
              return (
                <div
                  key={bookmark.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                    padding: view.layout === 'grid' ? '8px' : '4px 0'
                  }}
                >
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
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* ============================================ */}
      {/* BLOCK 10: MODALS */}
      {/* ============================================ */}

      {/* Edit Bookmark Modal */}
      <AnimatePresence>
        {showEditModal && selectedBookmark && (
          <EditBookmarkModal
            bookmark={selectedBookmark}
            categories={categories}
            onClose={() => setShowEditModal(false)}
            onSave={handleUpdateBookmark}
          />
        )}
      </AnimatePresence>

      {/* Create Category Modal */}
      <AnimatePresence>
        {showCreateCategoryModal && (
          <CreateCategoryModal
            onClose={() => setShowCreateCategoryModal(false)}
            onCreate={handleCreateCategory}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
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
// BLOCK 11: GRID VIEW CARD COMPONENT
// ============================================

interface BookmarkCardProps {
  bookmark: BookmarkItem;
  selected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  batchMode: boolean;
  onEdit: () => void;
  onDelete: () => void;
  categoryName: string;
  categoryColor: string;
}

function BookmarkGridCard({ bookmark, selected, onSelect, batchMode, onEdit, onDelete, categoryName, categoryColor }: BookmarkCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className={`group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm border overflow-hidden transition-all ${
        selected ? 'ring-2 ring-primary-500 border-primary-500' : 'border-gray-200 dark:border-gray-700 hover:shadow-xl'
      }`}
    >
      {/* Selection Checkbox */}
      {batchMode && (
        <div className="absolute top-3 left-3 z-10">
          <button
            onClick={() => onSelect(bookmark.id, !selected)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              selected ? 'bg-primary-500 border-primary-500' : 'border-gray-300 bg-white dark:bg-gray-700'
            }`}
          >
            {selected && <Check className="w-3 h-3 text-white" />}
          </button>
        </div>
      )}

      <div className="p-4">
        {/* Header: Category & Actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColor }} />
            <span className="text-xs text-gray-500 dark:text-gray-400">{categoryName}</span>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <Edit2 className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30">
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {bookmark.post_title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {bookmark.post_excerpt || 'No description available'}
        </p>

        {/* Notes Preview */}
        {bookmark.notes && (
          <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              📝 {bookmark.notes}
            </p>
          </div>
        )}

        {/* Footer: Importance Stars & Date */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(level => (
              <Star
                key={level}
                className={`w-3 h-3 ${level <= bookmark.importance_level ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(bookmark.created_at), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// BLOCK 12: LIST VIEW CARD COMPONENT
// ============================================

function BookmarkListCard({ bookmark, selected, onSelect, batchMode, onEdit, onDelete, categoryName, categoryColor }: BookmarkCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`group bg-white dark:bg-gray-800 rounded-xl shadow-sm border ${
        selected ? 'ring-2 ring-primary-500 border-primary-500' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Checkbox */}
        {batchMode && (
          <button
            onClick={() => onSelect(bookmark.id, !selected)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
              selected ? 'bg-primary-500 border-primary-500' : 'border-gray-300 bg-white'
            }`}
          >
            {selected && <Check className="w-3 h-3 text-white" />}
          </button>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColor }} />
            <span className="text-xs text-gray-500">{categoryName}</span>
            <div className="flex items-center gap-0.5 ml-2">
              {[1, 2, 3, 4, 5].map(level => (
                <Star key={level} className={`w-3 h-3 ${level <= bookmark.importance_level ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
          </div>
          <h3 className="font-medium text-gray-900 truncate">{bookmark.post_title}</h3>
          <p className="text-sm text-gray-500 truncate">{bookmark.post_excerpt || 'No description'}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(bookmark.created_at), { addSuffix: true })}</span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
            <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-gray-100">
              <Edit2 className="w-4 h-4 text-gray-500" />
            </button>
            <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-100">
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// BLOCK 13: COMPACT VIEW CARD COMPONENT
// ============================================

function BookmarkCompactCard({ bookmark, selected, onSelect, batchMode, onEdit, onDelete, categoryName, categoryColor }: BookmarkCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`group border-b border-gray-100 dark:border-gray-800 ${
        selected ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
      }`}
    >
      <div className="flex items-center gap-3 py-2 px-3">
        {/* Checkbox */}
        {batchMode && (
          <button
            onClick={() => onSelect(bookmark.id, !selected)}
            className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
              selected ? 'bg-primary-500 border-primary-500' : 'border-gray-300 bg-white'
            }`}
          >
            {selected && <Check className="w-2.5 h-2.5 text-white" />}
          </button>
        )}

        {/* Category Dot */}
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: categoryColor }} />

        {/* Title */}
        <h4 className="text-sm font-medium text-gray-900 truncate flex-1">{bookmark.post_title}</h4>

        {/* Stars */}
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map(level => (
            <Star key={level} className={`w-2.5 h-2.5 ${level <= bookmark.importance_level ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
          ))}
        </div>

        {/* Date */}
        <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(bookmark.created_at))}</span>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
          <button onClick={onEdit} className="p-1 rounded hover:bg-gray-100">
            <Edit2 className="w-3 h-3 text-gray-500" />
          </button>
          <button onClick={onDelete} className="p-1 rounded hover:bg-red-100">
            <Trash2 className="w-3 h-3 text-red-500" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// BLOCK 14: EDIT BOOKMARK MODAL
// ============================================

interface EditModalProps {
  bookmark: BookmarkItem;
  categories: BookmarkCategory[];
  onClose: () => void;
  onSave: (id: string, updates: Partial<BookmarkItem>) => void;
}

function EditBookmarkModal({ bookmark, categories, onClose, onSave }: EditModalProps) {
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
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Bookmark</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {/* Category Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
            <select
              value={categoryId || ''}
              onChange={(e) => setCategoryId(e.target.value || null)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Uncategorized</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          {/* Importance Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Importance</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(level => (
                <button
                  key={level}
                  onClick={() => setImportance(level)}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                    importance >= level ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Notes Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Add your thoughts about this post..."
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// BLOCK 15: CREATE CATEGORY MODAL
// ============================================

interface CreateCategoryProps {
  onClose: () => void;
  onCreate: (name: string, icon: string, color: string) => void;
}

function CreateCategoryModal({ onClose, onCreate }: CreateCategoryProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📁');
  const [color, setColor] = useState('#3b82f6');

  const icons = ['📁', '📘', '💡', '🎯', '💼', '🎨', '🔧', '📊', '🎓', '🏆', '⭐', '❤️', '🔖', '📌', '✨'];
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

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
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Create Category</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Design, Development, Marketing"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {icons.map(ic => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                    icon === ic ? 'bg-primary-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-primary-500' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            Cancel
          </button>
          <button
            onClick={() => name.trim() && onCreate(name, icon, color)}
            className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Create
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// BLOCK 16: DELETE CONFIRMATION MODAL
// ============================================

interface DeleteConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmModal({ onConfirm, onCancel }: DeleteConfirmProps) {
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
          <button onClick={onCancel} className="flex-1 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
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