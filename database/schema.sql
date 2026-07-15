-- ============================================
-- TRENDLIN D1 DATABASE SCHEMA - COMPLETE FIXED
-- Cloudflare D1 (SQLite) Compatible
-- ============================================

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- ============================================
-- ADMINS TABLE - Authentication
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'admin',
  login_attempts INTEGER DEFAULT 0,
  locked_until DATETIME,
  last_login DATETIME,
  reset_token TEXT,
  reset_token_expires DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_reset_token ON admins(reset_token);

-- ============================================
-- SESSIONS TABLE - Session Management
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES admins(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- ============================================
-- NEWSLETTER SYSTEM - Complete
-- ============================================

-- 1. NEWSLETTER SUBSCRIBERS
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT DEFAULT '',
  last_name TEXT DEFAULT '',
  status TEXT DEFAULT 'pending', -- pending | active | unsubscribed | suspended
  verification_token TEXT UNIQUE,
  unsubscribe_token TEXT UNIQUE,
  source TEXT DEFAULT 'website',
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  preferences TEXT DEFAULT '{}', -- JSON: {"categories": ["tech", "finance"], "frequency": "weekly"}
  metadata TEXT DEFAULT '{}', -- JSON: {"last_open": "2024-01-01", "last_click": "2024-01-01", "total_emails": 0}
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  verified_at DATETIME,
  unsubscribed_at DATETIME,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ns_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_ns_status ON newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_ns_verification_token ON newsletter_subscribers(verification_token);
CREATE INDEX IF NOT EXISTS idx_ns_unsubscribe_token ON newsletter_subscribers(unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_ns_created_at ON newsletter_subscribers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ns_status_created ON newsletter_subscribers(status, created_at DESC);

-- 2. NEWSLETTER LISTS
CREATE TABLE IF NOT EXISTS newsletter_lists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_nl_slug ON newsletter_lists(slug);
CREATE INDEX IF NOT EXISTS idx_nl_active ON newsletter_lists(is_active);

-- Insert default lists
INSERT OR IGNORE INTO newsletter_lists (name, slug, description) VALUES
('General Newsletter', 'general', 'All subscribers'),
('Technology Weekly', 'technology', 'Tech news and updates'),
('Finance Weekly', 'finance', 'Financial insights and tips'),
('Health Weekly', 'health-wellness', 'Health and wellness updates'),
('Entertainment Weekly', 'entertainment', 'Entertainment news'),
('Shopping Deals', 'shopping', 'Best deals and shopping guides'),
('Breaking News', 'breaking', 'Urgent news alerts'),
('Editor''s Picks', 'editors-picks', 'Curated by our editors');

-- 3. NEWSLETTER LIST MEMBERS
CREATE TABLE IF NOT EXISTS newsletter_list_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscriber_id INTEGER NOT NULL,
  list_id INTEGER NOT NULL,
  subscribed INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscriber_id) REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  FOREIGN KEY (list_id) REFERENCES newsletter_lists(id) ON DELETE CASCADE,
  UNIQUE(subscriber_id, list_id)
);

CREATE INDEX IF NOT EXISTS idx_nlm_subscriber ON newsletter_list_members(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_nlm_list ON newsletter_list_members(list_id);
CREATE INDEX IF NOT EXISTS idx_nlm_subscribed ON newsletter_list_members(subscribed);

-- 4. NEWSLETTER CAMPAIGNS
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject TEXT NOT NULL,
  preview_text TEXT DEFAULT '',
  content_html TEXT NOT NULL,
  status TEXT DEFAULT 'draft', -- draft | pending_review | approved | scheduled | sending | completed | paused | cancelled
  list_id INTEGER,
  created_by INTEGER,
  scheduled_at DATETIME,
  sent_at DATETIME,
  total_recipients INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  unique_opens INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,
  spam_reports INTEGER DEFAULT 0,
  template_id INTEGER,
  metadata TEXT DEFAULT '{}', -- JSON: {"category": "tech", "tags": ["weekly"], "source": "manual"}
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (list_id) REFERENCES newsletter_lists(id) ON DELETE SET NULL,
  FOREIGN KEY (template_id) REFERENCES newsletter_templates(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_nc_status ON newsletter_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_nc_scheduled_at ON newsletter_campaigns(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_nc_sent_at ON newsletter_campaigns(sent_at);
CREATE INDEX IF NOT EXISTS idx_nc_created_at ON newsletter_campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nc_status_scheduled ON newsletter_campaigns(status, scheduled_at);

-- 5. NEWSLETTER CAMPAIGN BLOCKS
CREATE TABLE IF NOT EXISTS newsletter_campaign_blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL,
  type TEXT NOT NULL, -- heading | paragraph | image | article | divider | button | article_collection
  content TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  metadata TEXT DEFAULT '{}', -- JSON: {"article_id": 123, "url": "...", "articles": [1,2,3]}
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES newsletter_campaigns(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ncb_campaign ON newsletter_campaign_blocks(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ncb_order ON newsletter_campaign_blocks(order_index);

-- 6. NEWSLETTER CAMPAIGN RECIPIENTS
CREATE TABLE IF NOT EXISTS newsletter_campaign_recipients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL,
  subscriber_id INTEGER NOT NULL,
  status TEXT DEFAULT 'queued', -- queued | sent | opened | clicked | bounced | failed | unsubscribed
  sent_at DATETIME,
  opened_at DATETIME,
  clicked_at DATETIME,
  clicked_url TEXT,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (subscriber_id) REFERENCES newsletter_subscribers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ncr_campaign ON newsletter_campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ncr_subscriber ON newsletter_campaign_recipients(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_ncr_status ON newsletter_campaign_recipients(status);
CREATE INDEX IF NOT EXISTS idx_ncr_campaign_status ON newsletter_campaign_recipients(campaign_id, status);

-- 7. NEWSLETTER QUEUE
CREATE TABLE IF NOT EXISTS newsletter_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL,
  subscriber_id INTEGER NOT NULL,
  priority INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  status TEXT DEFAULT 'pending', -- pending | processing | completed | failed
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME,
  FOREIGN KEY (campaign_id) REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (subscriber_id) REFERENCES newsletter_subscribers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_nq_status ON newsletter_queue(status);
CREATE INDEX IF NOT EXISTS idx_nq_campaign ON newsletter_queue(campaign_id);
CREATE INDEX IF NOT EXISTS idx_nq_created_at ON newsletter_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_nq_priority_status ON newsletter_queue(priority DESC, status);

-- 8. NEWSLETTER EVENTS
CREATE TABLE IF NOT EXISTS newsletter_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscriber_id INTEGER NOT NULL,
  campaign_id INTEGER,
  type TEXT NOT NULL, -- subscribe | unsubscribe | open | click | bounce | complaint | sent
  url TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscriber_id) REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  FOREIGN KEY (campaign_id) REFERENCES newsletter_campaigns(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ne_subscriber ON newsletter_events(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_ne_campaign ON newsletter_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ne_type ON newsletter_events(type);
CREATE INDEX IF NOT EXISTS idx_ne_created_at ON newsletter_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ne_campaign_type ON newsletter_events(campaign_id, type);

-- 9. NEWSLETTER TEMPLATES
CREATE TABLE IF NOT EXISTS newsletter_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content_html TEXT NOT NULL,
  thumbnail_url TEXT,
  is_active INTEGER DEFAULT 1,
  usage_count INTEGER DEFAULT 0,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_nt_active ON newsletter_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_nt_slug ON newsletter_templates(slug);

-- Insert default templates
INSERT OR IGNORE INTO newsletter_templates (name, slug, description, content_html) VALUES
('Weekly Digest', 'weekly-digest', 'Weekly newsletter template', '<h1>Weekly Digest</h1><p>Your weekly update</p>'),
('Breaking News', 'breaking-news', 'Breaking news alert', '<h1>Breaking News</h1><p>Urgent update</p>'),
('Welcome Email', 'welcome', 'Welcome new subscribers', '<h1>Welcome!</h1><p>Thanks for subscribing</p>'),
('Verification Email', 'verification', 'Email verification', '<h1>Verify Your Email</h1><p>Please verify your email address</p>');

-- 10. NEWSLETTER SEGMENTS
CREATE TABLE IF NOT EXISTS newsletter_segments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  conditions TEXT NOT NULL, -- JSON: {"field": "preferences.categories", "operator": "contains", "value": "tech"}
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ns_segments_active ON newsletter_segments(is_active);

-- 11. NEWSLETTER AUTOMATIONS
CREATE TABLE IF NOT EXISTS newsletter_automations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  trigger TEXT NOT NULL, -- article_published | subscriber_created | campaign_completed | no_opens_30days
  conditions TEXT DEFAULT '{}', -- JSON: {"category": "tech", "status": "published"}
  actions TEXT NOT NULL, -- JSON: [{"type": "send_campaign", "campaign_id": 123}]
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_na_active ON newsletter_automations(is_active);
CREATE INDEX IF NOT EXISTS idx_na_trigger ON newsletter_automations(trigger);

INSERT OR IGNORE INTO newsletter_automations (name, trigger, actions) VALUES
('Welcome Series', 'subscriber_created', '[{"type": "send_campaign", "delay": 0, "template": "welcome"}]'),
('New Article Alert', 'article_published', '[{"type": "send_campaign", "delay": 0, "template": "breaking-news"}]'),
('Inactive User', 'no_opens_30days', '[{"type": "send_campaign", "delay": 0, "template": "we-miss-you"}]');

-- 12. NEWSLETTER LOGS
CREATE TABLE IF NOT EXISTS newsletter_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level TEXT NOT NULL, -- info | warning | error
  message TEXT NOT NULL,
  context TEXT DEFAULT '{}', -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_nl_level ON newsletter_logs(level);
CREATE INDEX IF NOT EXISTS idx_nl_created_at ON newsletter_logs(created_at DESC);

-- 13. NEWSLETTER SETTINGS
CREATE TABLE IF NOT EXISTS newsletter_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ns_key ON newsletter_settings(key);

INSERT OR IGNORE INTO newsletter_settings (key, value, description) VALUES
('sender_name', 'Trendlin', 'Default sender name'),
('sender_email', 'contact@trendlin.com', 'Default sender email'),
('reply_to', 'contact@trendlin.com', 'Default reply-to email'),
('verification_required', 'true', 'Require email verification'),
('double_opt_in', 'true', 'Double opt-in required'),
('tracking_enabled', 'true', 'Enable open/click tracking'),
('rate_limit_per_minute', '6000', 'Rate limit for sending'),
('timezone', 'America/New_York', 'Default timezone'),
('footer_html', '<p>&copy; 2026 Trendlin. All rights reserved.</p>', 'Default footer HTML'),
('daily_digest_time', '09:00', 'Time for daily digest'),
('weekly_digest_day', 'friday', 'Day for weekly digest');

-- 14. UNSUBSCRIBE FEEDBACK
CREATE TABLE IF NOT EXISTS unsubscribe_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscriber_id INTEGER NOT NULL,
  reason TEXT,
  feedback TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscriber_id) REFERENCES newsletter_subscribers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_unsubscribe_feedback_subscriber ON unsubscribe_feedback(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_unsubscribe_feedback_created ON unsubscribe_feedback(created_at DESC);

-- ============================================
-- BLOG CONTENT TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category TEXT DEFAULT 'Uncategorized',
  tags TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  is_draft INTEGER DEFAULT 1,
  is_published INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  author_id INTEGER,
  published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_todays_pick INTEGER DEFAULT 0,
  is_recently_added INTEGER DEFAULT 0,
  FOREIGN KEY (author_id) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_is_published ON posts(is_published);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_pick_added ON posts(is_todays_pick, is_recently_added);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- ============================================
-- MEDIA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  alt_text TEXT DEFAULT '',
  folder TEXT DEFAULT '',
  uploaded_by TEXT DEFAULT 'admin',
  uploader_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploader_id) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_media_filename ON media(filename);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_mime_type ON media(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_folder ON media(folder);
CREATE INDEX IF NOT EXISTS idx_media_uploader_id ON media(uploader_id);

-- ============================================
-- PRODUCTS SYSTEM
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT,
  brand TEXT,
  cover_image TEXT DEFAULT '',
  in_stock INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_top_pick INTEGER DEFAULT 0,
  is_newly_released INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_top_pick ON products(is_top_pick);
CREATE INDEX IF NOT EXISTS idx_products_is_newly_released ON products(is_newly_released);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);

CREATE TABLE IF NOT EXISTS product_resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('reddit', 'youtube', 'tiktok', 'shop')),
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  author TEXT,
  shop_name TEXT,
  published_at DATETIME,
  is_featured INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_resources_product_id ON product_resources(product_id);
CREATE INDEX IF NOT EXISTS idx_resources_platform ON product_resources(platform);
CREATE INDEX IF NOT EXISTS idx_resources_product_platform ON product_resources(product_id, platform);
CREATE INDEX IF NOT EXISTS idx_resources_featured ON product_resources(is_featured);
CREATE INDEX IF NOT EXISTS idx_resources_active ON product_resources(is_active);

-- ============================================
-- TEMPLATES (Content Templates)
-- ============================================
CREATE TABLE IF NOT EXISTS templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  description TEXT DEFAULT '',
  thumbnail_url TEXT DEFAULT '',
  is_active INTEGER DEFAULT 1,
  usage_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER
);

CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_name ON templates(name);
CREATE INDEX IF NOT EXISTS idx_templates_category_name ON templates(category, name);
CREATE INDEX IF NOT EXISTS idx_templates_is_active ON templates(is_active);

-- ============================================
-- RELIABLE WEBSITES SYSTEM (3-Level)
-- ============================================
CREATE TABLE IF NOT EXISTS reliable_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📚',
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reliable_categories_slug ON reliable_categories(slug);
CREATE INDEX IF NOT EXISTS idx_reliable_categories_active ON reliable_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_reliable_categories_order ON reliable_categories(display_order);

CREATE TABLE IF NOT EXISTS reliable_subcategories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES reliable_categories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reliable_subcategories_category ON reliable_subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_reliable_subcategories_slug ON reliable_subcategories(slug);
CREATE INDEX IF NOT EXISTS idx_reliable_subcategories_active ON reliable_subcategories(is_active);

CREATE TABLE IF NOT EXISTS reliable_sub_subcategories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subcategory_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subcategory_id) REFERENCES reliable_subcategories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sub_subcategories_subcategory ON reliable_sub_subcategories(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_sub_subcategories_slug ON reliable_sub_subcategories(slug);
CREATE INDEX IF NOT EXISTS idx_sub_subcategories_active ON reliable_sub_subcategories(is_active);

CREATE TABLE IF NOT EXISTS reliable_websites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subcategory_id INTEGER NOT NULL,
  sub_subcategory_id INTEGER,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  reliability_score INTEGER DEFAULT 5,
  notes TEXT,
  country TEXT DEFAULT 'USA',
  language TEXT DEFAULT 'English',
  logo_url TEXT,
  is_featured INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  last_verified DATE,
  verified_by TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subcategory_id) REFERENCES reliable_subcategories(id) ON DELETE CASCADE,
  FOREIGN KEY (sub_subcategory_id) REFERENCES reliable_sub_subcategories(id) ON DELETE SET NULL,
  UNIQUE(url, subcategory_id, sub_subcategory_id)
);

CREATE INDEX IF NOT EXISTS idx_reliable_websites_subcategory ON reliable_websites(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_reliable_websites_sub_subcategory ON reliable_websites(sub_subcategory_id);
CREATE INDEX IF NOT EXISTS idx_reliable_websites_score ON reliable_websites(reliability_score DESC);
CREATE INDEX IF NOT EXISTS idx_reliable_websites_name ON reliable_websites(name);
CREATE INDEX IF NOT EXISTS idx_reliable_websites_active ON reliable_websites(is_active);
CREATE INDEX IF NOT EXISTS idx_reliable_websites_featured ON reliable_websites(is_featured);
CREATE INDEX IF NOT EXISTS idx_reliable_websites_url ON reliable_websites(url);

CREATE TABLE IF NOT EXISTS reliable_verification_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  website_id INTEGER NOT NULL,
  verified_by TEXT,
  verification_date DATE,
  old_score INTEGER,
  new_score INTEGER,
  status TEXT DEFAULT 'verified',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (website_id) REFERENCES reliable_websites(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_verification_website ON reliable_verification_log(website_id);
CREATE INDEX IF NOT EXISTS idx_verification_date ON reliable_verification_log(verification_date);

-- ============================================
-- CONTENT CALENDAR
-- ============================================
CREATE TABLE IF NOT EXISTS content_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT DEFAULT '📄',
  color TEXT DEFAULT '#3b82f6',
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_content_types_slug ON content_types(slug);
CREATE INDEX IF NOT EXISTS idx_content_types_active ON content_types(is_active);

CREATE TABLE IF NOT EXISTS content_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES reliable_categories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_content_categories_category ON content_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_content_categories_slug ON content_categories(slug);
CREATE INDEX IF NOT EXISTS idx_content_categories_active ON content_categories(is_active);

CREATE TABLE IF NOT EXISTS content_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#94a3b8',
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_content_status_slug ON content_status(slug);

INSERT OR IGNORE INTO content_status (name, slug, color, display_order) VALUES
('Idea', 'idea', '#94a3b8', 1),
('Draft', 'draft', '#f59e0b', 2),
('In Review', 'in-review', '#8b5cf6', 3),
('Scheduled', 'scheduled', '#3b82f6', 4),
('Published', 'published', '#22c55e', 5);

CREATE TABLE IF NOT EXISTS content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  content_type_id INTEGER NOT NULL,
  category_id INTEGER,
  status_id INTEGER DEFAULT 1,
  author_id INTEGER,
  featured_image TEXT,
  cover_image TEXT,
  tags TEXT DEFAULT '',
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  scheduled_publish_at DATETIME,
  published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_published INTEGER DEFAULT 0,
  is_featured INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  source_url TEXT,
  source_name TEXT,
  source_type TEXT DEFAULT 'original',
  FOREIGN KEY (content_type_id) REFERENCES content_types(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES content_categories(id) ON DELETE SET NULL,
  FOREIGN KEY (status_id) REFERENCES content_status(id) ON DELETE SET NULL,
  FOREIGN KEY (author_id) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_content_slug ON content(slug);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status_id);
CREATE INDEX IF NOT EXISTS idx_content_scheduled_publish_at ON content(scheduled_publish_at);
CREATE INDEX IF NOT EXISTS idx_content_published_at ON content(published_at);
CREATE INDEX IF NOT EXISTS idx_content_category ON content(category_id);
CREATE INDEX IF NOT EXISTS idx_content_type ON content(content_type_id);
CREATE INDEX IF NOT EXISTS idx_content_is_published ON content(is_published);
CREATE INDEX IF NOT EXISTS idx_content_scheduled_status ON content(scheduled_publish_at, is_published);

CREATE TABLE IF NOT EXISTS content_resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_id INTEGER NOT NULL,
  reliable_website_id INTEGER,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  type TEXT DEFAULT 'link',
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
  FOREIGN KEY (reliable_website_id) REFERENCES reliable_websites(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_content_resources_content ON content_resources(content_id);
CREATE INDEX IF NOT EXISTS idx_content_resources_website ON content_resources(reliable_website_id);

CREATE TABLE IF NOT EXISTS content_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_id INTEGER NOT NULL,
  user_id INTEGER,
  action TEXT NOT NULL,
  field TEXT,
  old_value TEXT,
  new_value TEXT,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_content_history_content ON content_history(content_id);
CREATE INDEX IF NOT EXISTS idx_content_history_created ON content_history(created_at DESC);

-- ============================================
-- AUDIT LOG
-- ============================================
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id INTEGER,
  old_data TEXT,
  new_data TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_admin ON audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);

-- ============================================
-- RATE LIMITING
-- ============================================
CREATE TABLE IF NOT EXISTS rate_limits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  reset_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(ip, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON rate_limits(ip);
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset ON rate_limits(reset_at);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================

-- Admin updates
CREATE TRIGGER IF NOT EXISTS update_admins_timestamp 
AFTER UPDATE ON admins
BEGIN
  UPDATE admins SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Subscriber updates
CREATE TRIGGER IF NOT EXISTS update_subscriber_timestamp 
AFTER UPDATE ON newsletter_subscribers
BEGIN
  UPDATE newsletter_subscribers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Campaign updates
CREATE TRIGGER IF NOT EXISTS update_campaign_timestamp 
AFTER UPDATE ON newsletter_campaigns
BEGIN
  UPDATE newsletter_campaigns SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Post updates
CREATE TRIGGER IF NOT EXISTS update_posts_timestamp 
AFTER UPDATE ON posts
BEGIN
  UPDATE posts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Product updates
CREATE TRIGGER IF NOT EXISTS update_products_timestamp 
AFTER UPDATE ON products
BEGIN
  UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Media updates
CREATE TRIGGER IF NOT EXISTS update_media_timestamp 
AFTER UPDATE ON media
BEGIN
  UPDATE media SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ============================================
-- INITIAL DATA
-- ============================================

INSERT OR IGNORE INTO reliable_categories (name, slug, description, icon, display_order, is_active) VALUES
('Health & Wellness', 'health-wellness', 'Health tips, wellness advice, and self-care guides', '🧘', 1, 1),
('Food & Dining', 'food-dining', 'Restaurant reviews, recipes, and food recommendations', '🍽️', 2, 1),
('Entertainment', 'entertainment', 'Movies, TV shows, events, and things to do', '🎬', 3, 1),
('Lifestyle', 'lifestyle', 'Living well, travel, and everyday inspiration', '🌟', 4, 1),
('Technology', 'technology', 'Latest tech news, gadgets, and innovations', '💻', 5, 1),
('Shopping', 'shopping', 'Best deals, product reviews, and shopping guides', '🛍️', 6, 1),
('Real Estate', 'real-estate', 'Market trends, buying tips, and property insights', '🏠', 7, 1),
('Finance', 'finance', 'Money management, investing, and financial planning', '💰', 8, 1);

INSERT OR IGNORE INTO content_types (name, slug, icon, color, description) VALUES
('Blog Post', 'blog-post', '📝', '#3b82f6', 'Standard blog post'),
('News Article', 'news-article', '📰', '#ef4444', 'News article'),
('Guide', 'guide', '📖', '#22c55e', 'How-to guide'),
('Review', 'review', '⭐', '#f59e0b', 'Product or service review'),
('Listicle', 'listicle', '📋', '#8b5cf6', 'List-based article');

INSERT OR IGNORE INTO content_categories (category_id, name, slug, description) 
SELECT id, name, slug, description FROM reliable_categories WHERE is_active = 1;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all tables
-- SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;

-- Check newsletter subscribers
-- SELECT COUNT(*) as total_subscribers FROM newsletter_subscribers;

-- Check newsletter lists
-- SELECT * FROM newsletter_lists;

-- Check campaigns
-- SELECT COUNT(*) as total_campaigns FROM newsletter_campaigns;

-- Check automations
-- SELECT * FROM newsletter_automations;

-- Check content status
-- SELECT * FROM content_status;