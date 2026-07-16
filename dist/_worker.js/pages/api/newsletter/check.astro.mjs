globalThis.process ??= {}; globalThis.process.env ??= {};
import { g as getDB, p as prepareFirst } from '../../../chunks/db_CaYABffz.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ url, locals }) => {
  try {
    const email = url.searchParams.get("email");
    const env = locals.env;
    const db = getDB(env);
    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const subscriber = await prepareFirst(
      db,
      "SELECT status FROM newsletter_subscribers WHERE email = ?",
      [email.toLowerCase().trim()]
    );
    if (!subscriber) {
      return new Response(
        JSON.stringify({
          success: true,
          status: "not_found"
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        status: subscriber.status
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Check subscriber error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to check subscriber"
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
