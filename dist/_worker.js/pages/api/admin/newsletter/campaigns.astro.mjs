globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../../renderers.mjs';

async function POST({ request, locals }) {
  try {
    console.log("📝 Admin: Create campaign API called");
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
    const adminId = locals.user?.id;
    if (!adminId) {
      console.error("❌ Unauthorized: No admin user found");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized"
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const data = await request.json();
    const { subject, preview_text, content_html, list_id, status, scheduled_at } = data;
    if (!subject || !content_html) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Subject and content are required"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const campaignStatus = status || "draft";
    const result = await DB.prepare(`
        INSERT INTO newsletter_campaigns (
          subject, preview_text, content_html, list_id, status,
          scheduled_at, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `).bind(
      subject,
      preview_text || "",
      content_html,
      list_id || null,
      campaignStatus,
      scheduled_at || null,
      adminId
    ).first();
    if (!result) {
      throw new Error("Failed to create campaign");
    }
    console.log(`✅ Campaign ${result.id} created with status: ${campaignStatus}`);
    if (campaignStatus === "sending") {
      try {
        const { NewsletterQueue } = await import('../../../../chunks/queue_CtqTL1Tu.mjs');
        const queue = new NewsletterQueue(locals.runtime.env);
        await queue.enqueueCampaign(result.id);
        console.log(`✅ Campaign ${result.id} enqueued for sending`);
      } catch (queueError) {
        console.error("❌ Failed to enqueue campaign:", queueError);
        return new Response(
          JSON.stringify({
            success: true,
            id: result.id,
            message: "Campaign created but failed to start sending. Please send manually."
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
    }
    return new Response(
      JSON.stringify({
        success: true,
        id: result.id,
        message: campaignStatus === "sending" ? "Campaign is being sent!" : "Campaign created successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("❌ Create campaign error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to create campaign"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
async function GET({ locals }) {
  try {
    console.log("📋 Admin: List campaigns API called");
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
    const campaigns = await DB.prepare(`
        SELECT 
          c.*,
          (SELECT COUNT(*) FROM newsletter_queue WHERE campaign_id = c.id) as queued_count,
          (SELECT COUNT(*) FROM newsletter_queue WHERE campaign_id = c.id AND status = 'completed') as sent_count,
          (SELECT COUNT(*) FROM newsletter_queue WHERE campaign_id = c.id AND status = 'pending') as pending_count,
          (SELECT COUNT(*) FROM newsletter_queue WHERE campaign_id = c.id AND status = 'failed') as failed_count
        FROM newsletter_campaigns c
        ORDER BY c.created_at DESC
      `).all();
    return new Response(
      JSON.stringify({
        success: true,
        campaigns: campaigns.results || []
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("❌ List campaigns error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to fetch campaigns"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
async function DELETE({ request, locals }) {
  try {
    console.log("🗑️ Admin: Delete campaign API called");
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
    const adminId = locals.user?.id;
    if (!adminId) {
      console.error("❌ Unauthorized: No admin user found");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized"
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get("id") || "0");
    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Campaign ID required"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const campaign = await DB.prepare("SELECT status FROM newsletter_campaigns WHERE id = ?").bind(id).first();
    if (!campaign) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Campaign not found"
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    if (campaign.status === "sending" || campaign.status === "completed") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Cannot delete campaign that is sending or completed"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    await DB.prepare("DELETE FROM newsletter_campaigns WHERE id = ?").bind(id).run();
    console.log(`✅ Campaign ${id} deleted successfully`);
    return new Response(
      JSON.stringify({
        success: true,
        message: "Campaign deleted successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("❌ Delete campaign error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to delete campaign"
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
  DELETE,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
