// src/components/admin/LoadingSpinner.jsx (COMPLETE FILE - ENHANCED)

import React from 'react'

const LoadingSpinner = ({ 
  size = 'md', 
  fullScreen = false, 
  text = '', 
  color = 'purple' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  const colorClasses = {
    purple: 'border-t-purple-600',
    blue: 'border-t-blue-600',
    green: 'border-t-green-600',
    red: 'border-t-red-600',
    yellow: 'border-t-yellow-500',
    white: 'border-t-white'
  }

  const containerClasses = fullScreen 
    ? 'fixed inset-0 flex justify-center items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50'
    : 'flex justify-center items-center min-h-[400px]'

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          {/* Background ring */}
          <div className={`${sizeClasses[size]} border-4 border-gray-200 dark:border-gray-700 rounded-full`} />
          {/* Animated spinner */}
          <div 
            className={`${sizeClasses[size]} border-4 ${colorClasses[color]} rounded-full animate-spin absolute top-0 left-0`}
            style={{ borderRightColor: 'transparent', borderBottomColor: 'transparent' }}
          />
        </div>
        {text && (
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  )
}

// Small spinner for buttons/inline use
export const SmallSpinner = ({ color = 'purple' }) => {
  const colorClasses = {
    purple: 'border-purple-600',
    blue: 'border-blue-600',
    green: 'border-green-600',
    red: 'border-red-600',
    white: 'border-white'
  }

  return (
    <div className="inline-block">
      <div className={`w-4 h-4 border-2 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`} />
    </div>
  )
}

// Skeleton loader for content
export const SkeletonLoader = ({ lines = 3, className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
      ))}
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
    </div>
  )
}

// Page loader (full screen with overlay)
export const PageLoader = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 z-50">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
    </div>
  )
}

export default LoadingSpinner