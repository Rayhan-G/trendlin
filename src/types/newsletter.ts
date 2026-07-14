// src/types/newsletter.ts

// ============================================
// CATEGORIES
// ============================================

export const NEWSLETTER_CATEGORIES = [
  { 
    id: 'health-wellness', 
    label: 'Health & Wellness', 
    description: 'Health tips, wellness advice, and self-care guides',
    icon: 'health-wellness'
  },
  { 
    id: 'food-dining', 
    label: 'Food & Dining', 
    description: 'Restaurant reviews, recipes, and food recommendations',
    icon: 'food-dining'
  },
  { 
    id: 'entertainment', 
    label: 'Entertainment', 
    description: 'Movies, TV shows, events, and things to do',
    icon: 'entertainment'
  },
  { 
    id: 'lifestyle', 
    label: 'Lifestyle', 
    description: 'Living well, travel, and everyday inspiration',
    icon: 'lifestyle'
  },
  { 
    id: 'technology', 
    label: 'Technology', 
    description: 'Latest tech news, gadgets, and innovations',
    icon: 'technology'
  },
  { 
    id: 'shopping', 
    label: 'Shopping', 
    description: 'Best deals, product reviews, and shopping guides',
    icon: 'shopping'
  },
  { 
    id: 'real-estate', 
    label: 'Real Estate', 
    description: 'Market trends, buying tips, and property insights',
    icon: 'real-estate'
  },
  { 
    id: 'finance', 
    label: 'Finance', 
    description: 'Money management, investing, and financial planning',
    icon: 'finance'
  }
] as const;

export type NewsletterCategory = typeof NEWSLETTER_CATEGORIES[number]['id'];
export type NewsletterCategoryLabel = typeof NEWSLETTER_CATEGORIES[number]['label'];

// ============================================
// UNSUBSCRIBE REASONS
// ============================================

export const UNSUBSCRIBE_REASONS = [
  { id: 'too-many', label: 'Too many emails', value: 'Too many emails' },
  { id: 'not-relevant', label: 'Content not relevant', value: 'Content not relevant' },
  { id: 'no-value', label: 'Not getting value', value: 'Not getting value' },
  { id: 'spam', label: 'Marked as spam', value: 'Marked as spam' },
  { id: 'temporary', label: 'Temporary (will resubscribe later)', value: 'Temporary (will resubscribe later)' },
  { id: 'other', label: 'Other', value: 'Other' },
] as const;

export type UnsubscribeReason = typeof UNSUBSCRIBE_REASONS[number]['id'];

// ============================================
// SUBSCRIBER
// ============================================

export interface Subscriber {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  verified: number; // 0 = false, 1 = true
  verificationToken: string | null;
  subscribed: number; // 0 = false, 1 = true
  categories: string; // Comma-separated: 'health-wellness,technology,finance'
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  createdAt: string;
  verifiedAt?: string;
  unsubscribedAt?: string;
  updatedAt: string;
}

export interface SubscriberPreferences {
  subscriberId: number;
  category: NewsletterCategory;
  subscribed: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// REQUESTS & RESPONSES
// ============================================

export interface SubscribeRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  categories: NewsletterCategory[];
}

export interface SubscribeResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
    verificationToken: string;
  };
}

export interface VerifyRequest {
  email: string;
  token: string;
  categories?: NewsletterCategory[];
}

export interface VerifyResponse {
  success: boolean;
  message: string;
}

export interface UnsubscribeRequest {
  email: string;
  token: string;
  reason?: string;
  feedback?: string;
}

export interface UnsubscribeResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
    unsubscribedAt: string;
  };
}

export interface PreferencesRequest {
  email: string;
  token: string;
  categories: NewsletterCategory[];
}

export interface PreferencesResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
    categories: NewsletterCategory[];
  };
}

// ============================================
// CAMPAIGN
// ============================================

export interface NewsletterCampaign {
  id: number;
  subject: string;
  content: string;
  category?: string;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  unsubscribedCount: number;
  bouncedCount: number;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduledAt?: string;
  sentAt?: string;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterActivity {
  id: number;
  subscriberId: number;
  campaignId: number;
  action: 'opened' | 'clicked' | 'unsubscribed' | 'bounced';
  url?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// ============================================
// STATS
// ============================================

export interface NewsletterStats {
  totalSubscribers: number;
  verifiedSubscribers: number;
  activeSubscribers: number;
  unsubscribedCount: number;
  categoriesBreakdown: {
    category: NewsletterCategory;
    count: number;
  }[];
  recentActivity: NewsletterActivity[];
}