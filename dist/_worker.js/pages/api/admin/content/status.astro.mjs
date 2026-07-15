globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../../renderers.mjs';

const prerender = false;
const GET = async ({ locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const result = await db.prepare(`
      SELECT * FROM content_status ORDER BY display_order
    `).all();
    return new Response(JSON.stringify({
      success: true,
      data: result.results
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error fetching content statuses:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to fetch content statuses"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
