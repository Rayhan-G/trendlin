// components/BookmarkSearchBar.jsx
import { memo } from 'react';

const SearchIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export const SearchBar = memo(({ value, onChange, placeholder = "Search bookmarks..." }) => {
  return (
    <div className="mb-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon />
        </div>
        <input 
          type="text" 
          placeholder={placeholder} 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-200"
        />
      </div>
    </div>
  );
});

SearchBar.displayName = 'SearchBar';