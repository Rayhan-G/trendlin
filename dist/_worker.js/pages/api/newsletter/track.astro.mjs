globalThis.process ??= {}; globalThis.process.env ??= {};
import { g as getDB } from '../../../chunks/db_CaYABffz.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ url, locals }) => {
  try {
    const env = locals.env;
    const db = getDB(env);
    const campaignId = url.searchParams.get("campaign");
    const subscriberId = url.searchParams.get("subscriber");
    const open = url.searchParams.get("open");
    if (open === "true" && campaignId && subscriberId) {
      await db.prepare(`
          UPDATE newsletter_campaign_recipients 
          SET opened_count = opened_count + 1,
              opened_at = CASE 
                WHEN opened_at IS NULL THEN CURRENT_TIMESTAMP 
                ELSE opened_at 
              END,
              status = 'opened',
              updated_at = CURRENT_TIMESTAMP
          WHERE campaign_id = ? AND subscriber_id = ?
        `).bind(parseInt(campaignId), parseInt(subscriberId)).run();
      await db.prepare(`
          UPDATE newsletter_campaigns 
          SET opened_count = opened_count + 1,
              unique_opens = (
                SELECT COUNT(DISTINCT subscriber_id) 
                FROM newsletter_campaign_recipients 
                WHERE campaign_id = ? AND opened_count > 0
              ),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(parseInt(campaignId), parseInt(campaignId)).run();
      await db.prepare(`
          INSERT INTO newsletter_events (subscriber_id, campaign_id, type, ip_address, user_agent)
          VALUES (?, ?, 'open', ?, ?)
        `).bind(
        parseInt(subscriberId),
        parseInt(campaignId),
        request.headers.get("cf-connecting-ip") || "",
        request.headers.get("user-agent") || ""
      ).run();
    }
    const pixel = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      "base64"
    );
    return new Response(pixel, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (error) {
    console.error("Tracking error:", error);
    const pixel = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      "base64"
    );
    return new Response(pixel, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache, no-store, must-revalidate"
      }
    });
  }
};
const POST = async ({ request: request2, locals }) => {
  try {
    const { campaignId, subscriberId, url: targetUrl } = await request2.json();
    const env = locals.env;
    const db = getDB(env);
    if (!campaignId || !subscriberId || !targetUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    await db.prepare(`
        UPDATE newsletter_campaign_recipients 
        SET clicked_count = clicked_count + 1,
            clicked_at = CASE 
              WHEN clicked_at IS NULL THEN CURRENT_TIMESTAMP 
              ELSE clicked_at 
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE campaign_id = ? AND subscriber_id = ?
      `).bind(parseInt(campaignId), parseInt(subscriberId)).run();
    await db.prepare(`
        UPDATE newsletter_campaigns 
        SET clicked_count = clicked_count + 1,
            unique_clicks = (
              SELECT COUNT(DISTINCT subscriber_id) 
              FROM newsletter_campaign_recipients 
              WHERE campaign_id = ? AND clicked_count > 0
            ),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(parseInt(campaignId), parseInt(campaignId)).run();
    await db.prepare(`
        INSERT INTO newsletter_events (subscriber_id, campaign_id, type, url, ip_address, user_agent)
        VALUES (?, ?, 'click', ?, ?, ?)
      `).bind(
      parseInt(subscriberId),
      parseInt(campaignId),
      targetUrl,
      request2.headers.get("cf-connecting-ip") || "",
      request2.headers.get("user-agent") || ""
    ).run();
    return new Response(
      JSON.stringify({
        success: true,
        redirectUrl: targetUrl
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Click tracking error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to track click"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
