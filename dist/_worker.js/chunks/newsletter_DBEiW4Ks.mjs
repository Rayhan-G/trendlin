globalThis.process ??= {}; globalThis.process.env ??= {};
async function getSubscriberByEmail(email, db) {
  const result = await db.prepare(
    "SELECT * FROM subscribers WHERE email = ?"
  ).bind(email.toLowerCase().trim()).first();
  return result;
}
async function getSubscriberByToken(token, db) {
  const result = await db.prepare(
    "SELECT * FROM subscribers WHERE verification_token = ?"
  ).bind(token).first();
  return result;
}
async function createSubscriber(data, db) {
  const { email, firstName, categories = ["general"], source = "website", ipAddress, userAgent, referrer } = data;
  const verificationToken = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
  const unsubscribeToken = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
  const categoriesStr = categories.join(",");
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
    firstName || "",
    categoriesStr,
    verificationToken,
    unsubscribeToken,
    source,
    ipAddress || null,
    userAgent || null,
    referrer || null
  ).first();
  if (result && categories.length > 0 && categories[0] !== "general") {
    const placeholders = categories.map(() => "(?, ?, 1)").join(", ");
    const values = categories.flatMap((cat) => [result.id, cat]);
    await db.prepare(`
      INSERT INTO newsletter_preferences (subscriber_id, category, subscribed)
      VALUES ${placeholders}
    `).bind(...values).run();
  }
  return result;
}
async function verifySubscriber(token, db) {
  const result = await db.prepare(`
    UPDATE subscribers 
    SET status = 'active',
        verified_at = CURRENT_TIMESTAMP,
        verification_token = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE verification_token = ?
    RETURNING *
  `).bind(token).first();
  return result;
}
async function unsubscribeSubscriber(token, reason, feedback, db) {
  const subscriber = await db.prepare(
    "SELECT * FROM subscribers WHERE unsubscribe_token = ?"
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
  return result;
}
async function getSubscriberStats(db) {
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
async function updateSubscriberPreferences(subscriberId, categories, db) {
  await db.prepare(`
    UPDATE subscribers 
    SET categories = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(categories.join(","), subscriberId).run();
  await db.prepare(`
    DELETE FROM newsletter_preferences WHERE subscriber_id = ?
  `).bind(subscriberId).run();
  if (categories.length > 0 && categories[0] !== "general") {
    const placeholders = categories.map(() => "(?, ?, 1)").join(", ");
    const values = categories.flatMap((cat) => [subscriberId, cat]);
    await db.prepare(`
      INSERT INTO newsletter_preferences (subscriber_id, category, subscribed)
      VALUES ${placeholders}
    `).bind(...values).run();
  }
  return { subscriberId, categories };
}
async function createCampaign(data, db) {
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
    data.category || "general",
    data.scheduledAt ? "scheduled" : "draft",
    data.scheduledAt || null,
    data.createdBy || null
  ).first();
  return result;
}
async function getCampaigns(db) {
  const results = await db.prepare(`
    SELECT * FROM newsletter_campaigns 
    ORDER BY created_at DESC
  `).all();
  return results.results;
}
async function getCampaignById(id, db) {
  const result = await db.prepare(
    "SELECT * FROM newsletter_campaigns WHERE id = ?"
  ).bind(id).first();
  return result;
}
async function updateCampaignStatus(id, status, db) {
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
async function createDeliveries(campaignId, subscriberIds, db) {
  if (subscriberIds.length === 0) return;
  const placeholders = subscriberIds.map(() => "(?, ?, ?)").join(", ");
  const values = subscriberIds.flatMap((id) => [campaignId, id, "queued"]);
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
async function getPendingDeliveries(batchSize = 100, db) {
  const results = await db.prepare(`
    SELECT d.*, s.email, s.first_name, s.unsubscribe_token 
    FROM newsletter_deliveries d
    JOIN subscribers s ON s.id = d.subscriber_id
    WHERE d.status = 'queued'
    LIMIT ?
  `).bind(batchSize).all();
  return results.results;
}
async function updateDeliveryStatus(id, status, db) {
  await db.prepare(`
    UPDATE newsletter_deliveries 
    SET status = ?,
        sent_at = CASE WHEN ? IN ('sent', 'opened', 'clicked') THEN COALESCE(sent_at, CURRENT_TIMESTAMP) ELSE sent_at END,
        opened_at = CASE WHEN ? = 'opened' THEN CURRENT_TIMESTAMP ELSE opened_at END,
        clicked_at = CASE WHEN ? = 'clicked' THEN CURRENT_TIMESTAMP ELSE clicked_at END
    WHERE id = ?
  `).bind(status, status, status, status, id).run();
}

export { getCampaigns as a, createDeliveries as b, createCampaign as c, getPendingDeliveries as d, updateDeliveryStatus as e, getSubscriberByEmail as f, getCampaignById as g, updateSubscriberPreferences as h, getSubscriberStats as i, createSubscriber as j, unsubscribeSubscriber as k, getSubscriberByToken as l, updateCampaignStatus as u, verifySubscriber as v };
