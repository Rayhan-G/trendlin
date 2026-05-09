// components/BookMarkSidebar.jsx - WITHOUT COLLECTIONS & POPULAR TAGS
import { memo } from 'react';

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

export const Sidebar = memo(({ 
  activeView, 
  onViewChange, 
  bookmarks = []
}) => {
  // Calculate counts dynamically from bookmarks
  const counts = {
    all: bookmarks.filter(b => !b.archived).length,
    favorites: bookmarks.filter(b => b.isFavorite && !b.archived).length,
    recent: bookmarks.filter(b => {
      if (b.archived) return false;
      const daysAgo = (Date.now() - new Date(b.savedDate).getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    }).length,
    readlater: bookmarks.filter(b => b.readLater && !b.archived).length,
    archive: bookmarks.filter(b => b.archived).length
  };

  return (
    <aside className="w-56 flex-shrink-0">
      <div className="mb-6">
        <div className="text-4xl font-bold text-gray-800 mb-1">{counts.all}</div>
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">All Bookmarks</div>
        <p className="text-xs text-gray-400 mt-1">All your saved blog posts in one place</p>
      </div>

      <nav className="space-y-1">
        <button 
          onClick={() => onViewChange('all')}
          className={`w-full text-left px-3 py-1.5 rounded-md text-sm flex items-center justify-between ${activeView === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <span>All Bookmarks</span>
          <span className="text-xs">{counts.all}</span>
        </button>
        
        <button 
          onClick={() => onViewChange('favorites')}
          className={`w-full text-left px-3 py-1.5 rounded-md text-sm flex items-center justify-between ${activeView === 'favorites' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <span className="flex items-center gap-2"><StarIcon /> Favorites</span>
          <span className="text-xs">{counts.favorites}</span>
        </button>
        
        <button 
          onClick={() => onViewChange('recent')}
          className={`w-full text-left px-3 py-1.5 rounded-md text-sm flex items-center justify-between ${activeView === 'recent' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <span className="flex items-center gap-2"><ClockIcon /> Recently Added</span>
          <span className="text-xs">{counts.recent}</span>
        </button>
        
        <button 
          onClick={() => onViewChange('readlater')}
          className={`w-full text-left px-3 py-1.5 rounded-md text-sm flex items-center justify-between ${activeView === 'readlater' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <span className="flex items-center gap-2"><BookmarkIcon /> Read Later</span>
          <span className="text-xs">{counts.readlater}</span>
        </button>
        
        <button 
          onClick={() => onViewChange('archive')}
          className={`w-full text-left px-3 py-1.5 rounded-md text-sm flex items-center justify-between ${activeView === 'archive' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <span className="flex items-center gap-2"><ArchiveIcon /> Archive</span>
          <span className="text-xs">{counts.archive}</span>
        </button>
      </nav>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';