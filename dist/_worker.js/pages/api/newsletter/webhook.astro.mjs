globalThis.process ??= {}; globalThis.process.env ??= {};
import { g as getDB } from '../../../chunks/db_Bt5ss5wz.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, locals }) => {
  try {
    const payload = await request.json();
    const db = getDB(locals.env);
    const { type, data } = payload;
    const campaignId = parseInt(data?.headers?.["x-campaign-id"] || "0");
    const subscriberId = parseInt(data?.headers?.["x-subscriber-id"] || "0");
    if (!subscriberId || !campaignId) {
      return new Response("Missing subscriber or campaign ID", { status: 400 });
    }
    switch (type) {
      case "email.delivered":
        await handleDelivered(db, subscriberId, campaignId);
        break;
      case "email.opened":
        await handleOpened(db, subscriberId, campaignId);
        break;
      case "email.clicked":
        await handleClicked(db, subscriberId, campaignId, data?.url);
        break;
      case "email.bounced":
        await handleBounced(db, subscriberId, campaignId, data?.reason);
        break;
      case "email.complained":
        await handleComplained(db, subscriberId, campaignId);
        break;
      default:
        console.log("Unknown webhook event:", type);
    }
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Error processing webhook", { status: 500 });
  }
};
async function handleDelivered(db, subscriberId, campaignId) {
  await db.prepare(`
      UPDATE newsletter_campaign_recipients 
      SET status = 'sent', 
          sent_at = CURRENT_TIMESTAMP
      WHERE subscriber_id = ? AND campaign_id = ?
    `).bind(subscriberId, campaignId).run();
  await db.prepare(`
      INSERT INTO newsletter_events (subscriber_id, campaign_id, type)
      VALUES (?, ?, 'delivered')
    `).bind(subscriberId, campaignId).run();
}
async function handleOpened(db, subscriberId, campaignId) {
  await db.prepare(`
      UPDATE newsletter_campaign_recipients 
      SET status = 'opened', 
          opened_at = CURRENT_TIMESTAMP
      WHERE subscriber_id = ? AND campaign_id = ?
    `).bind(subscriberId, campaignId).run();
  await db.prepare(`
      UPDATE newsletter_campaigns 
      SET opened_count = opened_count + 1,
          unique_opens = unique_opens + 1
      WHERE id = ?
    `).bind(campaignId).run();
  await db.prepare(`
      INSERT INTO newsletter_events (subscriber_id, campaign_id, type)
      VALUES (?, ?, 'open')
    `).bind(subscriberId, campaignId).run();
  await db.prepare(`
      UPDATE newsletter_subscribers 
      SET metadata = json_set(
        COALESCE(metadata, '{}'), 
        '$.last_open', 
        CURRENT_TIMESTAMP
      )
      WHERE id = ?
    `).bind(subscriberId).run();
}
async function handleClicked(db, subscriberId, campaignId, url) {
  await db.prepare(`
      UPDATE newsletter_campaign_recipients 
      SET status = 'clicked', 
          clicked_at = CURRENT_TIMESTAMP,
          clicked_url = ?
      WHERE subscriber_id = ? AND campaign_id = ?
    `).bind(url, subscriberId, campaignId).run();
  await db.prepare(`
      UPDATE newsletter_campaigns 
      SET clicked_count = clicked_count + 1,
          unique_clicks = unique_clicks + 1
      WHERE id = ?
    `).bind(campaignId).run();
  await db.prepare(`
      INSERT INTO newsletter_events (subscriber_id, campaign_id, type, url)
      VALUES (?, ?, 'click', ?)
    `).bind(subscriberId, campaignId, url).run();
  await db.prepare(`
      UPDATE newsletter_subscribers 
      SET metadata = json_set(
        COALESCE(metadata, '{}'), 
        '$.last_click', 
        CURRENT_TIMESTAMP
      )
      WHERE id = ?
    `).bind(subscriberId).run();
}
async function handleBounced(db, subscriberId, campaignId, reason) {
  await db.prepare(`
      UPDATE newsletter_campaign_recipients 
      SET status = 'bounced', 
          error_message = ?
      WHERE subscriber_id = ? AND campaign_id = ?
    `).bind(reason, subscriberId, campaignId).run();
  await db.prepare(`
      UPDATE newsletter_campaigns 
      SET bounced_count = bounced_count + 1
      WHERE id = ?
    `).bind(campaignId).run();
  await db.prepare(`
      INSERT INTO newsletter_events (subscriber_id, campaign_id, type, metadata)
      VALUES (?, ?, 'bounce', ?)
    `).bind(subscriberId, campaignId, JSON.stringify({ reason })).run();
}
async function handleComplained(db, subscriberId, campaignId) {
  await db.prepare(`
      UPDATE newsletter_campaign_recipients 
      SET status = 'unsubscribed'
      WHERE subscriber_id = ? AND campaign_id = ?
    `).bind(subscriberId, campaignId).run();
  await db.prepare(`
      UPDATE newsletter_campaigns 
      SET spam_reports = spam_reports + 1
      WHERE id = ?
    `).bind(campaignId).run();
  await db.prepare(`
      INSERT INTO newsletter_events (subscriber_id, campaign_id, type)
      VALUES (?, ?, 'complaint')
    `).bind(subscriberId, campaignId).run();
  await db.prepare(`
      UPDATE newsletter_subscribers 
      SET status = 'suspended'
      WHERE id = ?
    `).bind(subscriberId).run();
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
