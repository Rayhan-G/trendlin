globalThis.process ??= {}; globalThis.process.env ??= {};
import { g as getDB } from '../../../chunks/db_CaYABffz.mjs';
import { g as getCurrentUser } from '../../../chunks/auth_Db9O8NHf.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, locals }) => {
  try {
    const user = await getCurrentUser(request, locals.env.DB);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const { subject, preview_text, content_html, list_id, scheduled_at } = await request.json();
    const env = locals.env;
    const db = getDB(env);
    if (!subject || !content_html) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Subject and content are required"
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    let status = "draft";
    if (scheduled_at) {
      status = "scheduled";
    }
    const result = await db.prepare(`
        INSERT INTO newsletter_campaigns (
          subject,
          preview_text,
          content_html,
          list_id,
          status,
          scheduled_at,
          created_by,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `).bind(
      subject,
      preview_text || "",
      content_html,
      list_id || null,
      status,
      scheduled_at || null,
      user.id
    ).first();
    if (!result) {
      throw new Error("Failed to create campaign");
    }
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: result.id,
          subject,
          status,
          scheduled_at: scheduled_at || null,
          message: status === "scheduled" ? "Campaign scheduled successfully" : "Campaign created as draft"
        }
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Create campaign error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to create campaign"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
