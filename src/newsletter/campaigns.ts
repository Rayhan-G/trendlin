import type { NewsletterCampaign, CampaignBlock } from '@/types/newsletter';

// ============================================
// PHASE 4-6: CAMPAIGN CRUD
// ============================================

export async function createCampaign(data: {
  subject: string;
  previewText?: string;
  contentHtml: string;
  listId?: number;
  templateId?: number;
  createdBy?: number;
  metadata?: Record<string, any>;
}, db: any): Promise<NewsletterCampaign> {
  const result = await db.prepare(`
    INSERT INTO newsletter_campaigns (
      subject,
      preview_text,
      content_html,
      status,
      list_id,
      template_id,
      created_by,
      metadata,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, 'draft', ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING *
  `).bind(
    data.subject,
    data.previewText || '',
    data.contentHtml,
    data.listId || null,
    data.templateId || null,
    data.createdBy || null,
    JSON.stringify(data.metadata || {})
  ).first();
  
  return result as NewsletterCampaign;
}

export async function getCampaign(id: number, db: any): Promise<NewsletterCampaign | null> {
  const result = await db.prepare(
    `SELECT c.*,
      (SELECT COUNT(*) FROM newsletter_campaign_recipients WHERE campaign_id = c.id) as total_recipients,
      (SELECT COUNT(*) FROM newsletter_campaign_recipients WHERE campaign_id = c.id AND status = 'sent') as delivered_count
    FROM newsletter_campaigns c
    WHERE c.id = ?`
  ).bind(id).first();
  return result as NewsletterCampaign | null;
}

export async function getCampaigns(db: any, options?: { status?: string; limit?: number }): Promise<NewsletterCampaign[]> {
  let query = `
    SELECT c.*,
      (SELECT COUNT(*) FROM newsletter_campaign_recipients WHERE campaign_id = c.id) as total_recipients
    FROM newsletter_campaigns c
  `;
  
  const conditions = [];
  const values = [];
  
  if (options?.status) {
    conditions.push('c.status = ?');
    values.push(options.status);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY c.created_at DESC';
  
  if (options?.limit) {
    query += ` LIMIT ${options.limit}`;
  }
  
  const results = await db.prepare(query).bind(...values).all();
  return results.results as NewsletterCampaign[];
}

export async function updateCampaign(id: number, data: Partial<NewsletterCampaign>, db: any): Promise<NewsletterCampaign> {
  const fields = [];
  const values = [];
  
  const fieldMap: Record<string, string> = {
    subject: 'subject',
    previewText: 'preview_text',
    contentHtml: 'content_html',
    status: 'status',
    listId: 'list_id',
    scheduledAt: 'scheduled_at',
    templateId: 'template_id',
    metadata: 'metadata',
  };
  
  for (const [key, value] of Object.entries(data)) {
    if (fieldMap[key] && value !== undefined) {
      fields.push(`${fieldMap[key]} = ?`);
      values.push(key === 'metadata' ? JSON.stringify(value) : value);
    }
  }
  
  if (fields.length === 0) {
    throw new Error('No fields to update');
  }
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  
  const result = await db.prepare(`
    UPDATE newsletter_campaigns
    SET ${fields.join(', ')}
    WHERE id = ?
    RETURNING *
  `).bind(...values).first();
  
  return result as NewsletterCampaign;
}

export async function scheduleCampaign(id: number, scheduledAt: string, db: any): Promise<NewsletterCampaign> {
  return updateCampaign(id, { 
    status: 'scheduled', 
    scheduledAt 
  }, db);
}

export async function deleteCampaign(id: number, db: any): Promise<void> {
  await db.prepare(
    'DELETE FROM newsletter_campaigns WHERE id = ? AND status = ?'
  ).bind(id, 'draft').run();
}

export async function addCampaignBlock(block: {
  campaignId: number;
  type: string;
  content: string;
  orderIndex?: number;
  metadata?: Record<string, any>;
}, db: any): Promise<CampaignBlock> {
  const result = await db.prepare(`
    INSERT INTO newsletter_campaign_blocks (
      campaign_id,
      type,
      content,
      order_index,
      metadata,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    RETURNING *
  `).bind(
    block.campaignId,
    block.type,
    block.content,
    block.orderIndex || 0,
    JSON.stringify(block.metadata || {})
  ).first();
  
  return result as CampaignBlock;
}

export async function getCampaignBlocks(campaignId: number, db: any): Promise<CampaignBlock[]> {
  const results = await db.prepare(`
    SELECT * FROM newsletter_campaign_blocks
    WHERE campaign_id = ?
    ORDER BY order_index ASC
  `).bind(campaignId).all();
  return results.results as CampaignBlock[];
}