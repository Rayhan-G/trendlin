import type { Subscriber } from '@/types/newsletter';

// ============================================
// SUBSCRIBER FUNCTIONS
// ============================================

export async function getSubscriberByEmail(email: string, db: any): Promise<Subscriber | null> {
  const result = await db.prepare(
    'SELECT * FROM subscribers WHERE email = ?'
  ).bind(email.toLowerCase().trim()).first();
  return result as Subscriber | null;
}

export async function getSubscriberByToken(token: string, db: any): Promise<Subscriber | null> {
  const result = await db.prepare(
    'SELECT * FROM subscribers WHERE verification_token = ?'
  ).bind(token).first();
  return result as Subscriber | null;
}

export async function getSubscriberByUnsubscribeToken(token: string, db: any): Promise<Subscriber | null> {
  const result = await db.prepare(
    'SELECT * FROM subscribers WHERE unsubscribe_token = ?'
  ).bind(token).first();
  return result as Subscriber | null;
}

export async function getSubscriberById(id: number, db: any): Promise<Subscriber | null> {
  const result = await db.prepare(
    'SELECT * FROM subscribers WHERE id = ?'
  ).bind(id).first();
  return result as Subscriber | null;
}

export async function createSubscriber(data: {
  email: string;
  firstName?: string;
  categories?: string[];
  source?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
}, db: any): Promise<Subscriber> {
  const { email, firstName, categories = ['general'], source = 'website', ipAddress, userAgent, referrer } = data;
  
  const verificationToken = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
  const unsubscribeToken = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
  const categoriesStr = categories.join(',');
  
  const result = await db.prepare(`
    INSERT INTO subscribers (
      email, 
      first_name, 
      categories, 
      status,
      verification_token, 
      unsubscribe_token,
      source,
      ip_address,
      user_agent,
      referrer
    )
    VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)
    RETURNING *
  `).bind(
    email.toLowerCase().trim(),
    firstName || '',
    categoriesStr,
    verificationToken,
    unsubscribeToken,
    source,
    ipAddress || null,
    userAgent || null,
    referrer || null
  ).first();

  if (result && categories.length > 0 && categories[0] !== 'general') {
    const placeholders = categories.map(() => '(?, ?, 1)').join(', ');
    const values = categories.flatMap(cat => [result.id, cat]);
    
    await db.prepare(`
      INSERT INTO newsletter_preferences (subscriber_id, category, subscribed)
      VALUES ${placeholders}
    `).bind(...values).run();
  }

  return result as Subscriber;
}

export async function verifySubscriber(token: string, db: any): Promise<Subscriber | null> {
  const result = await db.prepare(`
    UPDATE subscribers 
    SET status = 'active',
        verified_at = CURRENT_TIMESTAMP,
        verification_token = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE verification_token = ?
    RETURNING *
  `).bind(token).first();
  
  return result as Subscriber | null;
}

export async function unsubscribeSubscriber(token: string, reason?: string, feedback?: string, db: any): Promise<Subscriber | null> {
  const subscriber = await db.prepare(
    'SELECT * FROM subscribers WHERE unsubscribe_token = ?'
  ).bind(token).first();

  if (!subscriber) return null;

  const result = await db.prepare(`
    UPDATE subscribers 
    SET status = 'unsubscribed', 
        unsubscribed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    RETURNING *
  `).bind(subscriber.id).first();

  await db.prepare(`
    UPDATE newsletter_preferences 
    SET subscribed = 0,
        updated_at = CURRENT_TIMESTAMP
    WHERE subscriber_id = ?
  `).bind(subscriber.id).run();

  if (reason || feedback) {
    await db.prepare(`
      INSERT INTO unsubscribe_feedback (subscriber_id, reason, feedback, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(subscriber.id, reason || null, feedback || null).run();
  }

  return result as Subscriber;
}

export async function getSubscriberStats(db: any) {
  const stats = await db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'unsubscribed' THEN 1 ELSE 0 END) as unsubscribed
    FROM subscribers
  `).first();
  return stats;
}

export async function getActiveSubscribers(db: any): Promise<Subscriber[]> {
  const results = await db.prepare(`
    SELECT * FROM subscribers WHERE status = 'active'
  `).all();
  return results.results as Subscriber[];
}

// ============================================
// PREFERENCES FUNCTIONS
// ============================================

export async function getSubscriberPreferences(subscriberId: number, db: any) {
  const results = await db.prepare(`
    SELECT category, subscribed 
    FROM newsletter_preferences 
    WHERE subscriber_id = ?
  `).bind(subscriberId).all();
  return results.results;
}

export async function updateSubscriberPreferences(
  subscriberId: number,
  categories: string[],
  db: any
) {
  await db.prepare(`
    UPDATE subscribers 
    SET categories = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(categories.join(','), subscriberId).run();

  await db.prepare(`
    DELETE FROM newsletter_preferences WHERE subscriber_id = ?
  `).bind(subscriberId).run();

  if (categories.length > 0 && categories[0] !== 'general') {
    const placeholders = categories.map(() => '(?, ?, 1)').join(', ');
    const values = categories.flatMap(cat => [subscriberId, cat]);
    
    await db.prepare(`
      INSERT INTO newsletter_preferences (subscriber_id, category, subscribed)
      VALUES ${placeholders}
    `).bind(...values).run();
  }

  return { subscriberId, categories };
}

// ============================================
// CAMPAIGN FUNCTIONS
// ============================================

export async function createCampaign(data: {
  subject: string;
  contentHtml: string;
  category?: string;
  scheduledAt?: string;
  createdBy?: number;
}, db: any) {
  const result = await db.prepare(`
    INSERT INTO newsletter_campaigns (
      subject, 
      content_html, 
      category, 
      status, 
      scheduled_at,
      created_by,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING *
  `).bind(
    data.subject,
    data.contentHtml,
    data.category || 'general',
    data.scheduledAt ? 'scheduled' : 'draft',
    data.scheduledAt || null,
    data.createdBy || null
  ).first();

  return result;
}

export async function getCampaigns(db: any) {
  const results = await db.prepare(`
    SELECT * FROM newsletter_campaigns 
    ORDER BY created_at DESC
  `).all();
  return results.results;
}

// ✅ ADDED: Get campaign by ID
export async function getCampaignById(id: number, db: any) {
  const result = await db.prepare(
    'SELECT * FROM newsletter_campaigns WHERE id = ?'
  ).bind(id).first();
  return result;
}

// ✅ ADDED: Get campaign stats
export async function getCampaignStats(campaignId: number, db: any) {
  const stats = await db.prepare(`
    SELECT 
      COUNT(*) as total_sent,
      SUM(CASE WHEN status = 'opened' THEN 1 ELSE 0 END) as opened,
      SUM(CASE WHEN status = 'clicked' THEN 1 ELSE 0 END) as clicked,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
    FROM newsletter_deliveries
    WHERE campaign_id = ?
  `).bind(campaignId).all();
  return stats;
}

export async function getScheduledCampaigns(db: any) {
  const results = await db.prepare(`
    SELECT * FROM newsletter_campaigns 
    WHERE status = 'scheduled' 
      AND scheduled_at <= CURRENT_TIMESTAMP
  `).all();
  return results.results;
}

export async function updateCampaignStatus(id: number, status: string, db: any) {
  const result = await db.prepare(`
    UPDATE newsletter_campaigns 
    SET status = ?,
        sent_at = CASE WHEN ? = 'sent' THEN CURRENT_TIMESTAMP ELSE sent_at END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    RETURNING *
  `).bind(status, status, id).first();
  return result;
}

// ============================================
// DELIVERY FUNCTIONS
// ============================================

export async function createDeliveries(campaignId: number, subscriberIds: number[], db: any) {
  if (subscriberIds.length === 0) return;

  const placeholders = subscriberIds.map(() => '(?, ?, ?)').join(', ');
  const values = subscriberIds.flatMap(id => [campaignId, id, 'queued']);
  
  await db.prepare(`
    INSERT INTO newsletter_deliveries (campaign_id, subscriber_id, status)
    VALUES ${placeholders}
  `).bind(...values).run();

  await db.prepare(`
    UPDATE newsletter_campaigns 
    SET total_recipients = total_recipients + ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(subscriberIds.length, campaignId).run();
}

export async function getPendingDeliveries(batchSize: number = 100, db: any) {
  const results = await db.prepare(`
    SELECT d.*, s.email, s.first_name, s.unsubscribe_token 
    FROM newsletter_deliveries d
    JOIN subscribers s ON s.id = d.subscriber_id
    WHERE d.status = 'queued'
    LIMIT ?
  `).bind(batchSize).all();
  return results.results;
}

export async function updateDeliveryStatus(id: number, status: string, db: any) {
  await db.prepare(`
    UPDATE newsletter_deliveries 
    SET status = ?,
        sent_at = CASE WHEN ? IN ('sent', 'opened', 'clicked') THEN COALESCE(sent_at, CURRENT_TIMESTAMP) ELSE sent_at END,
        opened_at = CASE WHEN ? = 'opened' THEN CURRENT_TIMESTAMP ELSE opened_at END,
        clicked_at = CASE WHEN ? = 'clicked' THEN CURRENT_TIMESTAMP ELSE clicked_at END
    WHERE id = ?
  `).bind(status, status, status, status, id).run();
}

// ============================================
// RESEND VERIFICATION
// ============================================

export async function resendVerification(email: string, db: any): Promise<Subscriber | null> {
  const token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
  
  const result = await db.prepare(`
    UPDATE subscribers 
    SET verification_token = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE email = ? AND status = 'pending'
    RETURNING *
  `).bind(token, email.toLowerCase().trim()).first();
  
  return result as Subscriber | null;
}

// ============================================
// REACTIVATE SUBSCRIBER
// ============================================

export async function reactivateSubscriber(email: string, categories: string[], db: any) {
  const token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
  
  const result = await db.prepare(`
    UPDATE subscribers 
    SET status = 'pending',
        verification_token = ?,
        categories = ?,
        unsubscribed_at = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE email = ?
    RETURNING *
  `).bind(token, categories.join(','), email.toLowerCase().trim()).first();

  return result as Subscriber | null;
}