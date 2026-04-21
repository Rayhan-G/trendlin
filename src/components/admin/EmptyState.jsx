// src/components/admin/EmptyState.jsx (COMPLETE FILE - ENHANCED)

import React from 'react'

const EmptyState = ({ 
  icon, 
  title, 
  message, 
  action,
  variant = 'default',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'p-6',
    md: 'p-12',
    lg: 'p-16'
  }

  const iconSizeClasses = {
    sm: 'text-3xl',
    md: 'text-5xl',
    lg: 'text-6xl'
  }

  const variantClasses = {
    default: 'bg-white dark:bg-gray-800',
    card: 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700',
    minimal: 'bg-transparent'
  }

  return (
    <div className={`${variantClasses[variant]} ${sizeClasses[size]} rounded-xl text-center`}>
      <div className={`${iconSizeClasses[size]} mb-4 opacity-50`}>
        {icon || getDefaultIcon()}
      </div>
      
      <h3 className={`font-semibold text-gray-900 dark:text-white mb-2 ${
        size === 'sm' ? 'text-base' : 'text-lg'
      }`}>
        {title || getDefaultTitle()}
      </h3>
      
      <p className={`text-gray-500 dark:text-gray-400 mb-4 ${
        size === 'sm' ? 'text-xs' : 'text-sm'
      }`}>
        {message || getDefaultMessage()}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          disabled={action.disabled}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {action.icon && <span className="text-sm">{action.icon}</span>}
          {action.label}
        </button>
      )}
    </div>
  )
}

// Helper functions for default values
const getDefaultIcon = () => {
  return '📭'
}

const getDefaultTitle = () => {
  return 'No data found'
}

const getDefaultMessage = () => {
  return 'Create your first item to get started'
}

// Pre-configured empty states for common scenarios
export const NoPostsEmptyState = ({ action }) => (
  <EmptyState
    icon="📝"
    title="No posts yet"
    message="Start writing your first blog post"
    action={action}
  />
)

export const NoCommentsEmptyState = ({ action }) => (
  <EmptyState
    icon="💬"
    title="No comments"
    message="Be the first to leave a comment"
    action={action}
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
  />
)

export const NoCategoriesEmptyState = ({ action }) => (
  <EmptyState
    icon="📁"
    title="No categories"
    message="Create categories to organize your posts"
    action={action}
  />
)

export const NoTagsEmptyState = ({ action }) => (
  <EmptyState
    icon="🏷️"
    title="No tags"
    message="Add tags to help readers find your content"
    action={action}
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
  />
)

export default EmptyState