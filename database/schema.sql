-- ============================================
-- TRENDLIN COMPLETE DATABASE SCHEMA
-- ============================================

-- Drop existing tables if they exist (be careful with this in production!)
-- DROP TABLE IF EXISTS posts;
-- DROP TABLE IF EXISTS categories;
-- DROP TABLE IF EXISTS media;
-- DROP TABLE IF EXISTS sessions;
-- DROP TABLE IF EXISTS admins;

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
  author_id INTEGER,
  published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES admins(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_is_published ON posts(is_published);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);

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

-- Create indexes for media table
CREATE INDEX IF NOT EXISTS idx_media_filename ON media(filename);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_mime_type ON media(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_folder ON media(folder);
CREATE INDEX IF NOT EXISTS idx_media_uploader_id ON media(uploader_id);

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================

-- Create default admin user (password: admin123)
INSERT OR IGNORE INTO admins (username, password_hash, email, role, created_at, updated_at)
VALUES (
  'admin',
  '$2b$10$m.6/D1LMwG/D6V7Rzdv/FeUJQTUmfEykNcekY9nX29lLukMq9jys2',
  'admin@trendlin.com',
  'admin',
  datetime('now'),
  datetime('now')
);

-- Sample posts
INSERT OR IGNORE INTO posts (
  title, slug, content, category, is_published, published_at, created_at
) VALUES (
  'Welcome to Trendlin',
  'welcome-to-trendlin',
  '<h1>Welcome to Trendlin</h1><p>Your trusted source for honest reviews and local insights in Los Angeles.</p><p>This is a sample post to get you started.</p>',
  'Lifestyle',
  1,
  datetime('now'),
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

-- Sample categories
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