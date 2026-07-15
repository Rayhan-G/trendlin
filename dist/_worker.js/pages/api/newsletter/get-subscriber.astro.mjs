globalThis.process ??= {}; globalThis.process.env ??= {};
import { f as getSubscriberByEmail } from '../../../chunks/newsletter_DBEiW4Ks.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ url, locals }) => {
  try {
    const db = locals?.runtime?.env?.DB;
    if (!db) {
      return new Response(
        JSON.stringify({ success: false, message: "Database not available" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const email = url.searchParams.get("email");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid email address" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const subscriber = await getSubscriberByEmail(email, db);
    if (!subscriber) {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            status: "not-subscribed",
            verified: false,
            subscribed: false,
            categories: [],
            token: "",
            firstName: "",
            email
          }
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    const preferences = await db.prepare(`
      SELECT category FROM newsletter_preferences 
      WHERE subscriber_id = ? AND subscribed = 1
    `).bind(subscriber.id).all();
    const categories = preferences.results.map((r) => r.category);
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          status: subscriber.status,
          verified: subscriber.status === "active",
          subscribed: subscriber.status === "active",
          categories: categories.length > 0 ? categories : subscriber.categories ? subscriber.categories.split(",") : [],
          token: subscriber.verification_token || "",
          firstName: subscriber.first_name || "",
          email: subscriber.email
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Get subscriber error:", error);
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
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
