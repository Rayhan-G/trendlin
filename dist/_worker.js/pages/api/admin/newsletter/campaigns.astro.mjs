globalThis.process ??= {}; globalThis.process.env ??= {};
import { d as deleteCampaign, a as getCampaigns, c as createCampaign, e as enqueueCampaign } from '../../../../chunks/newsletter_DvXc4akD.mjs';
export { renderers } from '../../../../renderers.mjs';

const POST = async ({ request, locals }) => {
  try {
    const env = locals.env;
    const adminId = locals.user?.id;
    if (!adminId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }
    const data = await request.json();
    const { subject, preview_text, content_html, list_id, status, scheduled_at } = data;
    if (!subject || !content_html) {
      return new Response(
        JSON.stringify({ error: "Subject and content are required" }),
        { status: 400 }
      );
    }
    const result = await createCampaign(env, {
      subject,
      preview_text,
      content_html,
      list_id,
      status: status || "draft",
      scheduled_at,
      created_by: adminId
    });
    if (status === "sending" && result.id) {
      await enqueueCampaign(env, result.id);
      await env.DB.prepare(`
          UPDATE newsletter_campaigns 
          SET status = 'sending'
          WHERE id = ?
        `).bind(result.id).run();
    }
    return new Response(
      JSON.stringify({
        success: true,
        id: result.id,
        message: status === "sending" ? "Campaign is being sent!" : "Campaign created successfully"
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating campaign:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create campaign" }),
      { status: 500 }
    );
  }
};
const GET = async ({ locals }) => {
  try {
    const env = locals.env;
    const campaigns = await getCampaigns(env);
    return new Response(
      JSON.stringify({
        success: true,
        campaigns
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch campaigns" }),
      { status: 500 }
    );
  }
};
const DELETE = async ({ request, locals }) => {
  try {
    const env = locals.env;
    const adminId = locals.user?.id;
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get("id") || "0");
    if (!adminId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }
    if (!id) {
      return new Response(
        JSON.stringify({ error: "Campaign ID required" }),
        { status: 400 }
      );
    }
    const result = await deleteCampaign(env, id);
    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 400 }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        message: "Campaign deleted successfully"
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete campaign" }),
      { status: 500 }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
