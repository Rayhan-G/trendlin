// ============================================
// NEWSLETTER LIBRARY - PRODUCTION READY
// Cloudflare Pages Compatible
// ============================================

import { getDB, prepare, prepareFirst, execute, isDbValid } from './db';
import { EmailService } from './email-service';

// ============================================
// TYPES
// ============================================

export interface Subscriber {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  status: 'pending' | 'active' | 'unsubscribed' | 'suspended' | 'bounced';
  verification_token: string | null;
  unsubscribe_token: string | null;
  source: string;
  ip_address: string | null;
  user_agent: string | null;
  preferences: string | null;
  metadata: string | null;
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
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused' | 'cancelled' | 'failed';
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
  metadata: string | null;
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

export interface QueueJob {
  id: number;
  campaign_id: number;
  subscriber_id: number;
  status: string;
  attempts: number;
  max_attempts: number;
  error_message: string | null;
  created_at: string;
}

// ============================================
// UTILITY
// ============================================

function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

function getSiteUrl(env: any): string {
  return env?.SITE_URL || env?.SITE || 'https://trendlin.com';
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
    [email.toLowerCase().trim()]
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

  const normalizedEmail = email.toLowerCase().trim();
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
    .bind(normalizedEmail, first_name, last_name, verificationToken, unsubscribeToken, source, ip_address, user_agent)
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
      .bind(result.meta.last_row_id, defaultList.id)
      .run();
  }

  return {
    success: true,
    id: result.meta.last_row_id,
    verificationToken,
    unsubscribeToken
  };
}

export async function verifySubscriber(env: any, token: string) {
  const db = getDB(env);
  
  const subscriber = await getSubscriberByToken(env, token, 'verification');
  
  if (!subscriber) {
    return { success: false, error: 'Invalid or expired verification token' };
  }

  if (subscriber.status !== 'pending') {
    return { success: false, error: 'Subscriber already verified' };
  }

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

  // Ensure they're in the default list
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

  await db
    .prepare(`
      INSERT INTO newsletter_events (subscriber_id, type)
      VALUES (?, 'confirm')
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

  if (subscriber.status === 'unsubscribed') {
    return { success: true, message: 'Already unsubscribed', subscriber };
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
    bounced: number;
  }>(
    db,
    `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'unsubscribed' THEN 1 ELSE 0 END) as unsubscribed,
        SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended,
        SUM(CASE WHEN status = 'bounced' THEN 1 ELSE 0 END) as bounced
      FROM newsletter_subscribers
    `
  );

  return stats;
}

// ============================================
// SUBSCRIBER PREFERENCES
// ============================================

export async function updateSubscriberPreferences(env: any, token: string, preferences: any) {
  const db = getDB(env);
  
  const subscriber = await getSubscriberByToken(env, token, 'unsubscribe');
  
  if (!subscriber) {
    return { success: false, error: 'Subscriber not found' };
  }

  await db
    .prepare(`
      UPDATE newsletter_subscribers 
      SET preferences = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .bind(JSON.stringify(preferences), subscriber.id)
    .run();

  return { success: true, subscriber };
}

export async function getSubscriberByUnsubscribeToken(env: any, token: string) {
  return await getSubscriberByToken(env, token, 'unsubscribe');
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
      (SELECT COUNT(*) FROM newsletter_campaign_recipients WHERE campaign_id = c.id) as recipients,
      (SELECT COUNT(*) FROM newsletter_queue WHERE campaign_id = c.id AND status = 'pending') as queued,
      (SELECT COUNT(*) FROM newsletter_queue WHERE campaign_id = c.id AND status = 'completed') as sent_count
    FROM newsletter_campaigns c
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
    failed: number;
    avg_open_rate: number | null;
    avg_click_rate: number | null;
    avg_unsubscribe_rate: number | null;
  }>(
    db,
    `
      SELECT 
        COUNT(*) as total_campaigns,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
        SUM(CASE WHEN status = 'sending' THEN 1 ELSE 0 END) as sending,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as drafts,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        ROUND(AVG(CASE WHEN delivered_count > 0 THEN opened_count * 1.0 / delivered_count * 100 ELSE NULL END), 2) as avg_open_rate,
        ROUND(AVG(CASE WHEN opened_count > 0 THEN clicked_count * 1.0 / opened_count * 100 ELSE NULL END), 2) as avg_click_rate,
        ROUND(AVG(CASE WHEN delivered_count > 0 THEN unsubscribed_count * 1.0 / delivered_count * 100 ELSE NULL END), 2) as avg_unsubscribe_rate
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
// CAMPAIGN RECIPIENTS & QUEUE
// ============================================

export async function enqueueCampaign(env: any, campaignId: number) {
  const db = getDB(env);
  
  const campaign = await getCampaignById(env, campaignId);
  if (!campaign) {
    return { success: false, error: 'Campaign not found' };
  }

  // Get active subscribers in chunks
  const CHUNK_SIZE = 1000;
  let offset = 0;
  let totalEnqueued = 0;

  while (true) {
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
        ORDER BY ns.id
        LIMIT ? OFFSET ?
      `,
      [CHUNK_SIZE, offset]
    );

    if (!subscribers.results || subscribers.results.length === 0) {
      break;
    }

    // Bulk insert queue entries
    const queueValues = subscribers.results.map((sub: any) => {
      return `(${campaignId}, ${sub.subscriber_id}, 0, 5, 0)`;
    }).join(',');

    if (queueValues) {
      await db
        .prepare(`
          INSERT OR IGNORE INTO newsletter_queue 
          (campaign_id, subscriber_id, priority, max_attempts, attempts)
          VALUES ${queueValues}
        `)
        .run();

      // Bulk insert recipients
      const recipientValues = subscribers.results.map((sub: any) => {
        return `(${campaignId}, ${sub.subscriber_id}, 'pending')`;
      }).join(',');

      if (recipientValues) {
        await db
          .prepare(`
            INSERT OR IGNORE INTO newsletter_campaign_recipients 
            (campaign_id, subscriber_id, status)
            VALUES ${recipientValues}
          `)
          .run();
      }

      totalEnqueued += subscribers.results.length;
      offset += CHUNK_SIZE;
    }
  }

  // Update total recipients
  await db
    .prepare(`
      UPDATE newsletter_campaigns 
      SET total_recipients = ?
      WHERE id = ?
    `)
    .bind(totalEnqueued, campaignId)
    .run();

  return { success: true, count: totalEnqueued };
}

export async function processQueue(env: any, batchSize: number = 100) {
  const db = getDB(env);
  
  // Get RESEND_API_KEY
  const apiKey = env?.RESEND_API_KEY;
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY not available for queue processing');
    return { processed: 0, error: 'RESEND_API_KEY not configured' };
  }

  const emailService = new EmailService(apiKey);
  
  const jobs = await prepare(
    db,
    `
      SELECT 
        nq.id as queue_id,
        nq.campaign_id,
        nq.subscriber_id,
        nq.attempts,
        nc.subject,
        nc.content_html,
        ns.email,
        ns.first_name,
        ns.unsubscribe_token
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
  let successful = 0;
  let failed = 0;

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

      // Send email using EmailService
      const siteUrl = getSiteUrl(env);
      const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${job.unsubscribe_token}`;
      
      await emailService.sendNewsletterDigest({
        to: job.email,
        subject: job.subject,
        title: job.subject,
        content: job.content_html,
        unsubscribeUrl
      });

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

      successful++;
      processed++;

    } catch (error: any) {
      console.error(`❌ Error processing job ${job.queue_id}:`, error);
      
      const isBounce = error.message?.toLowerCase().includes('bounce') || 
                      error.message?.toLowerCase().includes('undelivered');
      
      const status = isBounce ? 'bounced' : 'failed';
      
      await db
        .prepare(`
          UPDATE newsletter_queue 
          SET status = ?,
              error_message = ?,
              processed_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `)
        .bind(status, error.message || 'Unknown error', job.queue_id)
        .run();

      failed++;
    }
  }

  return { processed, successful, failed };
}

// ============================================
// QUEUE MANAGEMENT
// ============================================

export async function getQueueStats(env: any) {
  const db = getDB(env);
  
  return await prepareFirst<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    bounced: number;
  }>(
    db,
    `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'bounced' THEN 1 ELSE 0 END) as bounced
      FROM newsletter_queue
    `
  );
}

export async function retryFailedJobs(env: any, campaignId?: number) {
  const db = getDB(env);
  
  let query = `
    UPDATE newsletter_queue 
    SET status = 'pending',
        attempts = 0,
        error_message = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE status IN ('failed', 'bounced')
      AND attempts < max_attempts
  `;
  const params: any[] = [];

  if (campaignId) {
    query += ` AND campaign_id = ?`;
    params.push(campaignId);
  }

  const result = await db
    .prepare(query)
    .bind(...params)
    .run();

  return { success: true, updated: result.meta?.changes || 0 };
}