-- ============================================
-- SAFE MIGRATION - PRESERVES ALL EXISTING DATA
-- ============================================

-- ============================================
-- 1. CREATE NEWSLETTER TABLES (IF NOT EXISTS)
-- ============================================

-- 1.1 NEWSLETTER SUBSCRIBERS
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT DEFAULT '',
  last_name TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  verification_token TEXT UNIQUE,
  unsubscribe_token TEXT UNIQUE,
  source TEXT DEFAULT 'website',
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  preferences TEXT DEFAULT '{}',
  metadata TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  verified_at DATETIME,
  unsubscribed_at DATETIME,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 1.2 NEWSLETTER LISTS
CREATE TABLE IF NOT EXISTS newsletter_lists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 1.3 NEWSLETTER LIST MEMBERS
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

-- 1.4 NEWSLETTER CAMPAIGNS
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject TEXT NOT NULL,
  preview_text TEXT DEFAULT '',
  content_html TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
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
  metadata TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (list_id) REFERENCES newsletter_lists(id) ON DELETE SET NULL,
  FOREIGN KEY (template_id) REFERENCES newsletter_templates(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
);

-- 1.5 NEWSLETTER CAMPAIGN BLOCKS
CREATE TABLE IF NOT EXISTS newsletter_campaign_blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  metadata TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES newsletter_campaigns(id) ON DELETE CASCADE
);

-- 1.6 NEWSLETTER CAMPAIGN RECIPIENTS
CREATE TABLE IF NOT EXISTS newsletter_campaign_recipients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL,
  subscriber_id INTEGER NOT NULL,
  status TEXT DEFAULT 'queued',
  sent_at DATETIME,
  opened_at DATETIME,
  clicked_at DATETIME,
  clicked_url TEXT,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (subscriber_id) REFERENCES newsletter_subscribers(id) ON DELETE CASCADE
);

-- 1.7 NEWSLETTER QUEUE
CREATE TABLE IF NOT EXISTS newsletter_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL,
  subscriber_id INTEGER NOT NULL,
  priority INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME,
  FOREIGN KEY (campaign_id) REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (subscriber_id) REFERENCES newsletter_subscribers(id) ON DELETE CASCADE
);

-- 1.8 NEWSLETTER EVENTS
CREATE TABLE IF NOT EXISTS newsletter_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscriber_id INTEGER NOT NULL,
  campaign_id INTEGER,
  type TEXT NOT NULL,
  url TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscriber_id) REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  FOREIGN KEY (campaign_id) REFERENCES newsletter_campaigns(id) ON DELETE SET NULL
);

-- 1.9 NEWSLETTER TEMPLATES
CREATE TABLE IF NOT EXISTS newsletter_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content_html TEXT NOT NULL,
  thumbnail_url TEXT,
  is_active INTEGER DEFAULT 1,
  usage_count INTEGER DEFAULT 0,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
);

-- 1.10 NEWSLETTER SEGMENTS
CREATE TABLE IF NOT EXISTS newsletter_segments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  conditions TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 1.11 NEWSLETTER AUTOMATIONS
CREATE TABLE IF NOT EXISTS newsletter_automations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  trigger TEXT NOT NULL,
  conditions TEXT DEFAULT '{}',
  actions TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 1.12 NEWSLETTER LOGS
CREATE TABLE IF NOT EXISTS newsletter_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  context TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 1.13 NEWSLETTER SETTINGS
CREATE TABLE IF NOT EXISTS newsletter_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 1.14 UNSUBSCRIBE FEEDBACK
CREATE TABLE IF NOT EXISTS unsubscribe_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscriber_id INTEGER NOT NULL,
  reason TEXT,
  feedback TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscriber_id) REFERENCES newsletter_subscribers(id) ON DELETE CASCADE
);

-- ============================================
-- 2. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_ns_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_ns_status ON newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_ns_verification_token ON newsletter_subscribers(verification_token);
CREATE INDEX IF NOT EXISTS idx_ns_unsubscribe_token ON newsletter_subscribers(unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_ns_created_at ON newsletter_subscribers(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_nlm_subscriber ON newsletter_list_members(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_nlm_list ON newsletter_list_members(list_id);

CREATE INDEX IF NOT EXISTS idx_nc_status ON newsletter_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_nc_scheduled_at ON newsletter_campaigns(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_nc_sent_at ON newsletter_campaigns(sent_at);
CREATE INDEX IF NOT EXISTS idx_nc_created_at ON newsletter_campaigns(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ncb_campaign ON newsletter_campaign_blocks(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ncb_order ON newsletter_campaign_blocks(order_index);

CREATE INDEX IF NOT EXISTS idx_ncr_campaign ON newsletter_campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ncr_subscriber ON newsletter_campaign_recipients(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_ncr_status ON newsletter_campaign_recipients(status);

CREATE INDEX IF NOT EXISTS idx_nq_status ON newsletter_queue(status);
CREATE INDEX IF NOT EXISTS idx_nq_campaign ON newsletter_queue(campaign_id);
CREATE INDEX IF NOT EXISTS idx_nq_created_at ON newsletter_queue(created_at);

CREATE INDEX IF NOT EXISTS idx_ne_subscriber ON newsletter_events(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_ne_campaign ON newsletter_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ne_type ON newsletter_events(type);
CREATE INDEX IF NOT EXISTS idx_ne_created_at ON newsletter_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_nt_slug ON newsletter_templates(slug);
CREATE INDEX IF NOT EXISTS idx_nt_is_active ON newsletter_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_nseg_slug ON newsletter_segments(slug);
CREATE INDEX IF NOT EXISTS idx_nseg_is_active ON newsletter_segments(is_active);

CREATE INDEX IF NOT EXISTS idx_na_trigger ON newsletter_automations(trigger);
CREATE INDEX IF NOT EXISTS idx_na_is_active ON newsletter_automations(is_active);

CREATE INDEX IF NOT EXISTS idx_nl_level ON newsletter_logs(level);
CREATE INDEX IF NOT EXISTS idx_nl_created_at ON newsletter_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ns_key ON newsletter_settings(key);

CREATE INDEX IF NOT EXISTS idx_uf_subscriber ON unsubscribe_feedback(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_uf_created_at ON unsubscribe_feedback(created_at DESC);

-- ============================================
-- 3. SEED DEFAULT DATA
-- ============================================

INSERT OR IGNORE INTO newsletter_lists (name, slug, description) VALUES
('General Newsletter', 'general', 'All subscribers'),
('Technology Weekly', 'technology', 'Tech news and updates'),
('Finance Weekly', 'finance', 'Financial insights and tips'),
('Health Weekly', 'health-wellness', 'Health and wellness updates'),
('Entertainment Weekly', 'entertainment', 'Entertainment news'),
('Shopping Deals', 'shopping', 'Best deals and shopping guides'),
('Breaking News', 'breaking', 'Urgent news alerts'),
('Editor''s Picks', 'editors-picks', 'Curated by our editors');

INSERT OR IGNORE INTO newsletter_templates (name, slug, description, content_html) VALUES
('Weekly Digest', 'weekly-digest', 'Weekly newsletter template', '<h1>Weekly Digest</h1><p>Your weekly update</p>'),
('Breaking News', 'breaking-news', 'Breaking news alert', '<h1>Breaking News</h1><p>Urgent update</p>'),
('Welcome Email', 'welcome', 'Welcome new subscribers', '<h1>Welcome!</h1><p>Thanks for subscribing</p>'),
('Verification Email', 'verification', 'Email verification', '<h1>Verify Your Email</h1><p>Please verify your email address</p>');

INSERT OR IGNORE INTO newsletter_automations (name, trigger, conditions, actions) VALUES
('Welcome Series', 'subscriber_created', '{}', '[{"type": "send_campaign", "delay": 0, "template": "welcome"}]'),
('New Article Alert', 'article_published', '{"category": "technology"}', '[{"type": "send_campaign", "delay": 0, "template": "breaking-news"}]'),
('Inactive User', 'no_opens_30days', '{}', '[{"type": "send_campaign", "delay": 0, "template": "we-miss-you"}]');

INSERT OR IGNORE INTO newsletter_settings (key, value, description) VALUES
('sender_name', 'Trendlin', 'Default sender name'),
('sender_email', 'contact@trendlin.com', 'Default sender email'),
('reply_to', 'contact@trendlin.com', 'Default reply-to email'),
('verification_required', 'true', 'Require email verification'),
('double_opt_in', 'true', 'Double opt-in required'),
('tracking_enabled', 'true', 'Enable open/click tracking'),
('rate_limit_per_minute', '6000', 'Rate limit for sending'),
('timezone', 'America/New_York', 'Default timezone'),
('footer_html', '<p>&copy; 2026 Trendlin. All rights reserved.</p>', 'Default footer HTML'),
('daily_digest_time', '09:00', 'Time for daily digest'),
('weekly_digest_day', 'friday', 'Day for weekly digest');

-- ============================================
-- 4. MIGRATE DATA FROM OLD TABLES (SAFE)
-- ============================================

-- 4.1 Migrate from subscribers table
INSERT OR IGNORE INTO newsletter_subscribers (email, first_name, last_name, status, verification_token, unsubscribe_token, source, created_at, verified_at, unsubscribed_at, updated_at)
SELECT 
  email,
  first_name,
  last_name,
  CASE 
    WHEN status IS NOT NULL AND status != '' THEN status 
    WHEN verified = 1 AND subscribed = 1 THEN 'active'
    WHEN verified = 0 AND subscribed = 1 THEN 'pending'
    WHEN subscribed = 0 THEN 'unsubscribed'
    ELSE 'pending'
  END as status,
  verification_token,
  unsubscribe_token,
  source,
  created_at,
  verified_at,
  unsubscribed_at,
  updated_at
FROM subscribers 
WHERE email IS NOT NULL 
  AND email != '' 
  AND email NOT IN (SELECT email FROM newsletter_subscribers);

-- 4.2 Add existing subscribers to default list
INSERT OR IGNORE INTO newsletter_list_members (subscriber_id, list_id, subscribed, created_at, updated_at)
SELECT 
  ns.id,
  (SELECT id FROM newsletter_lists WHERE slug = 'general'),
  1,
  ns.created_at,
  ns.updated_at
FROM newsletter_subscribers ns
WHERE ns.status IN ('active', 'pending')
AND NOT EXISTS (
  SELECT 1 FROM newsletter_list_members nlm 
  WHERE nlm.subscriber_id = ns.id 
  AND nlm.list_id = (SELECT id FROM newsletter_lists WHERE slug = 'general')
);

-- 4.3 Log migration completion
INSERT INTO newsletter_logs (level, message, context, created_at)
VALUES ('info', 'Migration completed successfully', '{"timestamp": "' || datetime('now') || '"}', datetime('now'));

-- ============================================
-- 5. VERIFICATION QUERIES
-- ============================================

-- SELECT 'newsletter_subscribers' as table, COUNT(*) as count FROM newsletter_subscribers;
-- SELECT 'newsletter_lists' as table, COUNT(*) as count FROM newsletter_lists;
-- SELECT 'newsletter_templates' as table, COUNT(*) as count FROM newsletter_templates;
-- SELECT 'newsletter_automations' as table, COUNT(*) as count FROM newsletter_automations;
-- SELECT 'newsletter_settings' as table, COUNT(*) as count FROM newsletter_settings;