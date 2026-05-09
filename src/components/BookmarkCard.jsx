// components/BookmarkCard.jsx - ALL BUTTONS WORKING
import { memo } from 'react';

export const BookmarkCard = memo(({ 
  bookmark, 
  onToggleFavorite, 
  onToggleReadLater, 
  onToggleArchive 
}) => {
  const postUrl = bookmark.slug ? `/blog/${bookmark.slug}` : '#';
  
  const formatDate = (dateISO) => {
    if (!dateISO) return 'Saved recently';
    return new Date(dateISO).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="border-b border-gray-100 pb-5 last:border-0">
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-4">
          <a 
            href={postUrl}
            className="text-base font-semibold text-gray-900 mb-1 hover:text-blue-600 transition block"
          >
            {bookmark.title}
          </a>
          
          {bookmark.excerpt && (
            <p className="text-sm text-gray-500 mb-2 leading-relaxed">
              {bookmark.excerpt}
            </p>
          )}
          
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
            <span>{bookmark.slug?.split('/')[0] || 'trendlin.com'}</span>
            <span>{formatDate(bookmark.savedDate)}</span>
          </div>

          {bookmark.tags && bookmark.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {bookmark.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded text-xs bg-gray-50 text-gray-600">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* FAVORITE BUTTON */}
          <button 
            onClick={() => onToggleFavorite(bookmark.id, bookmark.isFavorite)}
            className={`p-2 rounded-md transition-colors ${
              bookmark.isFavorite 
                ? 'text-yellow-500 bg-yellow-50' 
                : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
            }`}
            title={bookmark.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg className="w-5 h-5" fill={bookmark.isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>

          {/* READ LATER BUTTON */}
          <button 
            onClick={() => onToggleReadLater(bookmark.id, bookmark.readLater)}
            className={`p-2 rounded-md transition-colors ${
              bookmark.readLater 
                ? 'text-blue-500 bg-blue-50' 
                : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
            }`}
            title={bookmark.readLater ? 'Remove from read later' : 'Read later'}
          >
            <svg className="w-5 h-5" fill={bookmark.readLater ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>

          {/* ARCHIVE BUTTON */}
          <button 
            onClick={() => onToggleArchive(bookmark.id, bookmark.archived)}
            className={`p-2 rounded-md transition-colors ${
              bookmark.archived 
                ? 'text-gray-500 bg-gray-100' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title={bookmark.archived ? 'Unarchive' : 'Archive'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});

BookmarkCard.displayName = 'BookmarkCard';