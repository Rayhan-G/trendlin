import type { NewsletterSubscriber } from '@/types/newsletter';

// ============================================
// PHASE 1-2: SUBSCRIBER MANAGEMENT
// ============================================

export async function createSubscriber(data: {
  email: string;
  firstName?: string;
  lastName?: string;
  source?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
}, db: any): Promise<NewsletterSubscriber> {
  const { email, firstName, lastName, source = 'website', ipAddress, userAgent, referrer } = data;
  
  // Generate tokens
  const verificationToken = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
  const unsubscribeToken = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
  
  const result = await db.prepare(`
    INSERT INTO newsletter_subscribers (
      email,
      first_name,
      last_name,
      status,
      verification_token,
      unsubscribe_token,
      source,
      ip_address,
      user_agent,
      referrer,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING *
  `).bind(
    email.toLowerCase().trim(),
    firstName || '',
    lastName || '',
    verificationToken,
    unsubscribeToken,
    source,
    ipAddress || null,
    userAgent || null,
    referrer || null
  ).first();

  // Add to default list
  await db.prepare(`
    INSERT OR IGNORE INTO newsletter_list_members (subscriber_id, list_id, subscribed, created_at, updated_at)
    VALUES (?, (SELECT id FROM newsletter_lists WHERE slug = 'general'), 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).bind(result.id).run();

  return result as NewsletterSubscriber;
}

export async function getSubscriberByEmail(email: string, db: any): Promise<NewsletterSubscriber | null> {
  const result = await db.prepare(
    'SELECT * FROM newsletter_subscribers WHERE email = ?'
  ).bind(email.toLowerCase().trim()).first();
  return result as NewsletterSubscriber | null;
}

export async function getSubscriberByToken(token: string, db: any): Promise<NewsletterSubscriber | null> {
  const result = await db.prepare(
    'SELECT * FROM newsletter_subscribers WHERE verification_token = ?'
  ).bind(token).first();
  return result as NewsletterSubscriber | null;
}

export async function getSubscriberByUnsubscribeToken(token: string, db: any): Promise<NewsletterSubscriber | null> {
  const result = await db.prepare(
    'SELECT * FROM newsletter_subscribers WHERE unsubscribe_token = ?'
  ).bind(token).first();
  return result as NewsletterSubscriber | null;
}

export async function verifySubscriber(token: string, db: any): Promise<NewsletterSubscriber | null> {
  const result = await db.prepare(`
    UPDATE newsletter_subscribers
    SET status = 'active',
        verified_at = CURRENT_TIMESTAMP,
        verification_token = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE verification_token = ? AND status = 'pending'
    RETURNING *
  `).bind(token).first();
  
  return result as NewsletterSubscriber | null;
}

export async function unsubscribeSubscriber(email: string, reason?: string, feedback?: string, db: any): Promise<NewsletterSubscriber | null> {
  const result = await db.prepare(`
    UPDATE newsletter_subscribers
    SET status = 'unsubscribed',
        unsubscribed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE email = ?
    RETURNING *
  `).bind(email.toLowerCase().trim()).first();

  if (result && reason) {
    await db.prepare(`
      INSERT INTO unsubscribe_feedback (subscriber_id, reason, feedback, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(result.id, reason, feedback || null).run();
  }

  return result as NewsletterSubscriber | null;
}

export async function getSubscribers(db: any, filters?: { status?: string; list?: string }): Promise<NewsletterSubscriber[]> {
  let query = `
    SELECT s.*,
      (SELECT COUNT(*) FROM newsletter_events ne WHERE ne.subscriber_id = s.id AND ne.type = 'open') as total_opens,
      (SELECT COUNT(*) FROM newsletter_events ne WHERE ne.subscriber_id = s.id AND ne.type = 'click') as total_clicks
    FROM newsletter_subscribers s
  `;
  
  const conditions = [];
  const values = [];
  
  if (filters?.status) {
    conditions.push('s.status = ?');
    values.push(filters.status);
  }
  
  if (filters?.list) {
    query += ` INNER JOIN newsletter_list_members nlm ON nlm.subscriber_id = s.id AND nlm.list_id = (SELECT id FROM newsletter_lists WHERE slug = ?)`;
    values.push(filters.list);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY s.created_at DESC';
  
  const results = await db.prepare(query).bind(...values).all();
  return results.results as NewsletterSubscriber[];
}

export async function getSubscriberStats(db: any) {
  const stats = await db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'unsubscribed' THEN 1 ELSE 0 END) as unsubscribed,
      SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended
    FROM newsletter_subscribers
  `).first();
  
  const today = await db.prepare(`
    SELECT 
      SUM(CASE WHEN type = 'subscribe' AND DATE(created_at) = DATE('now') THEN 1 ELSE 0 END) as subscribed_today,
      SUM(CASE WHEN type = 'unsubscribe' AND DATE(created_at) = DATE('now') THEN 1 ELSE 0 END) as unsubscribed_today
    FROM newsletter_events
  `).first();
  
  return {
    ...stats,
    subscribedToday: today.subscribed_today || 0,
    unsubscribedToday: today.unsubscribed_today || 0,
  };
}