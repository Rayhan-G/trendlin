// src/utils/dateUtils.js
import { format, formatDistance, formatRelative, differenceInDays, differenceInHours, differenceInMinutes, isToday, isYesterday, isThisWeek, isThisMonth, isThisYear } from 'date-fns'

/**
 * Format a date to a readable string
 * @param {string|Date} date - The date to format
 * @param {string} formatStr - The format string (default: 'MMM dd, yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, formatStr)
}

/**
 * Format date with time
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date with time
 */
export const formatDateTime = (date) => {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMM dd, yyyy h:mm a')
}

/**
 * Get relative time (e.g., "2 days ago", "5 hours ago")
 * @param {string|Date} date - The date to compare
 * @returns {string} Human readable relative time
 */
export const getRelativeTime = (date) => {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  
  const diffMinutes = differenceInMinutes(now, d)
  const diffHours = differenceInHours(now, d)
  const diffDays = differenceInDays(now, d)
  
  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) === 1 ? '' : 's'} ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) === 1 ? '' : 's'} ago`
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) === 1 ? '' : 's'} ago'
}

/**
 * Format relative date using date-fns
 * @param {string|Date} date - The date to format
 * @param {Date} baseDate - Base date for comparison (default: now)
 * @returns {string} Relative date string
 */
export const getRelativeDate = (date, baseDate = new Date()) => {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return formatRelative(d, baseDate)
}

/**
 * Check if a date is today
 * @param {string|Date} date - The date to check
 * @returns {boolean}
 */
export const isDateToday = (date) => {
  if (!date) return false
  const d = typeof date === 'string' ? new Date(date) : date
  return isToday(d)
}

/**
 * Check if a date was yesterday
 * @param {string|Date} date - The date to check
 * @returns {boolean}
 */
export const isDateYesterday = (date) => {
  if (!date) return false
  const d = typeof date === 'string' ? new Date(date) : date
  return isYesterday(d)
}

/**
 * Check if a date is within the current week
 * @param {string|Date} date - The date to check
 * @returns {boolean}
 */
export const isDateThisWeek = (date) => {
  if (!date) return false
  const d = typeof date === 'string' ? new Date(date) : date
  return isThisWeek(d)
}

/**
 * Check if a date is within the current month
 * @param {string|Date} date - The date to check
 * @returns {boolean}
 */
export const isDateThisMonth = (date) => {
  if (!date) return false
  const d = typeof date === 'string' ? new Date(date) : date
  return isThisMonth(d)
}

/**
 * Check if a date is within the current year
 * @param {string|Date} date - The date to check
 * @returns {boolean}
 */
export const isDateThisYear = (date) => {
  if (!date) return false
  const d = typeof date === 'string' ? new Date(date) : date
  return isThisYear(d)
}

/**
 * Get the start of the day for a date
 * @param {string|Date} date - The date
 * @returns {Date}
 */
export const startOfDay = (date) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/**
 * Get the end of the day for a date
 * @param {string|Date} date - The date
 * @returns {Date}
 */
export const endOfDay = (date) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
}

/**
 * Get date range for a period
 * @param {string} period - 'today', 'yesterday', 'week', 'month', 'year'
 * @returns {{start: Date, end: Date}}
 */
export const getDateRange = (period) => {
  const now = new Date()
  const start = new Date()
  const end = new Date()
  
  switch (period) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) }
    case 'yesterday':
      start.setDate(now.getDate() - 1)
      return { start: startOfDay(start), end: endOfDay(start) }
    case 'week':
      start.setDate(now.getDate() - 7)
      return { start: startOfDay(start), end: endOfDay(now) }
    case 'month':
      start.setMonth(now.getMonth() - 1)
      return { start: startOfDay(start), end: endOfDay(now) }
    case 'year':
      start.setFullYear(now.getFullYear() - 1)
      return { start: startOfDay(start), end: endOfDay(now) }
    default:
      return { start: startOfDay(now), end: endOfDay(now) }
  }
}

/**
 * Format a date for input fields (YYYY-MM-DD)
 * @param {string|Date} date - The date to format
 * @returns {string}
 */
export const formatDateForInput = (date) => {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'yyyy-MM-dd')
}

/**
 * Format a date for API (ISO string)
 * @param {string|Date} date - The date to format
 * @returns {string}
 */
export const formatDateForAPI = (date) => {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString()
}

/**
 * Parse a date from API or input
 * @param {string} dateString - The date string to parse
 * @returns {Date|null}
 */
export const parseDate = (dateString) => {
  if (!dateString) return null
  const d = new Date(dateString)
  return isNaN(d.getTime()) ? null : d
}

/**
 * Get month name
 * @param {number} month - Month number (0-11)
 * @param {boolean} short - Whether to return short name
 * @returns {string}
 */
export const getMonthName = (month, short = false) => {
  const months = short 
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return months[month] || ''
}

/**
 * Get day name
 * @param {number} day - Day number (0-6, Sunday=0)
 * @param {boolean} short - Whether to return short name
 * @returns {string}
 */
export const getDayName = (day, short = false) => {
  const days = short
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[day] || ''
}

export default {
  formatDate,
  formatDateTime,
  getRelativeTime,
  getRelativeDate,
  isDateToday,
  isDateYesterday,
  isDateThisWeek,
  isDateThisMonth,
  isDateThisYear,
  startOfDay,
  endOfDay,
  getDateRange,
  formatDateForInput,
  formatDateForAPI,
  parseDate,
  getMonthName,
  getDayName
}