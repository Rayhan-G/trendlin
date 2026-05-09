// components/BulkActionBar.jsx
import { memo } from 'react';

export const BulkActionBar = memo(({ count, onArchive, onClear }) => {
  if (count === 0) return null;
  
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4 z-50">
      <span className="text-sm font-medium">{count} selected</span>
      <button 
        onClick={onArchive}
        className="text-sm text-gray-300 hover:text-white transition"
      >
        Archive
      </button>
      <button 
        onClick={onClear}
        className="text-sm text-gray-300 hover:text-white transition"
      >
        Clear
      </button>
    </div>
  );
});

BulkActionBar.displayName = 'BulkActionBar';