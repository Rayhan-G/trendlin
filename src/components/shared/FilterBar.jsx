// src/components/shared/FilterBar.jsx
import { useState } from 'react'

export default function FilterBar({ 
  onSearch, 
  onFilterChange, 
  filters = [],
  searchPlaceholder = 'Search...',
  showDateRange = false,
  onDateRangeChange
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilters, setActiveFilters] = useState({})
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    onSearch?.(value)
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...activeFilters, [key]: value }
    if (!value) delete newFilters[key]
    setActiveFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const handleDateRangeChange = (field, value) => {
    const newRange = { ...dateRange, [field]: value }
    setDateRange(newRange)
    if (newRange.start && newRange.end) {
      onDateRangeChange?.(newRange)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setActiveFilters({})
    setDateRange({ start: '', end: '' })
    onSearch?.('')
    onFilterChange?.({})
    onDateRangeChange?.({ start: '', end: '' })
  }

  const hasActiveFilters = searchTerm || Object.keys(activeFilters).length > 0 || dateRange.start || dateRange.end

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <div className="filters-bar">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        {filters.map((filter) => (
          <select
            key={filter.key}
            className="form-select"
            style={{ width: 'auto', minWidth: '120px' }}
            value={activeFilters[filter.key] || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
          >
            <option value="">All {filter.label}</option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}

        {showDateRange && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto' }}
              value={dateRange.start}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              placeholder="Start date"
            />
            <span style={{ alignSelf: 'center' }}>to</span>
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto' }}
              value={dateRange.end}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              placeholder="End date"
            />
          </div>
        )}

        {hasActiveFilters && (
          <button className="btn btn-outline btn-sm" onClick={clearFilters}>
            Clear All
          </button>
        )}
      </div>
    </div>
  )
}