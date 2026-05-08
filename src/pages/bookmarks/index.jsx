// src/pages/bookmarks/index.jsx
// UPDATED to work with Supabase instead of localStorage

import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

// ============================================
// SIMPLE SVG ICONS (same as before)
// ============================================
const StarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BookmarkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const ArchiveIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
  </svg>
);

const TagIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-5-5A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// ============================================
// COLLECTIONS & TAGS (for filtering)
// ============================================
const COLLECTIONS = [
  { id: 'tech', name: 'Tech Blogs' },
  { id: 'writing', name: 'Writing & Growth' },
  { id: 'design', name: 'Design Inspiration' },
  { id: 'marketing', name: 'Marketing & SEO' },
  { id: 'finance', name: 'Personal Finance' },
];

const TAGS = ['Productivity', 'Web Development', 'AI', 'Design', 'Marketing'];

// ============================================
// MAIN COMPONENT - NOW LOADS FROM SUPABASE
// ============================================
export default function BookmarksPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [activeView, setActiveView] = useState('all');
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllTags, setShowAllTags] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load bookmarks from Supabase
  useEffect(() => {
    if (!user) {
      setBookmarks([]);
      setLoading(false);
      return;
    }

    const fetchBookmarks = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Transform Supabase data to match your component structure
        const transformedBookmarks = data.map(bookmark => ({
          id: bookmark.id,
          title: bookmark.post_title,
          excerpt: bookmark.post_excerpt,
          domain: extractDomain(bookmark.post_slug),
          collection: inferCollection(bookmark.post_title, bookmark.tags),
          collectionId: inferCollectionId(bookmark.post_title, bookmark.tags),
          tags: bookmark.tags || extractTags(bookmark.post_title),
          savedDate: bookmark.created_at,
          read: bookmark.is_read || false,
          favorite: bookmark.is_favorite || false,
          readLater: bookmark.read_later || false,
          archived: bookmark.archived || false,
          postSlug: bookmark.post_slug,
        }));
        
        setBookmarks(transformedBookmarks);
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();

    // Listen for bookmark updates from the button
    const handleBookmarkUpdate = (event) => {
      fetchBookmarks(); // Refresh the list
    };

    window.addEventListener('bookmarkUpdated', handleBookmarkUpdate);
    return () => window.removeEventListener('bookmarkUpdated', handleBookmarkUpdate);
  }, [user]);

  // Helper functions
  const extractDomain = (slug) => {
    if (!slug) return 'blog.post';
    return slug.includes('.') ? slug.split('/')[0] : `${slug}.com`;
  };

  const extractTags = (title) => {
    const tags = [];
    if (title.toLowerCase().includes('writing')) tags.push('Writing');
    if (title.toLowerCase().includes('productivity')) tags.push('Productivity');
    if (title.toLowerCase().includes('design')) tags.push('Design');
    if (title.toLowerCase().includes('seo')) tags.push('SEO');
    if (title.toLowerCase().includes('marketing')) tags.push('Marketing');
    if (tags.length === 0) tags.push('Reading');
    return tags;
  };

  const inferCollection = (title, tags) => {
    if (title.toLowerCase().includes('tech') || title.toLowerCase().includes('developer')) return 'Tech Blogs';
    if (title.toLowerCase().includes('write') || title.toLowerCase().includes('growth')) return 'Writing & Growth';
    if (title.toLowerCase().includes('design')) return 'Design Inspiration';
    if (title.toLowerCase().includes('seo') || title.toLowerCase().includes('marketing')) return 'Marketing & SEO';
    if (title.toLowerCase().includes('finance') || title.toLowerCase().includes('money')) return 'Personal Finance';
    return 'Tech Blogs';
  };

  const inferCollectionId = (title, tags) => {
    if (title.toLowerCase().includes('tech') || title.toLowerCase().includes('developer')) return 'tech';
    if (title.toLowerCase().includes('write') || title.toLowerCase().includes('growth')) return 'writing';
    if (title.toLowerCase().includes('design')) return 'design';
    if (title.toLowerCase().includes('seo') || title.toLowerCase().includes('marketing')) return 'marketing';
    if (title.toLowerCase().includes('finance') || title.toLowerCase().includes('money')) return 'finance';
    return 'tech';
  };

  const formatDate = (dateISO) => {
    if (!dateISO) return 'Saved recently';
    const date = new Date(dateISO);
    return `Saved on ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  };

  // Update bookmark properties in Supabase
  const updateBookmarkProperty = async (id, property, value) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .update({ [property]: value })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setBookmarks(prev => prev.map(b =>
        b.id === id ? { ...b, [property]: value } : b
      ));
    } catch (error) {
      console.error(`Error updating ${property}:`, error);
    }
  };

  const toggleFavorite = (id) => {
    const bookmark = bookmarks.find(b => b.id === id);
    updateBookmarkProperty(id, 'is_favorite', !bookmark?.favorite);
  };

  const toggleReadLater = (id) => {
    const bookmark = bookmarks.find(b => b.id === id);
    updateBookmarkProperty(id, 'read_later', !bookmark?.readLater);
  };

  const toggleArchive = (id) => {
    const bookmark = bookmarks.find(b => b.id === id);
    updateBookmarkProperty(id, 'archived', !bookmark?.archived);
  };

  // Filter bookmarks
  const filteredBookmarks = useMemo(() => {
    let filtered = [...bookmarks];

    if (activeView !== 'archive') {
      filtered = filtered.filter(b => !b.archived);
    }

    switch (activeView) {
      case 'favorites':
        filtered = filtered.filter(b => b.favorite);
        break;
      case 'recent':
        filtered = filtered.filter(b => {
          const daysAgo = (Date.now() - new Date(b.savedDate).getTime()) / (1000 * 60 * 60 * 24);
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
        break;
    }

    if (selectedCollection) {
      filtered = filtered.filter(b => b.collectionId === selectedCollection);
    }

    if (selectedTag) {
      filtered = filtered.filter(b => b.tags.includes(selectedTag));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b =>
        b.title.toLowerCase().includes(query) ||
        b.excerpt.toLowerCase().includes(query) ||
        b.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [bookmarks, activeView, selectedCollection, selectedTag, searchQuery]);

  const totalBookmarks = bookmarks.filter(b => !b.archived).length;
  const displayedTags = showAllTags ? TAGS : TAGS.slice(0, 5);

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Loading your bookmarks...</p>
        </div>
      </div>
    );
  }

  // No user logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookmarkIcon />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Save your favorite posts</h2>
          <p className="text-gray-500 mb-6">Sign in to bookmark posts and access them from anywhere.</p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openAuth', { detail: 'login' }))}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
          >
            Sign In
          </button>
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
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">My Bookmarks</h1>
            <p className="text-sm text-gray-500 mt-0.5">Blog collection</p>
          </div>

          <div className="flex gap-10">
            {/* SIDEBAR - same as before */}
            <aside className="w-56 flex-shrink-0">
              <div className="mb-6">
                <div className="text-4xl font-bold text-gray-800 mb-1">{totalBookmarks}</div>
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">All Bookmarks</div>
                <p className="text-xs text-gray-400 mt-1">All your saved blog posts in one place</p>
              </div>

              <nav className="space-y-1 mb-8">
                <button onClick={() => { setActiveView('all'); setSelectedCollection(null); setSelectedTag(null); }}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-sm ${activeView === 'all' && !selectedCollection && !selectedTag ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                  All Bookmarks
                </button>
                <button onClick={() => { setActiveView('favorites'); setSelectedCollection(null); setSelectedTag(null); }}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-sm flex items-center gap-2 ${activeView === 'favorites' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                  <StarIcon /> Favorites
                </button>
                <button onClick={() => { setActiveView('recent'); setSelectedCollection(null); setSelectedTag(null); }}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-sm flex items-center gap-2 ${activeView === 'recent' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                  <ClockIcon /> Recently Added
                </button>
                <button onClick={() => { setActiveView('readlater'); setSelectedCollection(null); setSelectedTag(null); }}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-sm flex items-center gap-2 ${activeView === 'readlater' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                  <BookmarkIcon /> Read Later
                </button>
                <button onClick={() => { setActiveView('archive'); setSelectedCollection(null); setSelectedTag(null); }}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-sm flex items-center gap-2 ${activeView === 'archive' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                  <ArchiveIcon /> Archive
                </button>
              </nav>

              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">Collections</h3>
                <div className="space-y-0.5">
                  {COLLECTIONS.map(collection => (
                    <button key={collection.id} onClick={() => { setSelectedCollection(collection.id); setActiveView('all'); setSelectedTag(null); }}
                      className={`w-full text-left px-3 py-1.5 rounded-md text-sm ${selectedCollection === collection.id ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                      {collection.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between px-3 mb-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tags</h3>
                  {TAGS.length > 5 && (<button onClick={() => setShowAllTags(!showAllTags)} className="text-xs text-gray-400 hover:text-gray-600">
                    {showAllTags ? 'Show less' : 'Show more'} ▼
                  </button>)}
                </div>
                <div className="space-y-0.5">
                  {displayedTags.map(tag => (
                    <button key={tag} onClick={() => { setSelectedTag(tag); setActiveView('all'); setSelectedCollection(null); }}
                      className={`w-full text-left px-3 py-1.5 rounded-md text-sm flex items-center gap-2 ${selectedTag === tag ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                      <TagIcon /> {tag}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 min-w-0">
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
                  <input type="text" placeholder="Search bookmarks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-200" />
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900">All Bookmarks</h2>
                <p className="text-sm text-gray-500">All your saved blog posts in one place</p>
              </div>

              <div className="space-y-6">
                {filteredBookmarks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3"><BookmarkIcon /></div>
                    <p className="text-gray-500 text-sm">No bookmarks found</p>
                    <p className="text-gray-400 text-xs mt-1">Save some posts to see them here</p>
                  </div>
                ) : (
                  filteredBookmarks.map(bookmark => (
                    <div key={bookmark.id} className="border-b border-gray-100 pb-5 last:border-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-4">
                          <a href={`/post/${bookmark.postSlug}`} className="text-base font-semibold text-gray-900 mb-1 hover:text-blue-600 transition">
                            {bookmark.title}
                          </a>
                          <p className="text-sm text-gray-500 mb-2 leading-relaxed">{bookmark.excerpt}</p>
                          
                          <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                            <div className="flex items-center gap-1"><GlobeIcon /><span>{bookmark.domain}</span></div>
                            <div className="flex items-center gap-1"><CalendarIcon /><span>{formatDate(bookmark.savedDate)}</span></div>
                            {bookmark.read && <span className="text-green-600 font-medium">Read</span>}
                          </div>

                          <div className="text-xs text-gray-500 mb-2">Collection <span className="text-gray-700">{bookmark.collection}</span></div>

                          <div className="flex flex-wrap gap-1.5">
                            {bookmark.tags.map(tag => (
                              <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-600">{tag}</span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5">
                          <button onClick={() => toggleFavorite(bookmark.id)} className={`p-1.5 rounded-md transition-colors ${bookmark.favorite ? 'text-yellow-500' : 'text-gray-300 hover:text-gray-400'}`} title={bookmark.favorite ? 'Remove from favorites' : 'Add to favorites'}>
                            <StarIcon />
                          </button>
                          <button onClick={() => toggleReadLater(bookmark.id)} className={`p-1.5 rounded-md transition-colors ${bookmark.readLater ? 'text-blue-500' : 'text-gray-300 hover:text-gray-400'}`} title={bookmark.readLater ? 'Remove from read later' : 'Read later'}>
                            <BookmarkIcon />
                          </button>
                          <button onClick={() => toggleArchive(bookmark.id)} className="p-1.5 rounded-md text-gray-300 hover:text-gray-400 transition-colors" title="Archive">
                            <ArchiveIcon />
                          </button>
                        </div>
                      </div>
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