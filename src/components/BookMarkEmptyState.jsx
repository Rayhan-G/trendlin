// components/BookMarkEmptyState.jsx
import { memo } from 'react';

const BookmarkIcon = () => (
  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const LoadingSpinner = () => (
  <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
);

export const EmptyState = memo(({ type = 'no-results' }) => {
  if (type === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-sm text-gray-500 mt-3">Loading your bookmarks...</p>
        </div>
      </div>
    );
  }

  if (type === 'unauthenticated') {
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

  if (type === 'no-bookmarks') {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <BookmarkIcon />
        </div>
        <p className="text-gray-500 text-sm">No bookmarks yet</p>
        <p className="text-gray-400 text-xs mt-1">Save some posts to see them here</p>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
        <BookmarkIcon />
      </div>
      <p className="text-gray-500 text-sm">No matching bookmarks found</p>
      <p className="text-gray-400 text-xs mt-1">Try adjusting your search or filters</p>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';