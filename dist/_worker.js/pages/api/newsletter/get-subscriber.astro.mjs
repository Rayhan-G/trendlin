globalThis.process ??= {}; globalThis.process.env ??= {};
import { g as getDB, p as prepareFirst } from '../../../chunks/db_CaYABffz.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ url, locals }) => {
  try {
    const email = url.searchParams.get("email");
    const token = url.searchParams.get("token");
    const env = locals.env;
    const db = getDB(env);
    let subscriber = null;
    if (token) {
      subscriber = await prepareFirst(
        db,
        "SELECT * FROM newsletter_subscribers WHERE unsubscribe_token = ?",
        [token]
      );
    } else if (email) {
      subscriber = await prepareFirst(
        db,
        "SELECT * FROM newsletter_subscribers WHERE email = ?",
        [email.toLowerCase().trim()]
      );
    }
    if (!subscriber) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Subscriber not found"
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    let preferences = {};
    let categories = [];
    let frequency = "weekly";
    try {
      preferences = subscriber.preferences ? JSON.parse(subscriber.preferences) : {};
      categories = preferences.categories || [];
      frequency = preferences.frequency || "weekly";
    } catch (e) {
    }
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: subscriber.id,
          email: subscriber.email,
          firstName: subscriber.first_name,
          lastName: subscriber.last_name,
          status: subscriber.status,
          token: subscriber.unsubscribe_token,
          categories,
          frequency,
          createdAt: subscriber.created_at,
          verifiedAt: subscriber.verified_at
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Get subscriber error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to get subscriber"
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
