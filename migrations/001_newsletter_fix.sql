-- ============================================
-- NEWSLETTER SYSTEM - PRODUCTION SCHEMA
-- For 200k-500k subscribers
-- ============================================

-- 1. SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'unsubscribed', 'suspended', 'bounced')),
  verification_token TEXT UNIQUE,
  unsubscribe_token TEXT UNIQUE,
  source TEXT DEFAULT 'website',
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  preferences TEXT, -- JSON
  metadata TEXT, -- JSON
  verified_at DATETIME,
  unsubscribed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. LISTS TABLE
CREATE TABLE IF NOT EXISTS newsletter_lists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. LIST MEMBERS
CREATE TABLE IF NOT EXISTS newsletter_list_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscriber_id INTEGER NOT NULL,
  list_id INTEGER NOT NULL,
  subscribed INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscriber_id) REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  FOREIGN KEY (list_id) REFERENCES newsletter_lists(id) ON DELETE CASCADE,
  UNIQUE(subscriber_id, list_id)
);

-- 4. CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject TEXT NOT NULL,
  preview_text TEXT,
  content_html TEXT NOT NULL,
  content_text TEXT,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'scheduled', 'sending', 'completed', 'paused', 'cancelled', 'failed')),
  list_id INTEGER,
  created_by INTEGER,
  scheduled_at DATETIME,
  sent_at DATETIME,
  total_recipients INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  unique_opens INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,
  spam_reports INTEGER DEFAULT 0,
  template_id INTEGER,
  metadata TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (list_id) REFERENCES newsletter_lists(id) ON DELETE SET NULL
);

-- 5. QUEUE TABLE (CRITICAL FOR 500k SCALING)
CREATE TABLE IF NOT EXISTS newsletter_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL,
  subscriber_id INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed', 'bounced', 'skipped')),
  priority INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  error_message TEXT,
  scheduled_at DATETIME,
  processed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (subscriber_id) REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  UNIQUE(campaign_id, subscriber_id)
);

-- 6. CAMPAIGN RECIPIENTS (For tracking)
CREATE TABLE IF NOT EXISTS newsletter_campaign_recipients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL,
  subscriber_id INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'sent', 'opened', 'clicked', 'bounced', 'unsubscribed', 'failed')),
  sent_at DATETIME,
  opened_at DATETIME,
  opened_count INTEGER DEFAULT 0,
  clicked_at DATETIME,
  clicked_count INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (subscriber_id) REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  UNIQUE(campaign_id, subscriber_id)
);

-- 7. EVENTS TABLE (Analytics)
CREATE TABLE IF NOT EXISTS newsletter_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscriber_id INTEGER NOT NULL,
  campaign_id INTEGER,
  type TEXT NOT NULL CHECK(type IN ('subscribe', 'unsubscribe', 'open', 'click', 'bounce', 'spam', 'confirm')),
  url TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscriber_id) REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  FOREIGN KEY (campaign_id) REFERENCES newsletter_campaigns(id) ON DELETE SET NULL
);

-- 8. UNSUBSCRIBE FEEDBACK
CREATE TABLE IF NOT EXISTS unsubscribe_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscriber_id INTEGER NOT NULL,
  campaign_id INTEGER,
  reason TEXT,
  feedback TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscriber_id) REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  FOREIGN KEY (campaign_id) REFERENCES newsletter_campaigns(id) ON DELETE SET NULL
);

-- ============================================
-- INDEXES FOR PERFORMANCE (CRITICAL)
-- ============================================

-- Subscribers indexes
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_verification_token ON newsletter_subscribers(verification_token);
CREATE INDEX IF NOT EXISTS idx_subscribers_unsubscribe_token ON newsletter_subscribers(unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON newsletter_subscribers(created_at);

-- Queue indexes (MOST IMPORTANT for 500k)
CREATE INDEX IF NOT EXISTS idx_queue_campaign_id ON newsletter_queue(campaign_id);
CREATE INDEX IF NOT EXISTS idx_queue_subscriber_id ON newsletter_queue(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_queue_status ON newsletter_queue(status);
CREATE INDEX IF NOT EXISTS idx_queue_created_at ON newsletter_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_queue_scheduled_at ON newsletter_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_queue_status_attempts ON newsletter_queue(status, attempts);

-- Campaign recipients indexes
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign ON newsletter_campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_subscriber ON newsletter_campaign_recipients(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_status ON newsletter_campaign_recipients(status);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_subscriber ON newsletter_events(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_events_campaign ON newsletter_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON newsletter_events(type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON newsletter_events(created_at);

-- List members indexes
CREATE INDEX IF NOT EXISTS idx_list_members_subscriber ON newsletter_list_members(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_list_members_list ON newsletter_list_members(list_id);

-- ============================================
-- INSERT DEFAULT LIST
-- ============================================

INSERT OR IGNORE INTO newsletter_lists (name, slug, description) 
VALUES ('General', 'general', 'All subscribers');