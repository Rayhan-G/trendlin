// src/lib/constants.js

// Site Configuration
export const SITE_CONFIG = {
  name: 'trendlin',
  domain: 'trendlin.com',
  description: 'What\'s trending is what matters. AI. Markets. Wellness. Money.',
  keywords: 'trends, technology, wealth, health, growth, entertainment, world, lifestyle',
  author: 'Trendlin Team',
  twitterHandle: '@trendlinsocial',
  facebookPage: 'trendlinsocial',
  instagramHandle: 'trendlinsocial'
}

// Categories
export const CATEGORIES = [
  { slug: 'tech', name: 'Technology', icon: '⚡', color: '#3b82f6', description: 'Latest tech trends, AI advancements, and digital innovation insights.' },
  { slug: 'wealth', name: 'Wealth', icon: '💰', color: '#f59e0b', description: 'Expert insights on investing, saving, and building lasting financial freedom.' },
  { slug: 'health', name: 'Health', icon: '🌿', color: '#10b981', description: 'Curated insights for a balanced life — from mindful living to physical vitality.' },
  { slug: 'growth', name: 'Growth', icon: '🌱', color: '#8b5cf6', description: 'Transform your life with mindset shifts, productivity hacks, and proven success strategies.' },
  { slug: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#ec4899', description: 'Movies, music, gaming, and celebrity news — your daily dose of entertainment.' },
  { slug: 'world', name: 'World', icon: '🌍', color: '#06b6d4', description: 'Breaking news, international affairs, and global perspectives from around the world.' },
  { slug: 'lifestyle', name: 'Lifestyle', icon: '✨', color: '#f97316', description: 'Fashion, travel, home decor, wellness, and everyday living inspiration.' }
]

// Post Status
export const POST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  SCHEDULED: 'scheduled',
  ARCHIVED: 'archived'
}

// Post Status Labels
export const POST_STATUS_LABELS = {
  [POST_STATUS.DRAFT]: 'Draft',
  [POST_STATUS.PUBLISHED]: 'Published',
  [POST_STATUS.SCHEDULED]: 'Scheduled',
  [POST_STATUS.ARCHIVED]: 'Archived'
}

// Post Status Colors
export const POST_STATUS_COLORS = {
  [POST_STATUS.DRAFT]: 'bg-yellow-100 text-yellow-800',
  [POST_STATUS.PUBLISHED]: 'bg-green-100 text-green-800',
  [POST_STATUS.SCHEDULED]: 'bg-purple-100 text-purple-800',
  [POST_STATUS.ARCHIVED]: 'bg-gray-100 text-gray-800'
}

// Ad Locations
export const AD_LOCATIONS = [
  { value: 'header', label: 'Header', icon: '📌' },
  { value: 'sidebar', label: 'Sidebar', icon: '📁' },
  { value: 'in_content', label: 'In Content', icon: '📝' },
  { value: 'between_posts', label: 'Between Posts', icon: '📋' },
  { value: 'footer', label: 'Footer', icon: '🔻' },
  { value: 'popup', label: 'Popup', icon: '💬' }
]

// Ad Dimensions
export const AD_DIMENSIONS = [
  { value: '300x250', label: '300x250 (Medium Rectangle)', width: 300, height: 250 },
  { value: '728x90', label: '728x90 (Leaderboard)', width: 728, height: 90 },
  { value: '320x100', label: '320x100 (Large Mobile Banner)', width: 320, height: 100 },
  { value: '160x600', label: '160x600 (Wide Skyscraper)', width: 160, height: 600 },
  { value: '300x600', label: '300x600 (Half Page)', width: 300, height: 600 },
  { value: '970x90', label: '970x90 (Super Leaderboard)', width: 970, height: 90 },
  { value: '320x50', label: '320x50 (Mobile Banner)', width: 320, height: 50 },
  { value: '468x60', label: '468x60 (Full Banner)', width: 468, height: 60 }
]

// Affiliate Categories
export const AFFILIATE_CATEGORIES = [
  { value: 'amazon', label: 'Amazon', icon: '🛒' },
  { value: 'shareasale', label: 'ShareASale', icon: '📊' },
  { value: 'cj', label: 'CJ Affiliate', icon: '🔗' },
  { value: 'direct', label: 'Direct', icon: '🤝' },
  { value: 'other', label: 'Other', icon: '📁' }
]

// Commission Types
export const COMMISSION_TYPES = [
  { value: 'percentage', label: 'Percentage (%)' },
  { value: 'fixed', label: 'Fixed ($)' }
]

// Revenue Sources
export const REVENUE_SOURCES = [
  { value: 'ad_revenue', label: 'Ad Revenue', icon: '📊' },
  { value: 'affiliate_revenue', label: 'Affiliate Revenue', icon: '🔗' },
  { value: 'sponsored', label: 'Sponsored', icon: '⭐' },
  { value: 'other', label: 'Other', icon: '📁' }
]

// Date Ranges
export const DATE_RANGES = [
  { value: '7days', label: 'Last 7 days', days: 7 },
  { value: '30days', label: 'Last 30 days', days: 30 },
  { value: '90days', label: 'Last 90 days', days: 90 },
  { value: 'all', label: 'All time', days: null }
]

// Pagination
export const PAGINATION = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 25, 50, 100]
}

// File Upload Limits
export const UPLOAD_LIMITS = {
  image: { maxSize: 10 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] },
  video: { maxSize: 100 * 1024 * 1024, allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime'] },
  audio: { maxSize: 50 * 1024 * 1024, allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg'] },
  pdf: { maxSize: 50 * 1024 * 1024, allowedTypes: ['application/pdf'] }
}

// Cloudinary Configuration
export const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  uploadPreset: 'trendlin_preset',
  defaultTransformations: {
    quality: 'auto',
    format: 'auto'
  }
}

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'theme',
  ADMIN_SESSION_TOKEN: 'admin_session_token',
  ADMIN_SESSION_EXPIRY: 'admin_session_expiry',
  VISITOR_SESSION_ID: 'visitor_session_id',
  RECENT_EMBEDS: 'recentEmbeds',
  RECENT_FONTS: 'recentFonts',
  RECENT_COLORS: 'recentColors',
  RECENT_HIGHLIGHTS: 'recentHighlights'
}

// API Endpoints
export const API_ENDPOINTS = {
  ADMIN_VERIFY: '/api/admin/verify',
  TRACK_VIEW: '/api/track-view',
  POPULAR_POSTS: '/api/popular',
  TODAYS_PICKS: '/api/todays-picks',
  CLOUDINARY_DELETE: '/api/cloudinary/delete',
  EDITOR_SAVE: '/api/editor/save',
  EDITOR_UPLOAD: '/api/editor/upload'
}

// Social Media Links
export const SOCIAL_LINKS = {
  twitter: 'https://x.com/trendlinsocial',
  facebook: 'https://www.facebook.com/trendlinsocial',
  instagram: 'https://www.instagram.com/trendlinsocial/'
}

// SEO Defaults
export const SEO_DEFAULTS = {
  title: 'trendlin - What\'s trending is what matters',
  description: 'AI. Markets. Wellness. Money. We track the signals, so you stay ahead.',
  ogImage: '/images/og-image.jpg',
  twitterImage: '/images/twitter-image.jpg'
}

// Reading Time
export const READING_SPEED = {
  wordsPerMinute: 200
}

// Cache Times (in seconds)
export const CACHE_TIMES = {
  post: 3600,      // 1 hour
  category: 3600,  // 1 hour
  home: 300,       // 5 minutes
  analytics: 3600  // 1 hour
}