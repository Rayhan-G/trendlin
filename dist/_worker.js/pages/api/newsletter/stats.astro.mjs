globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../renderers.mjs';

async function GET({ locals }) {
  try {
    console.log("📊 Stats API called");
    const { DB } = locals.runtime.env;
    if (!DB) {
      console.error("❌ Database not available!");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Database not available"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    console.log("✅ Database connection successful");
    const stats = await DB.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'unsubscribed' THEN 1 ELSE 0 END) as unsubscribed,
          SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended,
          SUM(CASE WHEN status = 'bounced' THEN 1 ELSE 0 END) as bounced
        FROM newsletter_subscribers
      `).first();
    const campaignStats = await DB.prepare(`
        SELECT 
          COUNT(*) as total_campaigns,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
          SUM(CASE WHEN status = 'sending' THEN 1 ELSE 0 END) as sending,
          SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as drafts,
          ROUND(AVG(CASE 
            WHEN delivered_count > 0 
            THEN CAST(opened_count AS FLOAT) / delivered_count * 100 
            ELSE NULL 
          END), 2) as avg_open_rate,
          ROUND(AVG(CASE 
            WHEN opened_count > 0 
            THEN CAST(clicked_count AS FLOAT) / opened_count * 100 
            ELSE NULL 
          END), 2) as avg_click_rate
        FROM newsletter_campaigns
      `).first();
    console.log("📊 Stats retrieved");
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          subscribers: {
            total: stats?.total || 0,
            active: stats?.active || 0,
            pending: stats?.pending || 0,
            unsubscribed: stats?.unsubscribed || 0,
            suspended: stats?.suspended || 0,
            bounced: stats?.bounced || 0
          },
          campaigns: {
            total: campaignStats?.total_campaigns || 0,
            completed: campaignStats?.completed || 0,
            scheduled: campaignStats?.scheduled || 0,
            sending: campaignStats?.sending || 0,
            drafts: campaignStats?.drafts || 0,
            avg_open_rate: campaignStats?.avg_open_rate || 0,
            avg_click_rate: campaignStats?.avg_click_rate || 0
          }
        }
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate"
        }
      }
    );
  } catch (error) {
    console.error("❌ Stats error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to get stats"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
