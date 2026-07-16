-- ============================================
-- TRENDLIN COMPLETE DATABASE SCHEMA
-- Version: 3.0.0
-- Database: Cloudflare D1 (SQLite)
-- ============================================

-- Enable foreign key constraints and WAL mode
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -64000; -- 64MB cache
PRAGMA temp_store = MEMORY;

-- ============================================
-- PART 1: AUTHENTICATION & SECURITY
-- ============================================

-- Admins / Users Table
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'editor' CHECK(role IN ('admin', 'editor', 'author', 'contributor')),
    permissions TEXT DEFAULT '{}', -- JSON array of permissions
    is_active INTEGER DEFAULT 1,
    is_verified INTEGER DEFAULT 0,
    verification_token TEXT,
    verification_expires DATETIME,
    reset_token TEXT,
    reset_expires DATETIME,
    login_attempts INTEGER DEFAULT 0,
    locked_until DATETIME,
    last_login DATETIME,
    last_ip TEXT,
    preferences TEXT DEFAULT '{}', -- JSON
    two_factor_enabled INTEGER DEFAULT 0,
    two_factor_secret TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admins_username ON admins(username);
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_role ON admins(role);
CREATE INDEX idx_admins_active ON admins(is_active);
CREATE INDEX idx_admins_verification_token ON admins(verification_token);
CREATE INDEX idx_admins_reset_token ON admins(reset_token);

-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES admins(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_session_id ON sessions(session_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Login History
CREATE TABLE IF NOT EXISTS login_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    login_type TEXT DEFAULT 'password',
    success INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES admins(id) ON DELETE CASCADE
);

CREATE INDEX idx_login_history_user ON login_history(user_id);
CREATE INDEX idx_login_history_created ON login_history(created_at DESC);

-- ============================================
-- PART 2: CONTENT MANAGEMENT SYSTEM
-- ============================================

-- Categories (Hierarchical)
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    parent_id INTEGER,
    icon TEXT,
    color TEXT DEFAULT '#3B82F6',
    meta_title TEXT,
    meta_description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    post_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_categories_order ON categories(display_order);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    post_count INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_name ON tags(name);

-- Posts (Main Content)
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image TEXT,
    cover_image TEXT,
    category_id INTEGER,
    author_id INTEGER,
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'review', 'scheduled', 'published', 'archived')),
    content_type TEXT DEFAULT 'article' CHECK(content_type IN ('article', 'news', 'review', 'guide', 'listicle', 'opinion', 'interview')),
    reading_time INTEGER,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_featured INTEGER DEFAULT 0,
    is_breaking INTEGER DEFAULT 0,
    is_todays_pick INTEGER DEFAULT 0,
    is_recently_added INTEGER DEFAULT 0,
    scheduled_publish DATETIME,
    published_at DATETIME,
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    canonical_url TEXT,
    source_url TEXT,
    source_name TEXT,
    source_type TEXT DEFAULT 'original',
    language TEXT DEFAULT 'en',
    word_count INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (author_id) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_content_type ON posts(content_type);
CREATE INDEX idx_posts_is_featured ON posts(is_featured);
CREATE INDEX idx_posts_is_breaking ON posts(is_breaking);
CREATE INDEX idx_posts_status_published ON posts(status, published_at);

-- Post Tags (Many-to-Many)
CREATE TABLE IF NOT EXISTS post_tags (
    post_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX idx_post_tags_post ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag ON post_tags(tag_id);

-- Post Relations (Related Content)
CREATE TABLE IF NOT EXISTS post_relations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_post_id INTEGER NOT NULL,
    target_post_id INTEGER NOT NULL,
    relation_type TEXT DEFAULT 'related',
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (target_post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE(source_post_id, target_post_id, relation_type)
);

CREATE INDEX idx_post_relations_source ON post_relations(source_post_id);
CREATE INDEX idx_post_relations_target ON post_relations(target_post_id);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER,
    parent_id INTEGER,
    author_name TEXT,
    author_email TEXT,
    author_url TEXT,
    author_ip TEXT,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'spam', 'trash')),
    likes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES admins(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_created ON comments(created_at DESC);

-- ============================================
-- PART 3: SEARCH SYSTEM (FTS5)
-- ============================================

-- FTS5 Virtual Tables
CREATE VIRTUAL TABLE IF NOT EXISTS posts_fts USING fts5(
    title,
    content,
    excerpt,
    tags,
    category,
    author,
    prefix='3,4,5',
    tokenize='porter unicode61'
);

-- FTS Sync Table
CREATE TABLE IF NOT EXISTS posts_fts_data (
    id INTEGER PRIMARY KEY,
    title TEXT,
    content TEXT,
    excerpt TEXT,
    tags TEXT,
    category TEXT,
    author TEXT
);

-- Recreate FTS with external content
DROP TABLE IF EXISTS posts_fts;
CREATE VIRTUAL TABLE posts_fts USING fts5(
    title,
    content,
    excerpt,
    tags,
    category,
    author,
    content=posts_fts_data,
    prefix='3,4,5',
    tokenize='porter unicode61'
);

-- FTS Triggers for Posts
CREATE TRIGGER IF NOT EXISTS posts_fts_ai AFTER INSERT ON posts
BEGIN
    INSERT INTO posts_fts_data (
        id, title, content, excerpt, tags, category, author
    ) VALUES (
        new.id,
        new.title,
        new.content,
        COALESCE(new.excerpt, ''),
        (SELECT GROUP_CONCAT(t.name) FROM tags t JOIN post_tags pt ON pt.tag_id = t.id WHERE pt.post_id = new.id),
        (SELECT name FROM categories WHERE id = new.category_id),
        (SELECT username FROM admins WHERE id = new.author_id)
    );
    INSERT INTO posts_fts (
        rowid, title, content, excerpt, tags, category, author
    ) VALUES (
        new.id,
        new.title,
        new.content,
        COALESCE(new.excerpt, ''),
        (SELECT GROUP_CONCAT(t.name) FROM tags t JOIN post_tags pt ON pt.tag_id = t.id WHERE pt.post_id = new.id),
        (SELECT name FROM categories WHERE id = new.category_id),
        (SELECT username FROM admins WHERE id = new.author_id)
    );
END;

CREATE TRIGGER IF NOT EXISTS posts_fts_au AFTER UPDATE ON posts
BEGIN
    UPDATE posts_fts_data SET
        title = new.title,
        content = new.content,
        excerpt = COALESCE(new.excerpt, ''),
        tags = (SELECT GROUP_CONCAT(t.name) FROM tags t JOIN post_tags pt ON pt.tag_id = t.id WHERE pt.post_id = new.id),
        category = (SELECT name FROM categories WHERE id = new.category_id),
        author = (SELECT username FROM admins WHERE id = new.author_id)
    WHERE id = new.id;
    
    UPDATE posts_fts SET
        title = new.title,
        content = new.content,
        excerpt = COALESCE(new.excerpt, ''),
        tags = (SELECT GROUP_CONCAT(t.name) FROM tags t JOIN post_tags pt ON pt.tag_id = t.id WHERE pt.post_id = new.id),
        category = (SELECT name FROM categories WHERE id = new.category_id),
        author = (SELECT username FROM admins WHERE id = new.author_id)
    WHERE rowid = new.id;
END;

CREATE TRIGGER IF NOT EXISTS posts_fts_ad AFTER DELETE ON posts
BEGIN
    DELETE FROM posts_fts_data WHERE id = old.id;
    DELETE FROM posts_fts WHERE rowid = old.id;
END;

-- ============================================
-- PART 4: SEARCH ANALYTICS & CACHE
-- ============================================

-- Search Analytics
CREATE TABLE IF NOT EXISTS search_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT NOT NULL,
    search_type TEXT DEFAULT 'global',
    user_id INTEGER,
    session_id TEXT,
    results_count INTEGER,
    clicked_result_id INTEGER,
    clicked_result_type TEXT,
    clicked_position INTEGER,
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    took_ms INTEGER,
    cache_hit INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE INDEX idx_search_analytics_query ON search_analytics(query);
CREATE INDEX idx_search_analytics_created ON search_analytics(created_at DESC);
CREATE INDEX idx_search_analytics_type ON search_analytics(search_type);
CREATE INDEX idx_search_analytics_user ON search_analytics(user_id);
CREATE INDEX idx_search_analytics_query_created ON search_analytics(query, created_at DESC);

-- Search Cache
CREATE TABLE IF NOT EXISTS search_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_hash TEXT UNIQUE NOT NULL,
    query TEXT NOT NULL,
    search_type TEXT,
    results_json TEXT NOT NULL,
    total_results INTEGER,
    expires_at DATETIME NOT NULL,
    hits INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_cache_hash ON search_cache(query_hash);
CREATE INDEX idx_search_cache_expires ON search_cache(expires_at);

-- Search Suggestions
CREATE TABLE IF NOT EXISTS search_suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT UNIQUE NOT NULL,
    normalized_query TEXT,
    frequency INTEGER DEFAULT 1,
    last_searched DATETIME,
    suggestion_type TEXT DEFAULT 'popular',
    category TEXT,
    confidence_score REAL DEFAULT 1.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_suggestions_frequency ON search_suggestions(frequency DESC);
CREATE INDEX idx_search_suggestions_normalized ON search_suggestions(normalized_query);
CREATE INDEX idx_search_suggestions_type ON search_suggestions(suggestion_type);
CREATE INDEX idx_search_suggestions_confidence ON search_suggestions(confidence_score DESC);

-- Spelling Corrections
CREATE TABLE IF NOT EXISTS search_spelling_corrections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    misspelling TEXT UNIQUE NOT NULL,
    correction TEXT NOT NULL,
    confidence REAL DEFAULT 0.8,
    frequency INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_spelling_misspelling ON search_spelling_corrections(misspelling);

-- Rate Limiting
CREATE TABLE IF NOT EXISTS search_rate_limits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    identifier TEXT NOT NULL,
    window_start DATETIME NOT NULL,
    request_count INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(identifier, window_start)
);

CREATE INDEX idx_rate_limits_identifier ON search_rate_limits(identifier);
CREATE INDEX idx_rate_limits_window ON search_rate_limits(window_start);

-- Search Query Logs (Debugging)
CREATE TABLE IF NOT EXISTS search_query_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT NOT NULL,
    query_parsed TEXT,
    search_type TEXT,
    results_count INTEGER,
    error_message TEXT,
    took_ms INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_logs_timestamp ON search_query_logs(timestamp DESC);
CREATE INDEX idx_search_logs_query ON search_query_logs(query);

-- ============================================
-- PART 5: NEWSLETTER SYSTEM
-- ============================================

-- Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT DEFAULT '',
    last_name TEXT DEFAULT '',
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'unsubscribed', 'suspended', 'bounced')),
    verification_token TEXT UNIQUE,
    unsubscribe_token TEXT UNIQUE,
    source TEXT DEFAULT 'website',
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    preferences TEXT DEFAULT '{}', -- JSON: {"categories": [], "frequency": "weekly"}
    metadata TEXT DEFAULT '{}', -- JSON: {"last_open": null, "last_click": null, "total_emails": 0}
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    verified_at DATETIME,
    unsubscribed_at DATETIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ns_email ON newsletter_subscribers(email);
CREATE INDEX idx_ns_status ON newsletter_subscribers(status);
CREATE INDEX idx_ns_verification_token ON newsletter_subscribers(verification_token);
CREATE INDEX idx_ns_unsubscribe_token ON newsletter_subscribers(unsubscribe_token);
CREATE INDEX idx_ns_created_at ON newsletter_subscribers(created_at DESC);
CREATE INDEX idx_ns_status_created ON newsletter_subscribers(status, created_at DESC);

-- Lists
CREATE TABLE IF NOT EXISTS newsletter_lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    subscriber_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_nl_slug ON newsletter_lists(slug);
CREATE INDEX idx_nl_active ON newsletter_lists(is_active);

-- Default Lists
INSERT OR IGNORE INTO newsletter_lists (name, slug, description) VALUES
('General Newsletter', 'general', 'All subscribers'),
('Technology Weekly', 'technology', 'Tech news and updates'),
('Finance Weekly', 'finance', 'Financial insights and tips'),
('Health & Wellness', 'health-wellness', 'Health and wellness updates'),
('Entertainment', 'entertainment', 'Entertainment news'),
('Shopping Deals', 'shopping', 'Best deals and shopping guides'),
('Breaking News', 'breaking', 'Urgent news alerts'),
('Editor''s Picks', 'editors-picks', 'Curated by our editors');

-- List Members
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

CREATE INDEX idx_nlm_subscriber ON newsletter_list_members(subscriber_id);
CREATE INDEX idx_nlm_list ON newsletter_list_members(list_id);
CREATE INDEX idx_nlm_subscribed ON newsletter_list_members(subscribed);

-- Campaigns
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT NOT NULL,
    preview_text TEXT DEFAULT '',
    content_html TEXT NOT NULL,
    content_text TEXT,
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'pending_review', 'approved', 'scheduled', 'sending', 'completed', 'paused', 'cancelled')),
    list_id INTEGER,
    segment_id INTEGER,
    template_id INTEGER,
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
    metadata TEXT DEFAULT '{}', -- JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (list_id) REFERENCES newsletter_lists(id) ON DELETE SET NULL,
    FOREIGN KEY (template_id) REFERENCES newsletter_templates(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE INDEX idx_nc_status ON newsletter_campaigns(status);
CREATE INDEX idx_nc_scheduled_at ON newsletter_campaigns(scheduled_at);
CREATE INDEX idx_nc_sent_at ON newsletter_campaigns(sent_at);
CREATE INDEX idx_nc_created_at ON newsletter_campaigns(created_at DESC);
CREATE INDEX idx_nc_status_scheduled ON newsletter_campaigns(status, scheduled_at);

-- Campaign Recipients
CREATE TABLE IF NOT EXISTS newsletter_campaign_recipients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    subscriber_id INTEGER NOT NULL,
    status TEXT DEFAULT 'queued' CHECK(status IN ('queued', 'sent', 'opened', 'clicked', 'bounced', 'failed', 'unsubscribed')),
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

CREATE INDEX idx_ncr_campaign ON newsletter_campaign_recipients(campaign_id);
CREATE INDEX idx_ncr_subscriber ON newsletter_campaign_recipients(subscriber_id);
CREATE INDEX idx_ncr_status ON newsletter_campaign_recipients(status);
CREATE INDEX idx_ncr_campaign_status ON newsletter_campaign_recipients(campaign_id, status);

-- Campaign Blocks
CREATE TABLE IF NOT EXISTS newsletter_campaign_blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('heading', 'paragraph', 'image', 'article', 'divider', 'button', 'article_collection', 'video')),
    content TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    metadata TEXT DEFAULT '{}', -- JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES newsletter_campaigns(id) ON DELETE CASCADE
);

CREATE INDEX idx_ncb_campaign ON newsletter_campaign_blocks(campaign_id);
CREATE INDEX idx_ncb_order ON newsletter_campaign_blocks(order_index);

-- Templates
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

CREATE INDEX idx_nt_active ON newsletter_templates(is_active);
CREATE INDEX idx_nt_slug ON newsletter_templates(slug);

-- Default Templates
INSERT OR IGNORE INTO newsletter_templates (name, slug, description, content_html) VALUES
('Weekly Digest', 'weekly-digest', 'Weekly newsletter template', '<!DOCTYPE html><html><body><h1>Weekly Digest</h1><p>Your weekly update</p></body></html>'),
('Breaking News', 'breaking-news', 'Breaking news alert', '<!DOCTYPE html><html><body><h1>Breaking News</h1><p>Urgent update</p></body></html>'),
('Welcome Email', 'welcome', 'Welcome new subscribers', '<!DOCTYPE html><html><body><h1>Welcome!</h1><p>Thanks for subscribing</p></body></html>'),
('Verification Email', 'verification', 'Email verification', '<!DOCTYPE html><html><body><h1>Verify Your Email</h1><p>Please verify your email address</p></body></html>');

-- Segments
CREATE TABLE IF NOT EXISTS newsletter_segments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    conditions TEXT NOT NULL, -- JSON
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ns_segments_active ON newsletter_segments(is_active);

-- Automations
CREATE TABLE IF NOT EXISTS newsletter_automations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    trigger TEXT NOT NULL CHECK(trigger IN ('article_published', 'subscriber_created', 'campaign_completed', 'no_opens_30days', 'clicked_link', 'birthday')),
    conditions TEXT DEFAULT '{}', -- JSON
    actions TEXT NOT NULL, -- JSON
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_na_active ON newsletter_automations(is_active);
CREATE INDEX idx_na_trigger ON newsletter_automations(trigger);

-- Newsletter Events
CREATE TABLE IF NOT EXISTS newsletter_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subscriber_id INTEGER NOT NULL,
    campaign_id INTEGER,
    type TEXT NOT NULL CHECK(type IN ('subscribe', 'unsubscribe', 'open', 'click', 'bounce', 'complaint', 'sent')),
    url TEXT,
    ip_address TEXT,
    user_agent TEXT,
    metadata TEXT DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscriber_id) REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
    FOREIGN KEY (campaign_id) REFERENCES newsletter_campaigns(id) ON DELETE SET NULL
);

CREATE INDEX idx_ne_subscriber ON newsletter_events(subscriber_id);
CREATE INDEX idx_ne_campaign ON newsletter_events(campaign_id);
CREATE INDEX idx_ne_type ON newsletter_events(type);
CREATE INDEX idx_ne_created_at ON newsletter_events(created_at DESC);

-- Newsletter Settings
CREATE TABLE IF NOT EXISTS newsletter_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO newsletter_settings (key, value, description) VALUES
('sender_name', 'Trendlin', 'Default sender name'),
('sender_email', 'contact@trendlin.com', 'Default sender email'),
('reply_to', 'contact@trendlin.com', 'Default reply-to email'),
('verification_required', 'true', 'Require email verification'),
('double_opt_in', 'true', 'Double opt-in required'),
('tracking_enabled', 'true', 'Enable open/click tracking'),
('rate_limit_per_minute', '6000', 'Rate limit for sending'),
('timezone', 'America/New_York', 'Default timezone'),
('footer_html', '<p>&copy; 2026 Trendlin. All rights reserved.</p>', 'Default footer HTML');

-- ============================================
-- PART 6: MEDIA & ASSETS
-- ============================================

CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    url TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    width INTEGER,
    height INTEGER,
    alt_text TEXT DEFAULT '',
    caption TEXT,
    folder TEXT DEFAULT '/',
    uploaded_by INTEGER,
    post_id INTEGER,
    is_featured INTEGER DEFAULT 0,
    metadata TEXT DEFAULT '{}', -- JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES admins(id) ON DELETE SET NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL
);

CREATE INDEX idx_media_filename ON media(filename);
CREATE INDEX idx_media_created_at ON media(created_at DESC);
CREATE INDEX idx_media_mime_type ON media(mime_type);
CREATE INDEX idx_media_folder ON media(folder);
CREATE INDEX idx_media_post ON media(post_id);
CREATE INDEX idx_media_uploader ON media(uploaded_by);

-- ============================================
-- PART 7: PRODUCTS & SHOPPING
-- ============================================

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT,
    brand TEXT,
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    cover_image TEXT,
    in_stock INTEGER DEFAULT 1,
    rating DECIMAL(3,2),
    review_count INTEGER DEFAULT 0,
    is_top_pick INTEGER DEFAULT 0,
    is_newly_released INTEGER DEFAULT 0,
    metadata TEXT DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_top_pick ON products(is_top_pick);
CREATE INDEX idx_products_newly_released ON products(is_newly_released);
CREATE INDEX idx_products_in_stock ON products(in_stock);

-- Product Resources (Reddit, YouTube, TikTok, Shop)
CREATE TABLE IF NOT EXISTS product_resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    platform TEXT NOT NULL CHECK(platform IN ('reddit', 'youtube', 'tiktok', 'shop', 'twitter', 'instagram', 'facebook')),
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    author TEXT,
    shop_name TEXT,
    published_at DATETIME,
    is_featured INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_resources_product ON product_resources(product_id);
CREATE INDEX idx_resources_platform ON product_resources(platform);
CREATE INDEX idx_resources_featured ON product_resources(is_featured);
CREATE INDEX idx_resources_active ON product_resources(is_active);

-- ============================================
-- PART 8: RELIABLE WEBSITES DIRECTORY
-- ============================================

-- Categories
CREATE TABLE IF NOT EXISTS reliable_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '📚',
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reliable_categories_slug ON reliable_categories(slug);
CREATE INDEX idx_reliable_categories_active ON reliable_categories(is_active);

-- Subcategories
CREATE TABLE IF NOT EXISTS reliable_subcategories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES reliable_categories(id) ON DELETE CASCADE
);

CREATE INDEX idx_reliable_subcategories_category ON reliable_subcategories(category_id);
CREATE INDEX idx_reliable_subcategories_slug ON reliable_subcategories(slug);

-- Sub-Subcategories
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

CREATE INDEX idx_sub_subcategories_subcategory ON reliable_sub_subcategories(subcategory_id);
CREATE INDEX idx_sub_subcategories_slug ON reliable_sub_subcategories(slug);

-- Websites
CREATE TABLE IF NOT EXISTS reliable_websites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subcategory_id INTEGER NOT NULL,
    sub_subcategory_id INTEGER,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    reliability_score INTEGER DEFAULT 5 CHECK(reliability_score BETWEEN 1 AND 10),
    notes TEXT,
    country TEXT DEFAULT 'USA',
    language TEXT DEFAULT 'English',
    logo_url TEXT,
    is_featured INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    last_verified DATE,
    verified_by TEXT,
    usage_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subcategory_id) REFERENCES reliable_subcategories(id) ON DELETE CASCADE,
    FOREIGN KEY (sub_subcategory_id) REFERENCES reliable_sub_subcategories(id) ON DELETE SET NULL,
    UNIQUE(url, subcategory_id, sub_subcategory_id)
);

CREATE INDEX idx_reliable_websites_subcategory ON reliable_websites(subcategory_id);
CREATE INDEX idx_reliable_websites_sub_subcategory ON reliable_websites(sub_subcategory_id);
CREATE INDEX idx_reliable_websites_score ON reliable_websites(reliability_score DESC);
CREATE INDEX idx_reliable_websites_name ON reliable_websites(name);
CREATE INDEX idx_reliable_websites_active ON reliable_websites(is_active);
CREATE INDEX idx_reliable_websites_featured ON reliable_websites(is_featured);
CREATE INDEX idx_reliable_websites_url ON reliable_websites(url);

-- Verification Log
CREATE TABLE IF NOT EXISTS reliable_verification_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    website_id INTEGER NOT NULL,
    verified_by TEXT,
    verification_date DATE,
    old_score INTEGER,
    new_score INTEGER,
    status TEXT DEFAULT 'verified',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (website_id) REFERENCES reliable_websites(id) ON DELETE CASCADE
);

CREATE INDEX idx_verification_website ON reliable_verification_log(website_id);
CREATE INDEX idx_verification_date ON reliable_verification_log(verification_date);

-- Initial Categories
INSERT OR IGNORE INTO reliable_categories (name, slug, description, icon, display_order) VALUES
('Health & Wellness', 'health-wellness', 'Health tips, wellness advice, and self-care guides', '🧘', 1),
('Food & Dining', 'food-dining', 'Restaurant reviews, recipes, and food recommendations', '🍽️', 2),
('Entertainment', 'entertainment', 'Movies, TV shows, events, and things to do', '🎬', 3),
('Lifestyle', 'lifestyle', 'Living well, travel, and everyday inspiration', '🌟', 4),
('Technology', 'technology', 'Latest tech news, gadgets, and innovations', '💻', 5),
('Shopping', 'shopping', 'Best deals, product reviews, and shopping guides', '🛍️', 6),
('Real Estate', 'real-estate', 'Market trends, buying tips, and property insights', '🏠', 7),
('Finance', 'finance', 'Money management, investing, and financial planning', '💰', 8);

-- ============================================
-- PART 9: CONTENT CALENDAR
-- ============================================

CREATE TABLE IF NOT EXISTS content_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT DEFAULT '📄',
    color TEXT DEFAULT '#3B82F6',
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO content_types (name, slug, icon, color, description) VALUES
('Blog Post', 'blog-post', '📝', '#3B82F6', 'Standard blog post'),
('News Article', 'news-article', '📰', '#EF4444', 'News article'),
('Guide', 'guide', '📖', '#22C55E', 'How-to guide'),
('Review', 'review', '⭐', '#F59E0B', 'Product or service review'),
('Listicle', 'listicle', '📋', '#8B5CF6', 'List-based article'),
('Interview', 'interview', '🎙️', '#EC4899', 'Interview with expert'),
('Video', 'video', '🎥', '#6B7280', 'Video content');

CREATE TABLE IF NOT EXISTS content_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#94A3B8',
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO content_status (name, slug, color, display_order) VALUES
('Idea', 'idea', '#94A3B8', 1),
('Draft', 'draft', '#F59E0B', 2),
('In Review', 'in-review', '#8B5CF6', 3),
('Scheduled', 'scheduled', '#3B82F6', 4),
('Published', 'published', '#22C55E', 5),
('Archived', 'archived', '#6B7280', 6);

CREATE TABLE IF NOT EXISTS content_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO content_categories (name, slug, description) VALUES
('Technology', 'technology', 'Tech content'),
('Health', 'health', 'Health and wellness'),
('Finance', 'finance', 'Finance and money'),
('Lifestyle', 'lifestyle', 'Lifestyle and living'),
('Entertainment', 'entertainment', 'Entertainment and media');

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
    scheduled_publish_at DATETIME,
    published_at DATETIME,
    is_published INTEGER DEFAULT 0,
    is_featured INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    source_url TEXT,
    source_name TEXT,
    source_type TEXT DEFAULT 'original',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (content_type_id) REFERENCES content_types(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES content_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (status_id) REFERENCES content_status(id) ON DELETE SET NULL,
    FOREIGN KEY (author_id) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE INDEX idx_content_slug ON content(slug);
CREATE INDEX idx_content_status ON content(status_id);
CREATE INDEX idx_content_type ON content(content_type_id);
CREATE INDEX idx_content_category ON content(category_id);
CREATE INDEX idx_content_scheduled_at ON content(scheduled_publish_at);
CREATE INDEX idx_content_published_at ON content(published_at);
CREATE INDEX idx_content_is_published ON content(is_published);

-- ============================================
-- PART 10: AUDIT & LOGGING
-- ============================================

CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id INTEGER,
    old_data TEXT,
    new_data TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_admin ON audit_log(admin_id);
CREATE INDEX idx_audit_table ON audit_log(table_name);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);
CREATE INDEX idx_audit_action ON audit_log(action);

-- ============================================
-- PART 11: SYSTEM CONFIGURATION
-- ============================================

CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    description TEXT,
    is_public INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO system_settings (key, value, category, description, is_public) VALUES
('site_name', 'Trendlin', 'general', 'Site name', 1),
('site_description', 'Trendlin - Your daily content hub', 'general', 'Site description', 1),
('site_url', 'https://trendlin.com', 'general', 'Site URL', 1),
('contact_email', 'contact@trendlin.com', 'general', 'Contact email', 1),
('timezone', 'America/New_York', 'general', 'Default timezone', 0),
('maintenance_mode', 'false', 'general', 'Maintenance mode', 0),
('allow_registration', 'true', 'security', 'Allow user registration', 1),
('require_email_verification', 'true', 'security', 'Require email verification', 1),
('max_login_attempts', '5', 'security', 'Maximum login attempts', 0),
('session_timeout', '3600', 'security', 'Session timeout in seconds', 0);

-- ============================================
-- PART 12: ANALYTICS & METRICS
-- ============================================

CREATE TABLE IF NOT EXISTS page_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_url TEXT NOT NULL,
    page_title TEXT,
    post_id INTEGER,
    user_id INTEGER,
    session_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    country TEXT,
    city TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE INDEX idx_page_views_post ON page_views(post_id);
CREATE INDEX idx_page_views_created ON page_views(created_at DESC);
CREATE INDEX idx_page_views_url ON page_views(page_url);

-- ============================================
-- TRIGGERS: AUTO-UPDATE TIMESTAMPS
-- ============================================

CREATE TRIGGER IF NOT EXISTS update_admins_timestamp 
AFTER UPDATE ON admins
BEGIN
    UPDATE admins SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_posts_timestamp 
AFTER UPDATE ON posts
BEGIN
    UPDATE posts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_categories_timestamp 
AFTER UPDATE ON categories
BEGIN
    UPDATE categories SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_products_timestamp 
AFTER UPDATE ON products
BEGIN
    UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_media_timestamp 
AFTER UPDATE ON media
BEGIN
    UPDATE media SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_subscribers_timestamp 
AFTER UPDATE ON newsletter_subscribers
BEGIN
    UPDATE newsletter_subscribers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_campaigns_timestamp 
AFTER UPDATE ON newsletter_campaigns
BEGIN
    UPDATE newsletter_campaigns SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_system_settings_timestamp 
AFTER UPDATE ON system_settings
BEGIN
    UPDATE system_settings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ============================================
-- INITIAL ADMIN USER
-- ============================================

-- Default admin: username: admin, password: admin123 (CHANGE ME!)
INSERT OR IGNORE INTO admins (
    username, 
    email, 
    password_hash, 
    first_name, 
    last_name, 
    role, 
    is_active, 
    is_verified
) VALUES (
    'admin',
    'admin@trendlin.com',
    '$2b$10$hashed_password_here', -- Use bcrypt to generate this
    'Admin',
    'User',
    'admin',
    1,
    1
);

-- ============================================
-- SEARCH INDEX OPTIMIZATION
-- ============================================

-- Optimize FTS index (run periodically)
-- INSERT INTO posts_fts(posts_fts) VALUES('optimize');

-- ============================================
-- DATABASE VERIFICATION QUERIES
-- ============================================

-- Check all tables
-- SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;

-- Check table counts
-- SELECT 'admins' as table_name, COUNT(*) as count FROM admins
-- UNION ALL SELECT 'posts', COUNT(*) FROM posts
-- UNION ALL SELECT 'categories', COUNT(*) FROM categories
-- UNION ALL SELECT 'tags', COUNT(*) FROM tags
-- UNION ALL SELECT 'newsletter_subscribers', COUNT(*) FROM newsletter_subscribers
-- UNION ALL SELECT 'products', COUNT(*) FROM products;

-- Check FTS sync
-- SELECT COUNT(*) as posts_count FROM posts WHERE status = 'published';
-- SELECT COUNT(*) as fts_count FROM posts_fts;

-- ============================================
-- END OF SCHEMA
-- ============================================