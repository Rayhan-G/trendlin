// src/components/admin/LoadingSpinner.jsx (ALL DEVICES COMPATIBLE)

import React, { useEffect, useState } from 'react'

const LoadingSpinner = ({ 
  size = 'md', 
  fullScreen = false, 
  text = '', 
  color = 'purple' 
}) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const sizeClasses = {
    sm: 'w-5 h-5 sm:w-6 sm:h-6',
    md: 'w-10 h-10 sm:w-12 sm:h-12',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
    xl: 'w-20 h-20 sm:w-24 sm:h-24'
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
    ? 'fixed inset-0 flex justify-center items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 p-4'
    : 'flex justify-center items-center min-h-[300px] sm:min-h-[400px]'

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-2 sm:gap-3">
        <div className="relative">
          <div className={`${sizeClasses[size]} border-4 border-gray-200 dark:border-gray-700 rounded-full`} />
          <div 
            className={`${sizeClasses[size]} border-4 ${colorClasses[color]} rounded-full animate-spin absolute top-0 left-0`}
            style={{ borderRightColor: 'transparent', borderBottomColor: 'transparent' }}
          />
        </div>
        {text && (
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium animate-pulse text-center px-4">
            {text}
          </p>
        )}
      </div>
    </div>
  )
}

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
      <div className={`w-3 h-3 sm:w-4 sm:h-4 border-2 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`} />
    </div>
  )
}

export const SkeletonLoader = ({ lines = 3, className = '' }) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const mobileLines = isMobile ? Math.min(lines, 2) : lines

  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3 sm:mb-4"></div>
      {Array.from({ length: mobileLines }).map((_, i) => (
        <div key={i} className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1.5 sm:mb-2"></div>
      ))}
      <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
    </div>
  )
}

export const PageLoader = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 z-50 p-4">
      <LoadingSpinner size={isMobile ? "md" : "lg"} />
      <p className="mt-3 sm:mt-4 text-gray-500 dark:text-gray-400 text-xs sm:text-sm text-center">Loading...</p>
    </div>
  )
}

export default LoadingSpinner