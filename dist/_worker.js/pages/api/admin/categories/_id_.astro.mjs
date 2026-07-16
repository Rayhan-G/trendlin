globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../../renderers.mjs';

const PUT = async ({ params, request, locals }) => {
  const { DB } = locals.runtime.env;
  const id = params.id;
  const data = await request.json();
  try {
    const { name, slug, icon, description, hero_image, is_active } = data;
    if (!name || !slug) {
      return new Response(JSON.stringify({
        success: false,
        error: "Name and slug are required"
      }), { status: 400 });
    }
    const existing = await DB.prepare(
      "SELECT id FROM categories WHERE slug = ? AND id != ?"
    ).bind(slug, id).first();
    if (existing) {
      return new Response(JSON.stringify({
        success: false,
        error: "Category with this slug already exists"
      }), { status: 400 });
    }
    await DB.prepare(`
      UPDATE categories 
      SET 
        name = ?,
        slug = ?,
        icon = ?,
        description = ?,
        is_active = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      name,
      slug,
      icon || null,
      description || null,
      is_active || 1,
      id
    ).run();
    if (hero_image) {
      const existingHero = await DB.prepare(
        "SELECT id FROM category_hero WHERE category_id = ?"
      ).bind(id).first();
      if (existingHero) {
        await DB.prepare(`
          UPDATE category_hero 
          SET hero_image = ?, updated_at = datetime('now')
          WHERE category_id = ?
        `).bind(hero_image, id).run();
      } else {
        await DB.prepare(`
          INSERT INTO category_hero (category_id, hero_image, is_active, created_at)
          VALUES (?, ?, 1, datetime('now'))
        `).bind(id, hero_image).run();
      }
    }
    return new Response(JSON.stringify({
      success: true,
      id,
      message: "Category updated successfully"
    }));
  } catch (error) {
    console.error("Category update error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Failed to update category"
    }), { status: 500 });
  }
};
const DELETE = async ({ params, locals }) => {
  const { DB } = locals.runtime.env;
  const id = params.id;
  try {
    const posts = await DB.prepare(
      "SELECT COUNT(*) as count FROM posts WHERE category = ? AND is_draft = 0"
    ).bind(id).first();
    if (posts && posts.count > 0) {
      return new Response(JSON.stringify({
        success: false,
        error: `Cannot delete category with ${posts.count} published post(s)`
      }), { status: 400 });
    }
    await DB.prepare(
      "DELETE FROM category_hero WHERE category_id = ?"
    ).bind(id).run();
    await DB.prepare(
      "DELETE FROM categories WHERE id = ?"
    ).bind(id).run();
    return new Response(JSON.stringify({
      success: true,
      message: "Category deleted successfully"
    }));
  } catch (error) {
    console.error("Category delete error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Failed to delete category"
    }), { status: 500 });
  }
};
const GET = async ({ params, locals }) => {
  const { DB } = locals.runtime.env;
  const id = params.id;
  try {
    const category = await DB.prepare(`
      SELECT 
        c.*,
        ch.hero_image,
        (SELECT COUNT(*) FROM posts WHERE category = c.name AND is_draft = 0) as post_count
      FROM categories c
      LEFT JOIN category_hero ch ON c.id = ch.category_id AND ch.is_active = 1
      WHERE c.id = ?
    `).bind(id).first();
    if (!category) {
      return new Response(JSON.stringify({
        success: false,
        error: "Category not found"
      }), { status: 404 });
    }
    return new Response(JSON.stringify({
      success: true,
      category
    }));
  } catch (error) {
    console.error("Category fetch error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Failed to fetch category"
    }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
