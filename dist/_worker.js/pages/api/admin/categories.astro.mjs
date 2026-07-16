globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, locals }) => {
  const { DB } = locals.runtime.env;
  const data = await request.json();
  try {
    const { name, slug, icon, description, hero_image, is_active } = data;
    const existing = await DB.prepare(
      "SELECT id FROM categories WHERE slug = ?"
    ).bind(slug).first();
    if (existing) {
      return new Response(JSON.stringify({
        success: false,
        error: "Category with this slug already exists"
      }), { status: 400 });
    }
    const result = await DB.prepare(`
      INSERT INTO categories (name, slug, icon, description, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).bind(name, slug, icon || null, description || null, is_active || 1).run();
    const categoryId = result.meta?.last_row_id;
    if (hero_image && categoryId) {
      await DB.prepare(`
        INSERT INTO category_hero (category_id, hero_image, is_active, created_at)
        VALUES (?, ?, 1, datetime('now'))
      `).bind(categoryId, hero_image).run();
    }
    return new Response(JSON.stringify({
      success: true,
      id: categoryId,
      message: "Category created successfully"
    }));
  } catch (error) {
    console.error("Category creation error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Failed to create category"
    }), { status: 500 });
  }
};
const GET = async ({ locals }) => {
  const { DB } = locals.runtime.env;
  try {
    const result = await DB.prepare(`
      SELECT 
        c.*,
        ch.hero_image,
        COUNT(p.id) as post_count
      FROM categories c
      LEFT JOIN category_hero ch ON c.id = ch.category_id AND ch.is_active = 1
      LEFT JOIN posts p ON p.category = c.name AND p.is_draft = 0
      GROUP BY c.id
      ORDER BY c.name ASC
    `).all();
    return new Response(JSON.stringify({
      success: true,
      categories: result.results || []
    }));
  } catch (error) {
    console.error("Categories fetch error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Failed to fetch categories"
    }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
