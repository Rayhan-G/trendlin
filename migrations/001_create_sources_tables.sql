-- Create sources categories table
CREATE TABLE IF NOT EXISTS sources_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
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

-- Create sources states table
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

-- Create master sources table
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

-- Create state sources table
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
  UNIQUE(state_id, name)
);

CREATE INDEX IF NOT EXISTS idx_sources_state_state_id ON sources_state(state_id);
CREATE INDEX IF NOT EXISTS idx_sources_state_category ON sources_state(category_id);
CREATE INDEX IF NOT EXISTS idx_sources_state_name ON sources_state(name);
CREATE INDEX IF NOT EXISTS idx_sources_state_is_active ON sources_state(is_active);

-- Create sources reviews table
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