// src/components/admin/EmptyState.jsx (ALL DEVICES COMPATIBLE)

import React, { useEffect, useState } from 'react'

const EmptyState = ({ 
  icon, 
  title, 
  message, 
  action,
  variant = 'default',
  size = 'md'
}) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 640)
    }
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  const sizeClasses = {
    sm: 'p-4 sm:p-6',
    md: 'p-6 sm:p-8 md:p-12',
    lg: 'p-8 sm:p-12 md:p-16'
  }

  const iconSizeClasses = {
    sm: 'text-2xl sm:text-3xl',
    md: 'text-3xl sm:text-4xl md:text-5xl',
    lg: 'text-4xl sm:text-5xl md:text-6xl'
  }

  const variantClasses = {
    default: 'bg-white dark:bg-gray-800',
    card: 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700',
    minimal: 'bg-transparent'
  }

  return (
    <div className={`${variantClasses[variant]} ${sizeClasses[size]} rounded-xl text-center`}>
      <div className={`${iconSizeClasses[size]} mb-3 sm:mb-4 opacity-50`}>
        {icon || getDefaultIcon()}
      </div>
      
      <h3 className={`font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2 ${
        size === 'sm' ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
      }`}>
        {title || getDefaultTitle()}
      </h3>
      
      <p className={`text-gray-500 dark:text-gray-400 mb-3 sm:mb-4 ${
        size === 'sm' ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
      }`}>
        {message || getDefaultMessage()}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          disabled={action.disabled}
          className={`inline-flex items-center gap-1.5 sm:gap-2 ${
            isMobile ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
          } bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-95`}
        >
          {action.icon && <span className="text-xs sm:text-sm">{action.icon}</span>}
          {action.label}
        </button>
      )}
    </div>
  )
}

const getDefaultIcon = () => {
  return '📭'
}

const getDefaultTitle = () => {
  return 'No data found'
}

const getDefaultMessage = () => {
  return 'Create your first item to get started'
}

export const NoPostsEmptyState = ({ action }) => (
  <EmptyState
    icon="📝"
    title="No posts yet"
    message="Start writing your first blog post"
    action={action}
    variant="card"
  />
)

export const NoCommentsEmptyState = ({ action }) => (
  <EmptyState
    icon="💬"
    title="No comments"
    message="Be the first to leave a comment"
    action={action}
    variant="card"
  />
)

export const NoSearchResults = ({ query, action }) => (
  <EmptyState
    icon="🔍"
    title="No results found"
    message={`We couldn't find anything matching "${query}"`}
    action={action}
  />
)

export const NoNotificationsEmptyState = () => (
  <EmptyState
    icon="🔔"
    title="All caught up!"
    message="You have no new notifications"
    variant="minimal"
  />
)

export const NoCategoriesEmptyState = ({ action }) => (
  <EmptyState
    icon="📁"
    title="No categories"
    message="Create categories to organize your posts"
    action={action}
    variant="card"
  />
)

export const NoTagsEmptyState = ({ action }) => (
  <EmptyState
    icon="🏷️"
    title="No tags"
    message="Add tags to help readers find your content"
    action={action}
    variant="card"
  />
)

export const NoAnalyticsEmptyState = () => (
  <EmptyState
    icon="📊"
    title="No data yet"
    message="Analytics will appear once your posts get traffic"
    variant="card"
  />
)

export const NoMediaEmptyState = ({ action }) => (
  <EmptyState
    icon="🖼️"
    title="No media files"
    message="Upload images and videos for your posts"
    action={action}
    variant="card"
  />
)

export default EmptyState