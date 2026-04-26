// src/components/admin/StatsCard.jsx (ALL DEVICES COMPATIBLE)

import React, { useEffect, useState } from 'react'

const StatsCard = ({ 
  icon, 
  value, 
  label, 
  trend, 
  suffix = '', 
  prefix = '',
  onClick,
  variant = 'default',
  isLoading = false,
  tooltip
}) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const getTrendColor = () => {
    if (!trend) return ''
    if (trend > 0) return 'text-green-600 dark:text-green-400'
    if (trend < 0) return 'text-red-600 dark:text-red-400'
    return 'text-gray-500 dark:text-gray-400'
  }

  const getTrendBgColor = () => {
    if (!trend) return ''
    if (trend > 0) return 'bg-green-100 dark:bg-green-900/30'
    if (trend < 0) return 'bg-red-100 dark:bg-red-900/30'
    return 'bg-gray-100 dark:bg-gray-700'
  }

  const getTrendIcon = () => {
    if (!trend) return null
    if (trend > 0) return '↑'
    if (trend < 0) return '↓'
    return '→'
  }

  const getTrendText = () => {
    if (!trend) return null
    return `${getTrendIcon()} ${Math.abs(trend)}%`
  }

  const getFormattedValue = () => {
    if (isLoading) return '—'
    if (value === undefined || value === null) return '0'
    
    let formattedValue = value
    if (typeof value === 'number') {
      if (value >= 1000000 && isMobile) {
        formattedValue = (value / 1000000).toFixed(1) + 'M'
      } else if (value >= 1000 && isMobile) {
        formattedValue = (value / 1000).toFixed(1) + 'K'
      } else {
        formattedValue = value.toLocaleString()
      }
    }
    return `${prefix}${formattedValue}${suffix}`
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'p-2 sm:p-3'
      case 'large':
        return 'p-4 sm:p-6'
      default:
        return 'p-3 sm:p-4'
    }
  }

  const getIconContainerClasses = () => {
    switch (variant) {
      case 'compact':
        return 'w-7 h-7 sm:w-8 sm:h-8 text-base sm:text-lg'
      case 'large':
        return 'w-11 h-11 sm:w-14 sm:h-14 text-xl sm:text-2xl'
      default:
        return 'w-8 h-8 sm:w-10 sm:h-10 text-lg sm:text-xl'
    }
  }

  const getValueClasses = () => {
    switch (variant) {
      case 'compact':
        return 'text-lg sm:text-xl'
      case 'large':
        return 'text-2xl sm:text-3xl'
      default:
        return 'text-xl sm:text-2xl'
    }
  }

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl ${getVariantClasses()} shadow-sm hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer active:scale-98 sm:hover:scale-[1.02]' : ''}`}
      onClick={onClick}
      title={tooltip}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={`${getIconContainerClasses()} rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0`}>
          {isLoading ? (
            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            icon
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className={`${getValueClasses()} font-bold text-gray-900 dark:text-white truncate`}>
            {getFormattedValue()}
          </div>
          <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">{label}</div>
        </div>
        
        {trend !== undefined && trend !== null && !isLoading && (
          <div className={`text-right flex-shrink-0 ${getTrendColor()}`}>
            <div className={`text-[11px] sm:text-sm font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${getTrendBgColor()}`}>
              {getTrendText()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const ViewsStatsCard = ({ views, trend }) => (
  <StatsCard
    icon="👁️"
    value={views}
    label="Total Views"
    trend={trend}
    suffix=""
  />
)

export const PostsStatsCard = ({ posts, trend }) => (
  <StatsCard
    icon="📝"
    value={posts}
    label="Total Posts"
    trend={trend}
  />
)

export const RevenueStatsCard = ({ revenue, trend }) => (
  <StatsCard
    icon="💰"
    value={revenue}
    label="Revenue"
    trend={trend}
    prefix="$"
  />
)

export const AffiliateStatsCard = ({ clicks, revenue, trend }) => (
  <StatsCard
    icon="🔗"
    value={clicks}
    label="Affiliate Clicks"
    trend={trend}
    suffix=""
  />
)

export const CommentsStatsCard = ({ comments, trend }) => (
  <StatsCard
    icon="💬"
    value={comments}
    label="Comments"
    trend={trend}
  />
)

export const UsersStatsCard = ({ users, trend }) => (
  <StatsCard
    icon="👥"
    value={users}
    label="Active Users"
    trend={trend}
  />
)

export const EngagementStatsCard = ({ rate, trend }) => (
  <StatsCard
    icon="📊"
    value={rate}
    label="Engagement Rate"
    trend={trend}
    suffix="%"
  />
)

export default StatsCard