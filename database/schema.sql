-- ============================================
-- TRENDLIN DATABASE SCHEMA
-- 4 Platforms: reddit, youtube, tiktok, shop
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
-- CATEGORIES TABLE
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
-- SOURCES TABLE - Trusted Content Sources
-- ============================================
CREATE TABLE IF NOT EXISTS sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  source_type TEXT DEFAULT 'official',
  logo_url TEXT,
  is_active INTEGER DEFAULT 1,
  usage_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sources_category ON sources(category);
CREATE INDEX IF NOT EXISTS idx_sources_name ON sources(name);
CREATE INDEX IF NOT EXISTS idx_sources_is_active ON sources(is_active);

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
-- SOURCES MANAGEMENT - USA State-Based System
-- ============================================

-- ============================================
-- SOURCES_CATEGORIES - Master category list
-- ============================================
CREATE TABLE IF NOT EXISTS sources_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT DEFAULT '📁',
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sources_categories_slug ON sources_categories(slug);
CREATE INDEX IF NOT EXISTS idx_sources_categories_name ON sources_categories(name);
CREATE INDEX IF NOT EXISTS idx_sources_categories_display_order ON sources_categories(display_order);

-- ============================================
-- SOURCES_STATES - US States master list
-- ============================================
CREATE TABLE IF NOT EXISTS sources_states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  abbreviation TEXT NOT NULL UNIQUE,
  region TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sources_states_code ON sources_states(code);
CREATE INDEX IF NOT EXISTS idx_sources_states_abbreviation ON sources_states(abbreviation);
CREATE INDEX IF NOT EXISTS idx_sources_states_region ON sources_states(region);

-- ============================================
-- SOURCES_MASTER - Universal/General Sources (applies to all states)
-- ============================================
CREATE TABLE IF NOT EXISTS sources_master (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  category_id INTEGER NOT NULL,
  description TEXT,
  source_type TEXT DEFAULT 'official',
  logo_url TEXT,
  is_active INTEGER DEFAULT 1,
  is_featured INTEGER DEFAULT 0,
  trust_score INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES sources_categories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sources_master_category ON sources_master(category_id);
CREATE INDEX IF NOT EXISTS idx_sources_master_name ON sources_master(name);
CREATE INDEX IF NOT EXISTS idx_sources_master_is_active ON sources_master(is_active);
CREATE INDEX IF NOT EXISTS idx_sources_master_is_featured ON sources_master(is_featured);

-- ============================================
-- SOURCES_STATE - State-specific Sources
-- ============================================
CREATE TABLE IF NOT EXISTS sources_state (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  state_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  category_id INTEGER NOT NULL,
  description TEXT,
  source_type TEXT DEFAULT 'official',
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  is_active INTEGER DEFAULT 1,
  is_featured INTEGER DEFAULT 0,
  trust_score INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (state_id) REFERENCES sources_states(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES sources_categories(id) ON DELETE CASCADE,
  UNIQUE(state_id, name) -- Prevent duplicate sources per state
);

CREATE INDEX IF NOT EXISTS idx_sources_state_state_id ON sources_state(state_id);
CREATE INDEX IF NOT EXISTS idx_sources_state_category ON sources_state(category_id);
CREATE INDEX IF NOT EXISTS idx_sources_state_name ON sources_state(name);
CREATE INDEX IF NOT EXISTS idx_sources_state_is_active ON sources_state(is_active);
CREATE INDEX IF NOT EXISTS idx_sources_state_is_featured ON sources_state(is_featured);
CREATE INDEX IF NOT EXISTS idx_sources_state_state_category ON sources_state(state_id, category_id);

-- ============================================
-- SOURCES_REVIEWS - User reviews for sources
-- ============================================
CREATE TABLE IF NOT EXISTS sources_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_type TEXT NOT NULL CHECK (source_type IN ('master', 'state')),
  source_id INTEGER NOT NULL,
  reviewer_name TEXT,
  reviewer_email TEXT,
  rating INTEGER DEFAULT 0,
  review_text TEXT,
  is_approved INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sources_reviews_source ON sources_reviews(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_sources_reviews_rating ON sources_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_sources_reviews_is_approved ON sources_reviews(is_approved);