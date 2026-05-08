// ============================================
// FILE: src/pages/bookmarks/index.jsx
// ============================================
// A faithful recreation of the "My Bookmarks / Blog collection" image
// Clean sidebar, simple list view, no extra fluff

import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { formatDistanceToNow } from 'date-fns';

// ============================================
// SIMPLE SVG ICONS (minimal, clean)
// ============================================
const BookmarkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const HeartIcon = ({ filled = false }) => (
  <svg className={`w-4 h-4 ${filled ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ArchiveIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
  </svg>
);

const TagIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-5-5A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const MoreIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// ============================================
// DATA STRUCTURES (matching the image)
// ============================================

// Collections from the image
const COLLECTIONS = [
  { id: 'tech', name: 'Tech Blogs', count: 12 },
  { id: 'writing', name: 'Writing & Growth', count: 8 },
  { id: 'design', name: 'Design Inspiration', count: 6 },
  { id: 'marketing', name: 'Marketing & SEO', count: 9 },
  { id: 'finance', name: 'Personal Finance', count: 7 },
];

// Tags from the image
const TAGS = [
  'Productivity',
  'Web Development',
  'AI',
  'Design',
  'Marketing',
];

// Filter options (sidebar menu)
const SIDEBAR_FILTERS = [
  { id: 'all', name: 'All Bookmarks', icon: null },
  { id: 'favorites', name: 'Favorites', icon: null },
  { id: 'recent', name: 'Recently Added', icon: null },
  { id: 'readlater', name: 'Read Later', icon: null },
  { id: 'archive', name: 'Archive', icon: null },
];

// Storage key
const STORAGE_KEY = 'blog_collection_bookmarks';

// Sample bookmarks (matching the style in the image)
const getInitialBookmarks = () => {
  const now = new Date();
  const daysAgo = (days) => {
    const d = new Date(now);
    d.setDate(now.getDate() - days);
    return d.toISOString();
  };
  
  return [
    {
      id: '1',
      title: 'How I Write: A Practical Guide to Better Writing',
      excerpt: 'A practical guide to better writing. Insights on writing clearly, thinking better, and sharing ideas that matter.',
      url: 'theswetestup.com',
      collectionId: 'writing',
      tags: ['Writing', 'Productivity'],
      isFavorite: true,
      isRead: true,
      readLater: false,
      archived: false,
      savedAt: daysAgo(2),
    },
    {
      id: '2',
      title: 'The Complete Guide to Building a Second Brain with Notion',
      excerpt: 'A step-by-step guide to organize your life and knowledge using Notion.',
      url: 'notion-guide.com',
      collectionId: 'tech',
      tags: ['Productivity', 'Notion', 'Organization'],
      isFavorite: false,
      isRead: true,
      readLater: false,
      archived: false,
      savedAt: daysAgo(4),
    },
    {
      id: '3',
      title: '10 Web Design Trends to Watch in 2024',
      excerpt: 'Explore the top web design trends that will dominate in 2024.',
      url: 'designtrends.com',
      collectionId: 'design',
      tags: ['Design', 'Web Design', 'Trends'],
      isFavorite: false,
      isRead: true,
      readLater: false,
      archived: false,
      savedAt: daysAgo(5),
    },
    {
      id: '4',
      title: 'SEO Checklist for Blog Posts (2024)',
      excerpt: 'A comprehensive checklist to rank your blog posts higher in search results.',
      url: 'seochecklist.com',
      collectionId: 'marketing',
      tags: ['SEO', 'Marketing', 'Blogging'],
      isFavorite: true,
      isRead: true,
      readLater: false,
      archived: false,
      savedAt: daysAgo(6),
    },
    {
      id: '5',
      title: 'Why Every Developer Should Learn TypeScript in 2025',
      excerpt: 'TypeScript adoption is skyrocketing. Here\'s why you can\'t afford to ignore it.',
      url: 'typescript.dev',
      collectionId: 'tech',
      tags: ['Web Development', 'TypeScript'],
      isFavorite: false,
      isRead: false,
      readLater: true,
      archived: false,
      savedAt: daysAgo(1),
    },
    {
      id: '6',
      title: 'The Psychology of Color in Marketing',
      excerpt: 'How color choices affect consumer behavior and brand perception.',
      url: 'colormarketing.com',
      collectionId: 'marketing',
      tags: ['Marketing', 'Design'],
      isFavorite: false,
      isRead: false,
      readLater: false,
      archived: false,
      savedAt: daysAgo(3),
    },
    {
      id: '7',
      title: 'Building a Personal Brand as a Developer',
      excerpt: 'Practical advice for growing your online presence and career.',
      url: 'personalbrand.dev',
      collectionId: 'writing',
      tags: ['Writing', 'Growth'],
      isFavorite: true,
      isRead: false,
      readLater: false,
      archived: false,
      savedAt: daysAgo(0),
    },
  ];
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeCollection, setActiveCollection] = useState(null);
  const [activeTag, setActiveTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setBookmarks(JSON.parse(stored));
    } else {
      setBookmarks(getInitialBookmarks());
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isHydrated && bookmarks.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    }
  }, [bookmarks, isHydrated]);

  // Filter bookmarks based on active filters
  const filteredBookmarks = useMemo(() => {
    let filtered = [...bookmarks];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b => 
        b.title.toLowerCase().includes(query) || 
        b.excerpt.toLowerCase().includes(query) ||
        b.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sidebar filter
    switch (activeFilter) {
      case 'favorites':
        filtered = filtered.filter(b => b.isFavorite);
        break;
      case 'recent':
        filtered = filtered.filter(b => {
          const daysAgo = (Date.now() - new Date(b.savedAt).getTime()) / (1000 * 60 * 60 * 24);
          return daysAgo <= 7;
        });
        break;
      case 'readlater':
        filtered = filtered.filter(b => b.readLater);
        break;
      case 'archive':
        filtered = filtered.filter(b => b.archived);
        break;
      default:
        filtered = filtered.filter(b => !b.archived);
    }

    // Collection filter
    if (activeCollection) {
      filtered = filtered.filter(b => b.collectionId === activeCollection);
    }

    // Tag filter
    if (activeTag) {
      filtered = filtered.filter(b => b.tags.includes(activeTag));
    }

    return filtered;
  }, [bookmarks, activeFilter, activeCollection, activeTag, searchQuery]);

  // Get count for each collection
  const getCollectionCount = (collectionId) => {
    return bookmarks.filter(b => b.collectionId === collectionId && !b.archived).length;
  };

  // Get count for each tag
  const getTagCount = (tag) => {
    return bookmarks.filter(b => b.tags.includes(tag) && !b.archived).length;
  };

  // Toggle favorite
  const toggleFavorite = (id) => {
    setBookmarks(prev => prev.map(b => 
      b.id === id ? { ...b, isFavorite: !b.isFavorite } : b
    ));
  };

  // Toggle read later
  const toggleReadLater = (id) => {
    setBookmarks(prev => prev.map(b => 
      b.id === id ? { ...b, readLater: !b.readLater } : b
    ));
  };

  // Toggle archive
  const toggleArchive = (id) => {
    setBookmarks(prev => prev.map(b => 
      b.id === id ? { ...b, archived: !b.archived, readLater: false } : b
    ));
  };

  const totalBookmarks = bookmarks.filter(b => !b.archived).length;

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Bookmarks • Blog Collection</title>
        <meta name="description" content="All your saved blog posts in one place" />
      </Head>

      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">My Bookmarks</h1>
            <p className="text-sm text-gray-500 mt-0.5">Blog collection</p>
          </div>

          <div className="flex gap-8">
            {/* ========== SIDEBAR ========== */}
            <aside className="w-64 flex-shrink-0">
              {/* All Bookmarks header with count */}
              <div className="mb-6">
                <h2 className="text-base font-medium text-gray-900 mb-3">All Bookmarks</h2>
                <p className="text-sm text-gray-500 -mt-1 mb-4">All your saved blog posts in one place</p>
                <div className="text-3xl font-semibold text-gray-800 mb-4">{totalBookmarks}</div>
              </div>

              {/* Sidebar Menu */}
              <div className="space-y-1 mb-8">
                {SIDEBAR_FILTERS.map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => {
                      setActiveFilter(filter.id);
                      setActiveCollection(null);
                      setActiveTag(null);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                      activeFilter === filter.id && !activeCollection && !activeTag
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {filter.name}
                  </button>
                ))}
              </div>

              {/* Collections Section */}
              <div className="mb-8">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                  Collections
                </h3>
                <div className="space-y-1">
                  {COLLECTIONS.map(collection => (
                    <button
                      key={collection.id}
                      onClick={() => {
                        setActiveCollection(collection.id);
                        setActiveFilter('all');
                        setActiveTag(null);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors flex justify-between items-center ${
                        activeCollection === collection.id
                          ? 'bg-gray-100 text-gray-900 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{collection.name}</span>
                      <span className="text-xs text-gray-400">{getCollectionCount(collection.id)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags Section */}
              <div>
                <div className="flex items-center justify-between px-3 mb-3">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tags</h3>
                  <button 
                    onClick={() => setShowTagDropdown(!showTagDropdown)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    {showTagDropdown ? 'Show less ▼' : 'Show more ▼'}
                  </button>
                </div>
                <div className="space-y-1">
                  {TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        setActiveTag(tag);
                        setActiveCollection(null);
                        setActiveFilter('all');
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors flex justify-between items-center ${
                        activeTag === tag
                          ? 'bg-gray-100 text-gray-900 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <TagIcon />
                        <span>{tag}</span>
                      </div>
                      <span className="text-xs text-gray-400">{getTagCount(tag)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* ========== MAIN CONTENT ========== */}
            <main className="flex-1 min-w-0">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <SearchIcon />
                  </div>
                  <input
                    type="text"
                    placeholder="Search bookmarks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-200"
                  />
                </div>
              </div>

              {/* All Bookmarks Header */}
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900">All Bookmarks</h2>
                <p className="text-sm text-gray-500">All your saved blog posts in one place</p>
              </div>

              {/* Bookmarks List */}
              <div className="space-y-6">
                {filteredBookmarks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookmarkIcon />
                    </div>
                    <p className="text-gray-500 text-sm">No bookmarks found</p>
                    <p className="text-gray-400 text-xs mt-1">Try adjusting your filters</p>
                  </div>
                ) : (
                  filteredBookmarks.map(bookmark => (
                    <div key={bookmark.id} className="group">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-base font-medium text-gray-900 mb-1">
                            {bookmark.title}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2 leading-relaxed">
                            {bookmark.excerpt}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span>{bookmark.url}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <ClockIcon />
                              <span>Saved {formatDistanceToNow(new Date(bookmark.savedAt), { addSuffix: true })}</span>
                            </div>
                            {bookmark.isRead && (
                              <>
                                <span>•</span>
                                <span className="text-green-600">Read</span>
                              </>
                            )}
                          </div>
                          {/* Tags */}
                          {bookmark.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {bookmark.tags.map(tag => (
                                <span
                                  key={tag}
                                  className="text-xs px-2 py-0.5 bg-gray-50 text-gray-500 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => toggleFavorite(bookmark.id)}
                            className="p-1.5 rounded hover:bg-gray-50 transition"
                            title={bookmark.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <HeartIcon filled={bookmark.isFavorite} />
                          </button>
                          <button
                            onClick={() => toggleReadLater(bookmark.id)}
                            className={`p-1.5 rounded hover:bg-gray-50 transition ${
                              bookmark.readLater ? 'text-blue-500' : 'text-gray-400'
                            }`}
                            title={bookmark.readLater ? 'Remove from read later' : 'Read later'}
                          >
                            <ClockIcon />
                          </button>
                          <button
                            onClick={() => toggleArchive(bookmark.id)}
                            className="p-1.5 rounded hover:bg-gray-50 transition text-gray-400"
                            title="Archive"
                          >
                            <ArchiveIcon />
                          </button>
                          <button className="p-1.5 rounded hover:bg-gray-50 transition">
                            <MoreIcon />
                          </button>
                        </div>
                      </div>
                      <div className="border-b border-gray-100 mt-4 pb-4"></div>
                    </div>
                  ))
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}