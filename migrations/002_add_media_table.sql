-- ============================================
-- MIGRATION: Add Media Table
-- ============================================

-- Create media table for managing images and videos
CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    url TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    alt_text TEXT DEFAULT '',
    uploaded_by TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_media_filename ON media(filename);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_mime_type ON media(mime_type);