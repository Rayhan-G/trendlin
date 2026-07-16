globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../renderers.mjs';

async function GET({ url, locals }) {
  try {
    console.log("🔍 Check subscriber status API called");
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
    const email = url.searchParams.get("email");
    if (!email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email is required"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const normalizedEmail = email.toLowerCase().trim();
    const subscriber = await DB.prepare("SELECT status FROM newsletter_subscribers WHERE email = ?").bind(normalizedEmail).first();
    if (!subscriber) {
      return new Response(
        JSON.stringify({
          success: true,
          status: "not_found"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        status: subscriber.status
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("❌ Check subscriber error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to check subscriber"
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
