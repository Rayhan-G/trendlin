globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../../renderers.mjs';

const prerender = false;
const GET = async ({ locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const result = await db.prepare(`
      SELECT 
        id,
        name,
        slug,
        description,
        icon,
        display_order,
        is_active,
        created_at,
        updated_at,
        (SELECT COUNT(*) FROM reliable_subcategories WHERE category_id = c.id AND is_active = 1) as subcategory_count
      FROM reliable_categories c
      ORDER BY display_order, name
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
    console.error("Error fetching categories:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to fetch categories"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};
const POST = async ({ request, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const data = await request.json();
    const { name, slug, description, icon, display_order, is_active } = data;
    if (!name || !slug) {
      return new Response(JSON.stringify({
        success: false,
        error: "Name and slug are required"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const existing = await db.prepare(`
      SELECT id FROM reliable_categories WHERE slug = ?
    `).bind(slug).first();
    if (existing) {
      return new Response(JSON.stringify({
        success: false,
        error: "Category with this slug already exists"
      }), {
        status: 409,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const result = await db.prepare(`
      INSERT INTO reliable_categories (
        name, slug, description, icon, display_order, is_active,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(
      name,
      slug,
      description || "",
      icon || "📚",
      display_order || 0,
      is_active !== void 0 ? is_active : 1
    ).run();
    return new Response(JSON.stringify({
      success: true,
      data: { id: result.meta.last_row_id },
      message: "Category created successfully"
    }), {
      status: 201,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to create category"
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
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
