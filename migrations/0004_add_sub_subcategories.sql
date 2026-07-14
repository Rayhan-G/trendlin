-- Migration number: 0004 2026-07-14T11:30:00.000Z
-- ============================================
-- ADD SUB-SUBCATEGORIES TABLE (Level 3)
-- ============================================

-- ============================================
-- CREATE SUB-SUBCATEGORIES TABLE
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
-- UPDATE RELIABLE_WEBSITES TABLE
-- Add sub_subcategory_id column
-- ============================================
ALTER TABLE reliable_websites ADD COLUMN sub_subcategory_id INTEGER REFERENCES reliable_sub_subcategories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_reliable_websites_sub_subcategory ON reliable_websites(sub_subcategory_id);