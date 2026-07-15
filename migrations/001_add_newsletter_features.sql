-- ============================================
-- MIGRATION: Add Newsletter Features
-- Date: 2026-07-15
-- Description: Adds new columns and tables for newsletter system
-- ============================================

-- ============================================
-- 1. UPDATE SUBSCRIBERS TABLE
-- ============================================

-- Add new columns
ALTER TABLE subscribers ADD COLUMN status TEXT DEFAULT 'pending';
ALTER TABLE subscribers ADD COLUMN unsubscribe_token TEXT;
ALTER TABLE subscribers ADD COLUMN source TEXT DEFAULT 'website';

-- Update status based on existing data
UPDATE subscribers SET status = 'active' WHERE verified = 1 AND subscribed = 1;
UPDATE subscribers SET status = 'pending' WHERE verified = 0 AND subscribed = 1;
UPDATE subscribers SET status = 'unsubscribed' WHERE subscribed = 0;

-- Set unsubscribe_token for active subscribers
UPDATE subscribers SET unsubscribe_token = verification_token WHERE status = 'active';

-- Create UNIQUE index for unsubscribe_token
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_unsubscribe_token ON subscribers(unsubscribe_token) WHERE unsubscribe_token IS NOT NULL;

-- ============================================
-- 2. UPDATE NEWSLETTER_CAMPAIGNS TABLE
-- ============================================

-- Add new columns
ALTER TABLE newsletter_campaigns ADD COLUMN content_html TEXT;
ALTER TABLE newsletter_campaigns ADD COLUMN total_recipients INTEGER DEFAULT 0;

-- Copy existing content to content_html
UPDATE newsletter_campaigns SET content_html = content;

-- Note: bounced_count already exists, total_recipients and content_html are new

-- ============================================
-- 3. CREATE NEWSLETTER_PREFERENCES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS newsletter_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscriber_id INTEGER NOT NULL,
  category TEXT NOT NULL,
  subscribed INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscriber_id) REFERENCES subscribers(id) ON DELETE CASCADE,
  UNIQUE(subscriber_id, category)
);

CREATE INDEX IF NOT EXISTS idx_preferences_subscriber ON newsletter_preferences(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_preferences_category ON newsletter_preferences(category);
CREATE INDEX IF NOT EXISTS idx_preferences_subscribed ON newsletter_preferences(subscriber_id, subscribed);

-- ============================================
-- 4. CREATE NEWSLETTER_DELIVERIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS newsletter_deliveries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL,
  subscriber_id INTEGER NOT NULL,
  status TEXT DEFAULT 'queued',
  sent_at DATETIME,
  opened_at DATETIME,
  clicked_at DATETIME,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (subscriber_id) REFERENCES subscribers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_deliveries_campaign ON newsletter_deliveries(campaign_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_subscriber ON newsletter_deliveries(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON newsletter_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_campaign_status ON newsletter_deliveries(campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_deliveries_created_at ON newsletter_deliveries(created_at DESC);

-- ============================================
-- 5. CREATE UNSUBSCRIBE_FEEDBACK TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS unsubscribe_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscriber_id INTEGER NOT NULL,
  reason TEXT,
  feedback TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscriber_id) REFERENCES subscribers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_unsubscribe_feedback_subscriber ON unsubscribe_feedback(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_unsubscribe_feedback_created ON unsubscribe_feedback(created_at DESC);

-- ============================================
-- 6. VERIFICATION QUERIES (Optional - for testing)
-- ============================================

-- Check subscribers table
-- SELECT id, email, status, verified, subscribed FROM subscribers LIMIT 5;

-- Check campaigns table
-- SELECT id, subject, content_html, total_recipients FROM newsletter_campaigns LIMIT 1;

-- Check all new tables
-- SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'newsletter_%' ORDER BY name;