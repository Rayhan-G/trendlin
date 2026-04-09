// src/utils/helpers.js
// Reusable helper functions for the entire application

/**
 * Format a date string to a readable format
 * @param {string} dateString - ISO date string or any valid date string
 * @returns {string} Formatted date (e.g., "April 10, 2025")
 */
export function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

/**
 * Truncate text to a maximum length and add ellipsis
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text with ellipsis if needed
 */
export function truncateText(text, maxLength = 120) {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

/**
 * Generate a slug from a string
 * @param {string} text - The text to convert to slug
 * @returns {string} URL-friendly slug
 */
export function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-')
}

/**
 * Get relative time (e.g., "2 days ago", "5 hours ago")
 * @param {string} dateString - The date to compare
 * @returns {string} Human readable relative time
 */
export function getRelativeTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`
  if (diffMonths < 12) return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`
  return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`
}

/**
 * Render star rating as HTML or text
 * @param {number} rating - Rating out of 5
 * @returns {string} Star symbols (★ and ☆)
 */
export function renderStars(rating) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
  
  let stars = ''
  for (let i = 0; i < fullStars; i++) stars += '★'
  if (hasHalfStar) stars += '½'
  for (let i = 0; i < emptyStars; i++) stars += '☆'
  
  return stars
}

/**
 * Debounce function to limit how often a function is called
 * @param {Function} func - The function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Scroll to top of page smoothly
 */
export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}

/**
 * Get query parameter from URL
 * @param {string} param - Parameter name
 * @returns {string|null} Parameter value or null
 */
export function getQueryParam(param) {
  if (typeof window === 'undefined') return null
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(param)
}

/**
 * Update URL without reloading the page
 * @param {Object} params - Parameters to add/update
 */
export function updateURLParams(params) {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  Object.keys(params).forEach(key => {
    if (params[key]) {
      url.searchParams.set(key, params[key])
    } else {
      url.searchParams.delete(key)
    }
  })
  window.history.pushState({}, '', url)
}

/**
 * Detect if device is mobile
 * @returns {boolean} True if mobile device
 */
export function isMobile() {
  if (typeof window === 'undefined') return false
  return window.innerWidth <= 768
}

/**
 * Format price with currency symbol
 * @param {number} price - Price to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted price
 */
export function formatPrice(price, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(price)
}

/**
 * Track affiliate link click (placeholder for analytics)
 * @param {Object} data - Click data
 */
export function trackAffiliateClick(data) {
  console.log('Affiliate click tracked:', data)
  // In production, you would send this to your analytics
  // Example: gtag('event', 'affiliate_click', { ... })
}

/**
 * Lazy load images when they come into viewport
 * @param {string} selector - CSS selector for images to lazy load
 */
export function setupLazyLoading(selector = 'img[data-src]') {
  if (typeof window === 'undefined' || !window.IntersectionObserver) return
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        img.removeAttribute('data-src')
        observer.unobserve(img)
      }
    })
  })
  
  document.querySelectorAll(selector).forEach(img => observer.observe(img))
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeHtml(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Get reading time from text content
 * @param {string} content - HTML or text content
 * @returns {number} Estimated reading time in minutes
 */
export function getReadingTime(content) {
  const wordsPerMinute = 200
  const text = content.replace(/<[^>]*>/g, '') // Strip HTML tags
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}