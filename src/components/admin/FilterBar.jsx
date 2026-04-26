// src/components/admin/FilterBar.jsx (ALL DEVICES COMPATIBLE)

import { useState, useEffect, useCallback, useMemo } from 'react'
import { debounce } from 'lodash'

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const ClearIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default function FilterBar({ 
  onSearch, 
  onFilterChange, 
  filters = [],
  searchPlaceholder = 'Search...',
  showDateRange = false,
  onDateRangeChange,
  debounceDelay = 300,
  initialSearch = '',
  initialFilters = {},
  initialDateRange = { start: '', end: '' }
}) {
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [activeFilters, setActiveFilters] = useState(initialFilters)
  const [dateRange, setDateRange] = useState(initialDateRange)
  const [dateError, setDateError] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const debouncedSearch = useMemo(
    () => debounce((value) => {
      onSearch?.(value)
    }, debounceDelay),
    [onSearch, debounceDelay]
  )

  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    debouncedSearch(value)
  }

  const handleFilterChange = (key, value) => {
    let newFilters
    if (value === '' || value === null || value === undefined) {
      const { [key]: _, ...rest } = activeFilters
      newFilters = rest
    } else {
      newFilters = { ...activeFilters, [key]: value }
    }
    setActiveFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const validateDateRange = (start, end) => {
    if (start && end && new Date(start) > new Date(end)) {
      setDateError('Start date cannot be after end date')
      return false
    }
    setDateError('')
    return true
  }

  const handleDateRangeChange = (field, value) => {
    const newRange = { ...dateRange, [field]: value }
    setDateRange(newRange)
    
    if (validateDateRange(newRange.start, newRange.end)) {
      if (newRange.start && newRange.end) {
        onDateRangeChange?.(newRange)
      } else if (!newRange.start && !newRange.end) {
        onDateRangeChange?.({ start: '', end: '' })
      }
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setActiveFilters({})
    setDateRange({ start: '', end: '' })
    setDateError('')
    debouncedSearch.cancel()
    onSearch?.('')
    onFilterChange?.({})
    onDateRangeChange?.({ start: '', end: '' })
  }

  const hasActiveFilters = searchTerm !== '' || 
    Object.keys(activeFilters).length > 0 || 
    dateRange.start !== '' || 
    dateRange.end !== ''

  const getActiveFilterCount = () => {
    let count = 0
    if (searchTerm !== '') count++
    count += Object.keys(activeFilters).length
    if (dateRange.start !== '') count++
    if (dateRange.end !== '') count++
    return count
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 items-stretch sm:items-center">
        {/* Search */}
        <div className="flex-1 min-w-[180px] sm:min-w-[200px]">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </span>
            <input
              type="text"
              className="w-full pl-9 pr-8 py-1.5 sm:py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleSearch}
              aria-label="Search"
            />
            {searchTerm && (
              <button
                onClick={() => handleSearch({ target: { value: '' } })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <ClearIcon />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Filters */}
        {filters.map((filter) => (
          <select
            key={filter.key}
            className="px-3 py-1.5 sm:py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            value={activeFilters[filter.key] || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            aria-label={`Filter by ${filter.label}`}
          >
            <option value="">All {filter.label}</option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}

        {/* Date Range */}
        {showDateRange && (
          <div className="flex flex-col gap-1">
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <input
                type="date"
                className="px-3 py-1.5 sm:py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                value={dateRange.start}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                aria-label="Start date"
              />
              <span className="hidden sm:inline text-gray-500 text-sm">→</span>
              <input
                type="date"
                className="px-3 py-1.5 sm:py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                value={dateRange.end}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                aria-label="End date"
              />
            </div>
            {dateError && (
              <p className="text-red-500 text-xs">{dateError}</p>
            )}
          </div>
        )}

        {/* Active Filters Indicator */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full whitespace-nowrap">
              {getActiveFilterCount()} active filter{getActiveFilterCount() !== 1 ? 's' : ''}
            </span>
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 sm:py-2 text-sm text-red-500 hover:text-red-600 transition flex items-center gap-1 whitespace-nowrap"
              aria-label="Clear all filters"
            >
              <ClearIcon />
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Active Filters Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          {searchTerm && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
              Search: "{searchTerm.length > 20 ? searchTerm.substring(0, 20) + '...' : searchTerm}"
              <button
                onClick={() => handleSearch({ target: { value: '' } })}
                className="ml-1 hover:text-purple-900 text-base"
              >
                ×
              </button>
            </span>
          )}
          {Object.entries(activeFilters).map(([key, value]) => {
            const filter = filters.find(f => f.key === key)
            const option = filter?.options.find(opt => opt.value === value)
            return (
              <span key={key} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                {filter?.label || key}: {option?.label || value}
                <button
                  onClick={() => handleFilterChange(key, '')}
                  className="ml-1 hover:text-gray-900 dark:hover:text-white text-base"
                >
                  ×
                </button>
              </span>
            )
          })}
          {dateRange.start && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
              From: {dateRange.start}
              <button
                onClick={() => handleDateRangeChange('start', '')}
                className="ml-1 hover:text-gray-900 text-base"
              >
                ×
              </button>
            </span>
          )}
          {dateRange.end && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
              To: {dateRange.end}
              <button
                onClick={() => handleDateRangeChange('end', '')}
                className="ml-1 hover:text-gray-900 text-base"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}