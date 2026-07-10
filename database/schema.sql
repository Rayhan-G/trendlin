-- ============================================
-- TRENDLIN DATABASE SCHEMA
-- ============================================

-- Drop existing tables if they exist (be careful with this in production!)
-- DROP TABLE IF EXISTS posts;
-- DROP TABLE IF EXISTS categories;
-- DROP TABLE IF EXISTS users;

-- ============================================
-- POSTS TABLE
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
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_is_published ON posts(is_published);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- ============================================
-- CATEGORIES TABLE (Optional - for future use)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================
INSERT OR IGNORE INTO posts (
  title, slug, content, category, is_published, created_at
) VALUES (
  'Welcome to Trendlin',
  'welcome-to-trendlin',
  '<h1>Welcome to Trendlin</h1><p>Your trusted source for honest reviews and local insights in Los Angeles.</p><p>This is a sample post to get you started.</p>',
  'Lifestyle',
  1,
  datetime('now')
);

INSERT OR IGNORE INTO posts (
  title, slug, content, category, is_draft, created_at
) VALUES (
  'Draft Post Example',
  'draft-post-example',
  '<h1>Draft Post</h1><p>This is a draft post that is not published yet.</p>',
  'Technology',
  1,
  datetime('now')
);

INSERT OR IGNORE INTO categories (name, slug) VALUES 
  ('Food & Dining', 'food-dining'),
  ('Entertainment', 'entertainment'),
  ('Shopping', 'shopping'),
  ('Lifestyle', 'lifestyle'),
  ('Technology', 'technology'),
  ('Travel', 'travel'),
  ('Health & Wellness', 'health-wellness'),
  ('Real Estate', 'real-estate'),
  ('Finance', 'finance'),
  ('Fashion', 'fashion');