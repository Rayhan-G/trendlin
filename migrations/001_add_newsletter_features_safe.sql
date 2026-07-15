-- ============================================ 
-- MIGRATION: Add Newsletter Features (Safe) 
-- Only adds columns that don't exist 
-- ============================================ 
 
-- 1. CREATE SUBSCRIBERS TABLE 
CREATE TABLE IF NOT EXISTS subscribers ( 
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  email TEXT UNIQUE NOT NULL, 
  first_name TEXT DEFAULT '', 
  last_name TEXT DEFAULT '', 
  status TEXT NOT NULL DEFAULT 'pending', 
  verification_token TEXT UNIQUE, 
  unsubscribe_token TEXT UNIQUE, 
  categories TEXT DEFAULT 'general', 
  source TEXT DEFAULT 'website', 
  ip_address TEXT, 
  user_agent TEXT, 
  referrer TEXT, 
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
  verified_at DATETIME, 
  unsubscribed_at DATETIME, 
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP 
); 
 
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email); 
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status); 
CREATE INDEX IF NOT EXISTS idx_subscribers_verification_token ON subscribers(verification_token); 
CREATE INDEX IF NOT EXISTS idx_subscribers_unsubscribe_token ON subscribers(unsubscribe_token); 
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON subscribers(created_at DESC); 
CREATE INDEX IF NOT EXISTS idx_subscribers_status_created ON subscribers(status, created_at DESC); 
 
-- 2. CREATE NEWSLETTER_CAMPAIGNS TABLE 
CREATE TABLE IF NOT EXISTS newsletter_campaigns ( 
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  subject TEXT NOT NULL, 
  content_html TEXT NOT NULL, 
  status TEXT NOT NULL DEFAULT 'draft', 
  category TEXT DEFAULT 'general', 
  scheduled_at DATETIME, 
  sent_at DATETIME, 
  total_recipients INTEGER DEFAULT 0, 
  opened_count INTEGER DEFAULT 0, 
  clicked_count INTEGER DEFAULT 0, 
  bounced_count INTEGER DEFAULT 0, 
  unsubscribed_count INTEGER DEFAULT 0, 
  created_by INTEGER, 
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
  FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL 
); 
 
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON newsletter_campaigns(status); 
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled_at ON newsletter_campaigns(scheduled_at); 
CREATE INDEX IF NOT EXISTS idx_campaigns_sent_at ON newsletter_campaigns(sent_at); 
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON newsletter_campaigns(created_at DESC); 
CREATE INDEX IF NOT EXISTS idx_campaigns_status_scheduled ON newsletter_campaigns(status, scheduled_at); 
 
-- 3. CREATE NEWSLETTER_PREFERENCES TABLE 
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
 
-- 4. CREATE NEWSLETTER_DELIVERIES TABLE 
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
 
-- 5. CREATE UNSUBSCRIBE_FEEDBACK TABLE 
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
