// src/utils/formatters.js

/**
 * Format numbers with K, M, B, T suffixes
 * Adds + sign for non-exact numbers
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (num) => {
  if (num === undefined || num === null) return '0'
  if (isNaN(num)) return '0'
  
  // Handle trillions (T)
  if (num >= 1_000_000_000_000) {
    const trillions = num / 1_000_000_000_000
    if (num % 1_000_000_000_000 === 0) {
      return `${trillions.toFixed(0)}T`
    }
    return `${trillions.toFixed(1)}T+`
  }
  
  // Handle billions (B)
  if (num >= 1_000_000_000) {
    const billions = num / 1_000_000_000
    if (num % 1_000_000_000 === 0) {
      return `${billions.toFixed(0)}B`
    }
    return `${billions.toFixed(1)}B+`
  }
  
  // Handle millions (M)
  if (num >= 1_000_000) {
    const millions = num / 1_000_000
    if (num % 1_000_000 === 0) {
      return `${millions.toFixed(0)}M`
    }
    return `${millions.toFixed(1)}M+`
  }
  
  // Handle thousands (K)
  if (num >= 1000) {
    const thousands = num / 1000
    if (num % 1000 === 0) {
      return `${thousands.toFixed(0)}K`
    }
    return `${thousands.toFixed(1)}K+`
  }
  
  // Return as is for numbers less than 1000
  return num.toString()
}

/**
 * Format rating with + suffix (except for max rating)
 * @param {number} rating - The rating value (0-5 or 0-10)
 * @param {number} maxRating - Maximum possible rating (default 5)
 * @returns {string} Formatted rating string
 */
export const formatRating = (rating, maxRating = 5) => {
  if (!rating || rating === 0) return '—'
  // Don't add + for maximum possible rating
  if (rating >= maxRating) return `${maxRating.toFixed(1)}`
  return `${rating.toFixed(1)}+`
}

/**
 * Format percentage with + sign for growth
 * @param {number} percentage - The percentage value
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (percentage) => {
  if (!percentage && percentage !== 0) return '—'
  const isPositive = percentage > 0
  const absValue = Math.abs(percentage)
  return `${isPositive ? '+' : ''}${absValue.toFixed(1)}%`
}

/**
 * Format date to readable string
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'Recent'
  const d = new Date(date)
  const now = new Date()
  const diffTime = Math.abs(now - d)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

/**
 * Format reading time in minutes
 * @param {number} minutes - Reading time in minutes
 * @returns {string} Formatted reading time
 */
export const formatReadingTime = (minutes) => {
  if (!minutes) return '1 min read'
  if (minutes < 60) return `${minutes} min read`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) return `${hours} hr read`
  return `${hours} hr ${remainingMinutes} min read`
}

/**
 * Truncate text with ellipsis
 * @param {string} text - The text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 100) => {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length).trim() + '...'
}

/**
 * Format view count with compact notation
 * @param {number} views - Number of views
 * @returns {string} Formatted view count
 */
export const formatViews = (views) => {
  if (!views) return '0 views'
  const formatted = formatNumber(views)
  return `${formatted} ${views === 1 ? 'view' : 'views'}`
}