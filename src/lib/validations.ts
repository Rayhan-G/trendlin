// src/lib/validations.ts (COMPLETE FIXED FILE)

import { z } from 'zod';

export const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  excerpt: z.string().max(300, 'Excerpt too long').optional(),
  content: z.string().min(1, 'Content is required'),
  category: z.string().optional(),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags').optional(),
  status: z.enum(['draft', 'published', 'scheduled', 'archived']),
  is_featured: z.boolean(),
  scheduled_for: z.string().datetime().nullable().optional().transform(val => val ? new Date(val) : null),
  seo_title: z.string().max(60, 'SEO title too long').optional(),
  seo_description: z.string().max(160, 'Meta description too long').optional(),
});

export type PostFormData = z.infer<typeof postSchema>;

export const affiliateLinkSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  url: z.string().url('Must be a valid URL'),
  cloaked_url: z.string().optional(),
  link_category: z.enum(['amazon', 'shareasale', 'cj', 'direct', 'other']),
  commission_type: z.enum(['percentage', 'fixed']),
  commission_value: z.number().min(0),
  cookie_duration: z.number().min(1).max(365),
  is_active: z.boolean(),
});

export type AffiliateLinkFormData = z.infer<typeof affiliateLinkSchema>;

export const adSlotSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  location: z.enum(['header', 'sidebar', 'in_content', 'between_posts', 'footer', 'popup']),
  dimensions: z.string().regex(/^\d+x\d+$/, 'Invalid dimensions format (e.g., 300x250)'),
  width: z.number().min(1),
  height: z.number().min(1),
  priority: z.number().min(0),
  weight: z.number().min(1).max(100),
  is_active: z.boolean(),
});

export type AdSlotFormData = z.infer<typeof adSlotSchema>;

export const adCodeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  code: z.string().min(1, 'Ad code is required'),
  is_active: z.boolean(),
  is_ab_test: z.boolean(),
  ab_group: z.enum(['A', 'B', 'C']).optional(),
  ab_percentage: z.number().min(1).max(100).optional(),
});

export type AdCodeFormData = z.infer<typeof adCodeSchema>;