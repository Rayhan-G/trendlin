// /src/lib/newsletter.ts
import { getDB, prepare, prepareFirst } from './db';

// ============================================
// TYPES
// ============================================

export interface Subscriber {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  status: 'pending' | 'active' | 'unsubscribed' | 'suspended';
  verification_token: string | null;
  unsubscribe_token: string | null;
  source: string;
  ip_address: string | null;
  user_agent: string | null;
  preferences: string | null; // JSON
  metadata: string | null; // JSON
  created_at: string;
  verified_at: string | null;
  unsubscribed_at: string | null;
  updated_at: string;
}

export interface Campaign {
  id: number;
  subject: string;
  preview_text: string;
  content_html: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused' | 'cancelled';
  list_id: number | null;
  created_by: number | null;
  scheduled_at: string | null;
  sent_at: string | null;
  total_recipients: number;
  delivered_count: number;
  opened_count: number;
  unique_opens: number;
  clicked_count: number;
  unique_clicks: number;
  unsubscribed_count: number;
  bounced_count: number;
  spam_reports: number;
  template_id: number | null;
  metadata: string | null; // JSON
  created_at: string;
  updated_at: string;
}

export interface NewsletterList {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// SUBSCRIBERS
// ============================================

export async function getSubscribers(env: any, options?: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = getDB(env);
  const { status, search, limit = 50, offset = 0 } = options || {};

  let query = `SELECT * FROM newsletter_subscribers WHERE 1=1`;
  const params: any[] = [];

  if (status) {
    query += ` AND status = ?`;
    params.push(status);
  }

  if (search) {
    query += ` AND email LIKE ?`;
    params.push(`%${search}%`);
  }

  query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const result = await prepare(db, query, params);
  return result.results as Subscriber[];
}

export async function getSubscriberById(env: any, id: number) {
  const db = getDB(env);
  return await prepareFirst<Subscriber>(
    db,
    'SELECT * FROM newsletter_subscribers WHERE id = ?',
    [id]
  );
}

export async function getSubscriberByEmail(env: any, email: string) {
  const db = getDB(env);
  return await prepareFirst<Subscriber>(
    db,
    'SELECT * FROM newsletter_subscribers WHERE email = ?',
    [email]
  );
}

export async function getSubscriberByToken(env: any, token: string, type: 'verification' | 'unsubscribe') {
  const db = getDB(env);
  const column = type === 'verification' ? 'verification_token' : 'unsubscribe_token';
  return await prepareFirst<Subscriber>(
    db,
    `SELECT * FROM newsletter_subscribers WHERE ${column} = ?`,
    [token]
  );
}

export async function createSubscriber(env: any, data: {
  email: string;
  first_name?: string;
  last_name?: string;
  source?: string;
  ip_address?: string;
  user_agent?: string;
}) {
  const db = getDB(env);
  const { email, first_name = '', last_name = '', source = 'website', ip_address, user_agent } = data;

  // Generate tokens
  const verificationToken = generateToken();
  const unsubscribeToken = generateToken();

  const result = await db
    .prepare(`
      INSERT INTO newsletter_subscribers (
        email, first_name, last_name, status, 
        verification_token, unsubscribe_token, source,
        ip_address, user_agent
      ) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?)
    `)
    .bind(email, first_name, last_name, verificationToken, unsubscribeToken, source, ip_address, user_agent)
    .run();

  return {
    success: true,
    id: result.meta.last_row_id,
    verificationToken,
    unsubscribeToken
  };
}

export async function verifySubscriber(env: any, token: string) {
  const db = getDB(env);
  
  // Find subscriber with token
  const subscriber = await getSubscriberByToken(env, token, 'verification');
  
  if (!subscriber) {
    return { success: false, error: 'Invalid or expired verification token' };
  }

  if (subscriber.status !== 'pending') {
    return { success: false, error: 'Subscriber already verified' };
  }

  // Update status
  await db
    .prepare(`
      UPDATE newsletter_subscribers 
      SET status = 'active', 
          verified_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .bind(subscriber.id)
    .run();

  // Add to default list
  const defaultList = await prepareFirst<NewsletterList>(
    db,
    'SELECT id FROM newsletter_lists WHERE slug = ?',
    ['general']
  );

  if (defaultList) {
    await db
      .prepare(`
        INSERT OR IGNORE INTO newsletter_list_members (subscriber_id, list_id)
        VALUES (?, ?)
      `)
      .bind(subscriber.id, defaultList.id)
      .run();
  }

  // Log event
  await db
    .prepare(`
      INSERT INTO newsletter_events (subscriber_id, type)
      VALUES (?, 'subscribe')
    `)
    .bind(subscriber.id)
    .run();

  return { success: true, subscriber };
}

export async function unsubscribeSubscriber(env: any, token?: string, email?: string) {
  const db = getDB(env);
  let subscriber: Subscriber | null = null;

  if (token) {
    subscriber = await getSubscriberByToken(env, token, 'unsubscribe');
  } else if (email) {
    subscriber = await getSubscriberByEmail(env, email);
  }

  if (!subscriber) {
    return { success: false, error: 'Subscriber not found' };
  }

  await db
    .prepare(`
      UPDATE newsletter_subscribers 
      SET status = 'unsubscribed', 
          unsubscribed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .bind(subscriber.id)
    .run();

  await db
    .prepare(`
      INSERT INTO newsletter_events (subscriber_id, type)
      VALUES (?, 'unsubscribe')
    `)
    .bind(subscriber.id)
    .run();

  return { success: true, subscriber };
}

export async function deleteSubscriber(env: any, id: number) {
  const db = getDB(env);
  await db
    .prepare('DELETE FROM newsletter_subscribers WHERE id = ?')
    .bind(id)
    .run();
  return { success: true };
}

export async function getSubscriberStats(env: any) {
  const db = getDB(env);
  
  const stats = await prepareFirst<{
    total: number;
    active: number;
    pending: number;
    unsubscribed: number;
    suspended: number;
  }>(
    db,
    `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'unsubscribed' THEN 1 ELSE 0 END) as unsubscribed,
        SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended
      FROM newsletter_subscribers
    `
  );

  return stats;
}

// ============================================
// CAMPAIGNS
// ============================================

export async function getCampaigns(env: any, options?: {
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const db = getDB(env);
  const { status, limit = 50, offset = 0 } = options || {};

  let query = `
    SELECT 
      c.*,
      u.username as author,
      l.name as list_name,
      (SELECT COUNT(*) FROM newsletter_campaign_recipients WHERE campaign_id = c.id) as recipients,
      (SELECT COUNT(*) FROM newsletter_queue WHERE campaign_id = c.id AND status = 'pending') as queued
    FROM newsletter_campaigns c
    LEFT JOIN admins u ON c.created_by = u.id
    LEFT JOIN newsletter_lists l ON c.list_id = l.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (status) {
    query += ` AND c.status = ?`;
    params.push(status);
  }

  query += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const result = await prepare(db, query, params);
  return result.results;
}

export async function getCampaignById(env: any, id: number) {
  const db = getDB(env);
  return await prepareFirst<Campaign>(
    db,
    `SELECT * FROM newsletter_campaigns WHERE id = ?`,
    [id]
  );
}

export async function createCampaign(env: any, data: {
  subject: string;
  preview_text?: string;
  content_html: string;
  list_id?: number | null;
  status?: 'draft' | 'scheduled' | 'sending';
  scheduled_at?: string | null;
  created_by: number;
  template_id?: number | null;
  metadata?: any;
}) {
  const db = getDB(env);
  const {
    subject,
    preview_text = '',
    content_html,
    list_id = null,
    status = 'draft',
    scheduled_at = null,
    created_by,
    template_id = null,
    metadata = {}
  } = data;

  const result = await db
    .prepare(`
      INSERT INTO newsletter_campaigns (
        subject, preview_text, content_html, list_id, status,
        scheduled_at, created_by, template_id, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      subject, preview_text, content_html, list_id, status,
      scheduled_at, created_by, template_id, JSON.stringify(metadata)
    )
    .run();

  return {
    success: true,
    id: result.meta.last_row_id
  };
}

export async function updateCampaign(env: any, id: number, data: Partial<Campaign>) {
  const db = getDB(env);
  const updates: string[] = [];
  const params: any[] = [];

  const fields = ['subject', 'preview_text', 'content_html', 'list_id', 'status', 'scheduled_at', 'template_id'];
  
  for (const field of fields) {
    if (data[field as keyof Campaign] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(data[field as keyof Campaign]);
    }
  }

  if (data.metadata) {
    updates.push('metadata = ?');
    params.push(JSON.stringify(data.metadata));
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);

  await db
    .prepare(`UPDATE newsletter_campaigns SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...params)
    .run();

  return { success: true };
}

export async function deleteCampaign(env: any, id: number) {
  const db = getDB(env);
  
  // Check if campaign can be deleted
  const campaign = await getCampaignById(env, id);
  if (!campaign) {
    return { success: false, error: 'Campaign not found' };
  }

  if (campaign.status === 'sending' || campaign.status === 'completed') {
    return { success: false, error: 'Cannot delete campaign that is sending or completed' };
  }

  await db
    .prepare('DELETE FROM newsletter_campaigns WHERE id = ?')
    .bind(id)
    .run();

  return { success: true };
}

export async function getCampaignStats(env: any) {
  const db = getDB(env);
  
  const stats = await prepareFirst<{
    total_campaigns: number;
    completed: number;
    scheduled: number;
    sending: number;
    drafts: number;
    avg_open_rate: number | null;
    avg_click_rate: number | null;
  }>(
    db,
    `
      SELECT 
        COUNT(*) as total_campaigns,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
        SUM(CASE WHEN status = 'sending' THEN 1 ELSE 0 END) as sending,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as drafts,
        ROUND(AVG(opened_count * 1.0 / NULLIF(delivered_count, 0)) * 100, 2) as avg_open_rate,
        ROUND(AVG(clicked_count * 1.0 / NULLIF(opened_count, 0)) * 100, 2) as avg_click_rate
      FROM newsletter_campaigns
    `
  );

  return stats;
}

// ============================================
// NEWSLETTER LISTS
// ============================================

export async function getLists(env: any, activeOnly: boolean = true) {
  const db = getDB(env);
  const query = activeOnly 
    ? 'SELECT * FROM newsletter_lists WHERE is_active = 1 ORDER BY name'
    : 'SELECT * FROM newsletter_lists ORDER BY name';
  
  const result = await prepare(db, query);
  return result.results as NewsletterList[];
}

export async function getListById(env: any, id: number) {
  const db = getDB(env);
  return await prepareFirst<NewsletterList>(
    db,
    'SELECT * FROM newsletter_lists WHERE id = ?',
    [id]
  );
}

// ============================================
// UTILITY
// ============================================

function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// ============================================
// CAMPAIGN RECIPIENTS & QUEUE
// ============================================

export async function enqueueCampaign(env: any, campaignId: number) {
  const db = getDB(env);
  
  // Get campaign
  const campaign = await getCampaignById(env, campaignId);
  if (!campaign) {
    return { success: false, error: 'Campaign not found' };
  }

  // Get active subscribers
  const subscribers = await prepare(
    db,
    `
      SELECT 
        ns.id as subscriber_id,
        ns.email,
        ns.first_name,
        ns.last_name
      FROM newsletter_subscribers ns
      JOIN newsletter_list_members nlm ON ns.id = nlm.subscriber_id
      WHERE ns.status = 'active'
        AND nlm.subscribed = 1
        ${campaign.list_id ? `AND nlm.list_id = ${campaign.list_id}` : ''}
    `
  );

  // Enqueue each subscriber
  for (const sub of subscribers.results) {
    await db
      .prepare(`
        INSERT INTO newsletter_queue (campaign_id, subscriber_id)
        VALUES (?, ?)
      `)
      .bind(campaignId, sub.subscriber_id)
      .run();

    await db
      .prepare(`
        INSERT INTO newsletter_campaign_recipients (campaign_id, subscriber_id)
        VALUES (?, ?)
      `)
      .bind(campaignId, sub.subscriber_id)
      .run();
  }

  // Update total recipients
  await db
    .prepare(`
      UPDATE newsletter_campaigns 
      SET total_recipients = (
        SELECT COUNT(*) FROM newsletter_campaign_recipients 
        WHERE campaign_id = ?
      )
      WHERE id = ?
    `)
    .bind(campaignId, campaignId)
    .run();

  return { success: true, count: subscribers.results.length };
}

export async function processQueue(env: any, batchSize: number = 100) {
  const db = getDB(env);
  
  const jobs = await prepare(
    db,
    `
      SELECT 
        nq.id as queue_id,
        nq.campaign_id,
        nq.subscriber_id,
        nc.subject,
        nc.content_html,
        ns.email,
        ns.first_name
      FROM newsletter_queue nq
      JOIN newsletter_campaigns nc ON nq.campaign_id = nc.id
      JOIN newsletter_subscribers ns ON nq.subscriber_id = ns.id
      WHERE nq.status = 'pending'
        AND nq.attempts < nq.max_attempts
      ORDER BY nq.priority DESC, nq.created_at ASC
      LIMIT ?
    `,
    [batchSize]
  );

  let processed = 0;

  for (const job of jobs.results) {
    try {
      // Mark as processing
      await db
        .prepare(`
          UPDATE newsletter_queue 
          SET status = 'processing', 
              attempts = attempts + 1
          WHERE id = ?
        `)
        .bind(job.queue_id)
        .run();

      // TODO: Send actual email via Resend or other provider
      console.log(`[NEWSLETTER] Sending to ${job.email}: ${job.subject}`);

      // Mark as completed
      await db
        .prepare(`
          UPDATE newsletter_queue 
          SET status = 'completed', 
              processed_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `)
        .bind(job.queue_id)
        .run();

      await db
        .prepare(`
          UPDATE newsletter_campaign_recipients 
          SET status = 'sent', 
              sent_at = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
          WHERE campaign_id = ? AND subscriber_id = ?
        `)
        .bind(job.campaign_id, job.subscriber_id)
        .run();

      await db
        .prepare(`
          UPDATE newsletter_campaigns 
          SET delivered_count = delivered_count + 1
          WHERE id = ?
        `)
        .bind(job.campaign_id)
        .run();

      processed++;

    } catch (error) {
      console.error(`Error processing job ${job.queue_id}:`, error);
      
      await db
        .prepare(`
          UPDATE newsletter_queue 
          SET status = 'failed',
              error_message = ?,
              processed_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `)
        .bind(error.message || 'Unknown error', job.queue_id)
        .run();
    }
  }

  return { processed };
}