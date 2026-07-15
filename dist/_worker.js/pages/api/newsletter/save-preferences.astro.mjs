globalThis.process ??= {}; globalThis.process.env ??= {};
import { h as updateSubscriberPreferences } from '../../../chunks/newsletter_DBEiW4Ks.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, locals }) => {
  try {
    const db = locals?.runtime?.env?.DB;
    if (!db) {
      return new Response(
        JSON.stringify({ success: false, message: "Database not available" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const body = await request.json();
    const { email, token, categories } = body;
    if (!email || !token) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const subscriber = await db.prepare(`
      SELECT * FROM subscribers WHERE email = ? AND verification_token = ?
    `).bind(email.toLowerCase().trim(), token).first();
    if (!subscriber) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid request" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    await updateSubscriberPreferences(subscriber.id, categories, db);
    return new Response(
      JSON.stringify({
        success: true,
        message: "Preferences updated successfully!",
        data: {
          categories,
          email: subscriber.email
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Save preferences error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong"
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
