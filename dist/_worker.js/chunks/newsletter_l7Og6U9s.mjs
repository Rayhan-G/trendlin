globalThis.process ??= {}; globalThis.process.env ??= {};
import { g as getDB, p as prepareFirst, a as prepare } from './db_CaYABffz.mjs';

async function getSubscribers(env, options) {
  const db = getDB(env);
  const { status, search, limit = 50, offset = 0 } = options || {};
  let query = `SELECT * FROM newsletter_subscribers WHERE 1=1`;
  const params = [];
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
  return result.results;
}
async function deleteSubscriber(env, id) {
  const db = getDB(env);
  await db.prepare("DELETE FROM newsletter_subscribers WHERE id = ?").bind(id).run();
  return { success: true };
}
async function getSubscriberStats(env) {
  const db = getDB(env);
  const stats = await prepareFirst(
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
async function getCampaigns(env, options) {
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
  const params = [];
  if (status) {
    query += ` AND c.status = ?`;
    params.push(status);
  }
  query += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);
  const result = await prepare(db, query, params);
  return result.results;
}
async function getCampaignById(env, id) {
  const db = getDB(env);
  return await prepareFirst(
    db,
    `SELECT * FROM newsletter_campaigns WHERE id = ?`,
    [id]
  );
}
async function createCampaign(env, data) {
  const db = getDB(env);
  const {
    subject,
    preview_text = "",
    content_html,
    list_id = null,
    status = "draft",
    scheduled_at = null,
    created_by,
    template_id = null,
    metadata = {}
  } = data;
  const result = await db.prepare(`
      INSERT INTO newsletter_campaigns (
        subject, preview_text, content_html, list_id, status,
        scheduled_at, created_by, template_id, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
    subject,
    preview_text,
    content_html,
    list_id,
    status,
    scheduled_at,
    created_by,
    template_id,
    JSON.stringify(metadata)
  ).run();
  return {
    success: true,
    id: result.meta.last_row_id
  };
}
async function deleteCampaign(env, id) {
  const db = getDB(env);
  const campaign = await getCampaignById(env, id);
  if (!campaign) {
    return { success: false, error: "Campaign not found" };
  }
  if (campaign.status === "sending" || campaign.status === "completed") {
    return { success: false, error: "Cannot delete campaign that is sending or completed" };
  }
  await db.prepare("DELETE FROM newsletter_campaigns WHERE id = ?").bind(id).run();
  return { success: true };
}
async function getLists(env, activeOnly = true) {
  const db = getDB(env);
  const query = activeOnly ? "SELECT * FROM newsletter_lists WHERE is_active = 1 ORDER BY name" : "SELECT * FROM newsletter_lists ORDER BY name";
  const result = await prepare(db, query);
  return result.results;
}
async function enqueueCampaign(env, campaignId) {
  const db = getDB(env);
  const campaign = await getCampaignById(env, campaignId);
  if (!campaign) {
    return { success: false, error: "Campaign not found" };
  }
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
        ${campaign.list_id ? `AND nlm.list_id = ${campaign.list_id}` : ""}
    `
  );
  for (const sub of subscribers.results) {
    await db.prepare(`
        INSERT OR IGNORE INTO newsletter_queue (campaign_id, subscriber_id)
        VALUES (?, ?)
      `).bind(campaignId, sub.subscriber_id).run();
    await db.prepare(`
        INSERT OR IGNORE INTO newsletter_campaign_recipients (campaign_id, subscriber_id)
        VALUES (?, ?)
      `).bind(campaignId, sub.subscriber_id).run();
  }
  await db.prepare(`
      UPDATE newsletter_campaigns 
      SET total_recipients = (
        SELECT COUNT(*) FROM newsletter_campaign_recipients 
        WHERE campaign_id = ?
      )
      WHERE id = ?
    `).bind(campaignId, campaignId).run();
  return { success: true, count: subscribers.results.length };
}

export { getCampaigns as a, getLists as b, createCampaign as c, deleteCampaign as d, enqueueCampaign as e, deleteSubscriber as f, getSubscriberStats as g, getSubscribers as h };
