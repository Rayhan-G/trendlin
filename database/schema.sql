-- ============================================
-- TRENDLIN DATABASE SCHEMA
-- 4 Platforms: reddit, youtube, tiktok, shop
-- + Reliable Websites System with 3 Levels
-- ============================================

-- ============================================
-- ADMINS TABLE - Authentication
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
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
-- POSTS TABLE - Blog/Article Content
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
CREATE INDEX IF NOT EXISTS idx_posts_is_todays_pick ON posts(is_todays_pick);
CREATE INDEX IF NOT EXISTS idx_posts_is_recently_added ON posts(is_recently_added);

-- ============================================
-- CATEGORIES TABLE (Blog Categories)
-- ============================================
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
-- MEDIA TABLE - For managing images and videos
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
-- PRODUCTS TABLE - Product Recommendations
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

-- ============================================
-- PRODUCT RESOURCES TABLE - 4 Platforms Only
-- reddit | youtube | tiktok | shop
-- ============================================
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
-- TEMPLATES TABLE - Category-based Templates
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
-- RELIABLE WEBSITES - 3 Level System
-- Level 1: Categories (8 main categories + Shopping)
-- Level 2: Subcategories (10-20 per category)
-- Level 3: Sub-Subcategories (optional, for deeper organization)
-- ============================================

-- ============================================
-- RELIABLE_CATEGORIES - Level 1 (9 Categories)
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

-- ============================================
-- RELIABLE_SUBCATEGORIES - Level 2
-- ============================================
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

-- ============================================
-- RELIABLE_SUB_SUBCATEGORIES - Level 3
-- ============================================
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

-- ============================================
-- RELIABLE_WEBSITES - Websites linked to Level 2 or Level 3
-- ============================================
CREATE TABLE IF NOT EXISTS reliable_websites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subcategory_id INTEGER NOT NULL,
  sub_subcategory_id INTEGER, -- Optional, can be NULL
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

-- ============================================
-- RELIABLE_VERIFICATION_LOG - Track verification history
-- ============================================
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
-- CONTENT CALENDAR TABLES
-- ============================================

-- CONTENT_TYPES - Content types (Article, Video, Podcast, etc.)
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

-- CONTENT_CATEGORIES - Content categories (mapped to reliable_categories)
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

-- CONTENT_STATUS - Content status flow
CREATE TABLE IF NOT EXISTS content_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#94a3b8',
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO content_status (name, slug, color, display_order) VALUES
('Idea', 'idea', '#94a3b8', 1),
('Draft', 'draft', '#f59e0b', 2),
('In Review', 'in-review', '#8b5cf6', 3),
('Scheduled', 'scheduled', '#3b82f6', 4),
('Published', 'published', '#22c55e', 5);

-- CONTENT - Main content table
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
  
  -- Scheduling
  scheduled_publish_at DATETIME,
  published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_published INTEGER DEFAULT 0,
  is_featured INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  
  -- External sources
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

-- CONTENT_RESOURCES - Sources/links used in content
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

-- CONTENT_HISTORY - Track content changes
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