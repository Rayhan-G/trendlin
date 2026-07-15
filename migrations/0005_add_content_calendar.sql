-- Migration number: 0005 2026-07-14T12:00:00.000Z
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

-- Insert default content types
INSERT INTO content_types (name, slug, icon, color, description) VALUES
('Article', 'article', '📄', '#3b82f6', 'Standard written article'),
('Blog Post', 'blog-post', '📝', '#8b5cf6', 'Blog post style content'),
('Video', 'video', '🎬', '#ef4444', 'Video content'),
('Podcast', 'podcast', '🎙️', '#f59e0b', 'Audio podcast content'),
('News', 'news', '📰', '#22c55e', 'News article'),
('Review', 'review', '⭐', '#ec4899', 'Product or service review'),
('Guide', 'guide', '📖', '#14b8a6', 'How-to guide');

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
('Published', 'published', '#22c55e', 5),
('Archived', 'archived', '#64748b', 6);

-- CONTENT_CATEGORIES - Content categories (mapped to reliable_categories)
CREATE TABLE IF NOT EXISTS content_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

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

-- Populate content_categories from reliable_categories
INSERT INTO content_categories (category_id, name, slug, description, is_active)
SELECT 
  id,
  name,
  slug,
  description,
  is_active
FROM reliable_categories;