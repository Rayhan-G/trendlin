-- Migration number: 0003 	 2026-07-14T10:59:42.687Z
-- ============================================
-- DROP PREVIOUS SOURCES TABLES
-- ============================================

-- Drop old sources tables (if they exist)
DROP TABLE IF EXISTS sources_reviews;
DROP TABLE IF EXISTS sources_state;
DROP TABLE IF EXISTS sources_master;
DROP TABLE IF EXISTS sources_states;
DROP TABLE IF EXISTS sources_categories;
DROP TABLE IF EXISTS sources;

-- ============================================
-- CREATE NEW RELIABLE TABLES
-- ============================================

-- RELIABLE_CATEGORIES - 8 Main Categories
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

-- RELIABLE_SUBCATEGORIES - 10-20 Subcategories per Category
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

-- RELIABLE_WEBSITES - 10 Websites per Subcategory
CREATE TABLE IF NOT EXISTS reliable_websites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subcategory_id INTEGER NOT NULL,
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
  UNIQUE(url, subcategory_id)
);

CREATE INDEX IF NOT EXISTS idx_reliable_websites_subcategory ON reliable_websites(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_reliable_websites_score ON reliable_websites(reliability_score DESC);
CREATE INDEX IF NOT EXISTS idx_reliable_websites_name ON reliable_websites(name);
CREATE INDEX IF NOT EXISTS idx_reliable_websites_active ON reliable_websites(is_active);
CREATE INDEX IF NOT EXISTS idx_reliable_websites_featured ON reliable_websites(is_featured);

-- RELIABLE_VERIFICATION_LOG - Track verification history
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