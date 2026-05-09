// pages/bookmarks/index.jsx - UPDATED SIDEBAR PROPS
import { useState, useMemo } from 'react';
import Head from 'next/head';
import { useAuth } from '../../hooks/useAuth';
import { useBookmarks } from '../../hooks/useBookmarks';
import { BookmarkCard } from '../../components/BookmarkCard';
import { Sidebar } from '../../components/BookMarkSidebar';
import { SearchBar } from '../../components/BookmarkSearchBar';
import { EmptyState } from '../../components/BookMarkEmptyState';

export default function BookmarksPage() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    bookmarks, 
    loading, 
    toggleFavorite,
    toggleReadLater,
    toggleArchive,
    refresh
  } = useBookmarks(user?.id);

  // Filter bookmarks based on view
  const filteredBookmarks = useMemo(() => {
    let filtered = [...bookmarks];

    if (activeView !== 'archive') {
      filtered = filtered.filter(b => !b.archived);
    }

    switch (activeView) {
      case 'favorites':
        filtered = filtered.filter(b => b.isFavorite);
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

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b =>
        b.title?.toLowerCase().includes(query) ||
        b.excerpt?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [bookmarks, activeView, searchQuery]);

  if (!user) {
    return <EmptyState type="unauthenticated" />;
  }

  if (loading && bookmarks.length === 0) {
    return <EmptyState type="loading" />;
  }

  return (
    <>
      <Head>
        <title>My Bookmarks • Blog Collection</title>
      </Head>

      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">My Bookmarks</h1>
              <p className="text-sm text-gray-500 mt-0.5">Your curated collection</p>
            </div>
            <button 
              onClick={refresh}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded border"
            >
              ↻ Refresh
            </button>
          </div>

          <div className="flex gap-10">
            <Sidebar
              activeView={activeView}
              onViewChange={setActiveView}
              bookmarks={bookmarks}
            />

            <main className="flex-1 min-w-0">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />

              <div className="space-y-6">
                {filteredBookmarks.length === 0 ? (
                  <EmptyState type="no-results" />
                ) : (
                  filteredBookmarks.map(bookmark => (
                    <BookmarkCard
                      key={bookmark.id}
                      bookmark={bookmark}
                      onToggleFavorite={toggleFavorite}
                      onToggleReadLater={toggleReadLater}
                      onToggleArchive={toggleArchive}
                    />
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