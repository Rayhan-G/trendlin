// src/components/admin/DataTable.jsx (COMPLETE FIXED FILE)

import { useState, useMemo, useCallback } from 'react'

// Icons
const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const ChevronUpIcon = () => (
  <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

export default function DataTable({ 
  columns, 
  data, 
  actions, 
  searchable = true, 
  searchPlaceholder = 'Search...',
  searchFields = null, // Optional: specify which fields to search
  sortable = true,
  selectable = false,
  onSelectionChange,
  loading = false,
  emptyMessage = 'No data available',
  itemsPerPage = 10,
  itemsPerPageOptions = [5, 10, 25, 50, 100]
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')
  const [selectedRows, setSelectedRows] = useState(new Set())
  const [rowsPerPage, setRowsPerPage] = useState(itemsPerPage)

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data

    const searchLower = searchTerm.toLowerCase()
    const fieldsToSearch = searchFields || columns.map(col => col.key)

    return data.filter(row => {
      return fieldsToSearch.some(field => {
        const value = getNestedValue(row, field)
        if (value === null || value === undefined) return false
        return String(value).toLowerCase().includes(searchLower)
      })
    })
  }, [data, searchTerm, searchFields, columns])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortable || !sortColumn) return filteredData

    return [...filteredData].sort((a, b) => {
      const aVal = getNestedValue(a, sortColumn)
      const bVal = getNestedValue(b, sortColumn)
      
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }
      
      const comparison = String(aVal).localeCompare(String(bVal))
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredData, sortColumn, sortDirection, sortable])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    return sortedData.slice(startIndex, startIndex + rowsPerPage)
  }, [sortedData, currentPage, rowsPerPage])

  const totalPages = Math.ceil(sortedData.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage + 1
  const endIndex = Math.min(startIndex + rowsPerPage - 1, sortedData.length)

  // Helper to get nested object values (e.g., 'user.name')
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  // Handle sort
  const handleSort = (columnKey) => {
    if (!sortable) return
    
    if (sortColumn === columnKey) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  // Handle row selection
  const handleRowSelect = (rowId, checked) => {
    const newSelected = new Set(selectedRows)
    if (checked) {
      newSelected.add(rowId)
    } else {
      newSelected.delete(rowId)
    }
    setSelectedRows(newSelected)
    onSelectionChange?.(Array.from(newSelected))
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = paginatedData.map(row => row.id)
      setSelectedRows(new Set(allIds))
      onSelectionChange?.(allIds)
    } else {
      setSelectedRows(new Set())
      onSelectionChange?.([])
    }
  }

  // Reset page when rows per page changes
  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(value)
    setCurrentPage(1)
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className="px-4 py-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20 animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  {columns.map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Search Bar */}
      {searchable && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="relative flex-1 max-w-md">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </span>
              <input
                type="text"
                className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            
            {/* Rows per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Show:</span>
              <select
                className="px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={rowsPerPage}
                onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
              >
                {itemsPerPageOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {selectable && (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    checked={paginatedData.length > 0 && selectedRows.size === paginatedData.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
              )}
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 ${col.sortable !== false && sortable ? 'cursor-pointer hover:text-gray-900 dark:hover:text-white' : ''}`}
                  onClick={() => col.sortable !== false && sortable && handleSort(col.key)}
                >
                  {col.header}
                  {sortable && sortColumn === col.key && (
                    sortDirection === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />
                  )}
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0) + (selectable ? 1 : 0)} className="px-4 py-12 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => {
                const rowId = row.id || rowIdx
                const isSelected = selectedRows.has(rowId)
                
                return (
                  <tr 
                    key={rowId} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition ${isSelected ? 'bg-purple-50 dark:bg-purple-900/20' : ''}`}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          checked={isSelected}
                          onChange={(e) => handleRowSelect(rowId, e.target.checked)}
                        />
                      </td>
                    )}
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {col.render ? col.render(getNestedValue(row, col.key), row) : getNestedValue(row, col.key)}
                      </td>
                    ))}
                    {actions && actions.length > 0 && (
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {actions.map((action, actionIdx) => (
                            <button
                              key={actionIdx}
                              onClick={() => action.onClick(row)}
                              disabled={action.disabled?.(row)}
                              className={`
                                px-3 py-1 text-xs rounded-lg transition-all font-medium
                                ${action.color === 'red' ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50' : ''}
                                ${action.color === 'green' ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50' : ''}
                                ${action.color === 'blue' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50' : ''}
                                ${action.color === 'yellow' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50' : ''}
                                ${(!action.color || action.color === 'gray') ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600' : ''}
                                ${action.disabled?.(row) ? 'opacity-50 cursor-not-allowed' : ''}
                              `}
                              title={action.tooltip?.(row)}
                            >
                              {action.icon && <span className="mr-1">{action.icon}</span>}
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {startIndex} to {endIndex} of {sortedData.length} results
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <div className="flex gap-1">
              {(() => {
                const pages = []
                const maxVisible = 5
                let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
                let endPage = Math.min(totalPages, startPage + maxVisible - 1)
                
                if (endPage - startPage + 1 < maxVisible) {
                  startPage = Math.max(1, endPage - maxVisible + 1)
                }
                
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(i)
                }
                
                return pages.map(page => (
                  <button
                    key={page}
                    className={`px-3 py-1 text-sm rounded-lg transition ${
                      page === currentPage
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))
              })()}
            </div>
            <button
              className="px-3 py-1 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}