globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../renderers.mjs';

async function POST({ request, locals }) {
  try {
    console.log("📝 Save preferences API called");
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
    const { email, token, categories } = await request.json();
    if (!email || !token || !categories) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email, token, and categories are required"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    if (!Array.isArray(categories) || categories.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Categories must be a non-empty array"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    console.log("📝 Save preferences for:", email);
    const subscriber = await DB.prepare("SELECT * FROM newsletter_subscribers WHERE unsubscribe_token = ? AND email = ?").bind(token, email.toLowerCase().trim()).first();
    if (!subscriber) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Subscriber not found"
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const preferences = {
      categories,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await DB.prepare(`
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
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("❌ Save preferences error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to save preferences"
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
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
