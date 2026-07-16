globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../../renderers.mjs';

const GET = async ({ params, locals }) => {
  try {
    const { id } = params;
    const { DB } = locals.runtime.env;
    if (!id) {
      return new Response(JSON.stringify({ error: "Product ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const result = await DB.prepare(`
      SELECT 
        id, platform, url, title, description, author
      FROM product_social_resources
      WHERE product_id = ?
      ORDER BY platform, created_at DESC
    `).bind(parseInt(id)).all();
    return new Response(JSON.stringify(result.results || []), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch resources" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
