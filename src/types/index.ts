// src/types/index.ts (COMPLETE FIXED FILE)

// ============================================
// Post Types
// ============================================

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  featured_video: string | null;
  featured_audio: string | null;
  featured_pdf: string | null;
  featured_animation: string | null;
  embed_url: string | null;
  embed_type: string | null;
  embed_code: string | null;
  category: string | null;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled' | 'archived'; // ✅ FIXED: Added 'archived'
  is_featured: boolean;
  scheduled_for: string | null;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  views: number;
  unique_views: number | null; // ✅ ADDED: For unique visitor tracking
  word_count: number | null; // ✅ ADDED: For SEO
  reading_time: number | null; // ✅ ADDED: Estimated reading time
  author_id: string | null; // ✅ ADDED: User ID reference
  author_name: string | null; // ✅ ADDED: Display name
  created_at: string;
  updated_at: string;
}

// ============================================
// Post Form Data (for frontend forms)
// ============================================

export interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  is_featured: boolean;
  scheduled_for: Date | null;
  seo_title: string;
  seo_description: string;
  featured_image: string | null;
  featured_video: string | null;
}

// ============================================
// Affiliate Types
// ============================================

export interface AffiliateLink {
  id: string;
  name: string;
  url: string;
  cloaked_url: string | null;
  link_category: 'amazon' | 'shareasale' | 'cj' | 'direct' | 'other';
  commission_type: 'percentage' | 'fixed';
  commission_value: number;
  cookie_duration: number;
  clicks: number;
  conversions: number;
  revenue: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AffiliateClick {
  id: string;
  link_id: string;
  post_id: string | null;
  session_id: string;
  user_agent: string | null;
  referrer: string | null;
  clicked_at: string;
}

// ============================================
// Ad Types
// ============================================

export interface AdSlot {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  location: 'header' | 'sidebar' | 'in_content' | 'between_posts' | 'footer' | 'popup';
  dimensions: string;
  width: number;
  height: number;
  priority: number;
  weight: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdCode {
  id: string;
  name: string;
  description: string | null;
  code: string;
  is_active: boolean;
  is_ab_test: boolean;
  ab_group: 'A' | 'B' | 'C' | null;
  ab_percentage: number | null;
  created_at: string;
  updated_at: string;
}

export interface AdImpression {
  id: string;
  slot_id: string;
  code_id: string;
  post_id: string | null;
  session_id: string;
  impressed_at: string;
}

export interface AdClick {
  id: string;
  slot_id: string;
  code_id: string;
  post_id: string | null;
  session_id: string;
  clicked_at: string;
}

// ============================================
// Revenue Types
// ============================================

export interface RevenueEntry {
  id: string;
  source: 'ad_revenue' | 'affiliate_revenue' | 'sponsored' | 'other';
  amount: number;
  date: string;
  note: string | null;
  created_at: string;
}

// ============================================
// Media Types
// ============================================

export interface MediaFile {
  file: File;
  url: string;
  type: 'image' | 'video' | 'audio' | 'pdf' | 'animation';
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    pages?: number;
    format?: string;
    size?: number;
  };
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
  unit: 'px' | '%';
}

export interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  rotation: number;
}

export interface TrimSettings {
  start: number;
  end: number;
  duration: number;
}

// ============================================
// Analytics Types
// ============================================

export interface PostView {
  id: string;
  post_id: string;
  session_id: string;
  view_date: string;
  view_count: number;
  created_at: string;
}

export interface PageView {
  id: string;
  page: string;
  title: string | null;
  referrer: string | null;
  session_id: string;
  user_agent: string | null;
  viewport_width: number | null;
  viewport_height: number | null;
  viewed_at: string;
}

export interface ScrollDepth {
  id: string;
  post_id: string;
  session_id: string;
  depth_percentage: number;
  tracked_at: string;
}

export interface TimeOnPage {
  id: string;
  post_id: string;
  session_id: string;
  seconds_spent: number;
  tracked_at: string;
}

// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  email: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'editor' | 'author' | 'subscriber';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  user_id: string;
  bio: string | null;
  website: string | null;
  twitter: string | null;
  github: string | null;
  location: string | null;
  occupation: string | null;
  interests: string[];
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// Form Types (re-export for convenience)
// ============================================

export type { PostFormData as FormData }