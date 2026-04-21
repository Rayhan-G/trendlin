// src/types/post.ts
import { PostStatus } from './index'

export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  featured_image: string | null
  featured_video: string | null
  featured_audio: string | null
  category: string | null
  tags: string[]
  status: PostStatus
  is_featured: boolean
  scheduled_for: string | null
  published_at: string | null
  views: number
  unique_views: number
  word_count: number
  reading_time: number
  author_id: string | null
  author_name: string | null
  seo_title: string | null
  seo_description: string | null
  meta_keywords: string | null
  created_at: string
  updated_at: string
}

export interface PostFormData {
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  status: PostStatus
  is_featured: boolean
  scheduled_for: Date | null
  featured_image: string | null
  seo_title: string
  seo_description: string
}

export interface PostVersion {
  id: string
  post_id: string
  content: string
  version_number: number
  created_by: string
  created_by_id: string
  comment: string
  created_at: string
}

export interface PostAnalytics {
  post_id: string
  views: number
  unique_views: number
  avg_time_on_page: number
  bounce_rate: number
  shares: {
    twitter: number
    facebook: number
    linkedin: number
    pinterest: number
  }
  top_referrers: Array<{ source: string; count: number }>
  devices: {
    mobile: number
    desktop: number
    tablet: number
  }
  scroll_depth: {
    depth_25: number
    depth_50: number
    depth_75: number
    depth_100: number
  }
  hourly_views: number[]
  daily_views: Array<{ date: string; count: number }>
}

export interface PostDailyView {
  id: string
  post_id: string
  view_date: string
  view_count: number
  unique_count: number
}

export interface PostHourlyView {
  id: string
  post_id: string
  view_hour: string
  view_count: number
}

export interface PostReferral {
  id: string
  post_id: string
  source: string
  referrer_url: string
  view_count: number
  view_date: string
}

export interface PostScrollDepth {
  id: string
  post_id: string
  session_id: string
  depth_25: boolean
  depth_50: boolean
  depth_75: boolean
  depth_100: boolean
  created_at: string
}

export interface PostShare {
  id: string
  post_id: string
  platform: string
  share_count: number
  share_date: string
}

export interface PostClick {
  id: string
  post_id: string
  link_url: string
  link_type: 'internal' | 'external' | 'affiliate'
  click_count: number
  click_date: string
}

export type PostStatus = 'draft' | 'published' | 'scheduled' | 'archived'