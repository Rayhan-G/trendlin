globalThis.process ??= {}; globalThis.process.env ??= {};
import { i as getSubscriberStats } from '../../../chunks/newsletter_DBEiW4Ks.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ locals }) => {
  try {
    const db = locals.runtime?.env?.DB;
    if (!db) {
      return new Response(
        JSON.stringify({ success: false, message: "Database not available" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const stats = await getSubscriberStats(db);
    return new Response(
      JSON.stringify({
        success: true,
        data: stats
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Stats error:", error);
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
