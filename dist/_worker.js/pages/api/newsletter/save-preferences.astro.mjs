globalThis.process ??= {}; globalThis.process.env ??= {};
import { g as getDB, p as prepareFirst } from '../../../chunks/db_CaYABffz.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, locals }) => {
  try {
    const { email, token, categories } = await request.json();
    const env = locals.env;
    const db = getDB(env);
    console.log("📝 Save preferences for:", email);
    if (!email || !token || !categories) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email, token, and categories are required"
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const subscriber = await prepareFirst(
      db,
      "SELECT * FROM newsletter_subscribers WHERE unsubscribe_token = ? AND email = ?",
      [token, email.toLowerCase().trim()]
    );
    if (!subscriber) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Subscriber not found"
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    const preferences = {
      categories,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await db.prepare(`
        UPDATE newsletter_subscribers 
        SET preferences = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(JSON.stringify(preferences), subscriber.id).run();
    console.log("✅ Preferences saved for:", email);
    return new Response(
      JSON.stringify({
        success: true,
        message: "Preferences updated successfully",
        data: {
          email: subscriber.email,
          categories
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Save preferences error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to save preferences"
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
