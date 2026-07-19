globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../../../renderers.mjs';

const PUT = async ({ params, request, locals }) => {
  const { DB } = locals.runtime.env;
  const categoryId = params.id;
  try {
    const { hero_image, hero_id } = await request.json();
    if (!hero_image) {
      return new Response(JSON.stringify({
        success: false,
        error: "Hero image URL is required"
      }), { status: 400 });
    }
    const categoryExists = await DB.prepare(
      "SELECT id FROM categories WHERE id = ?"
    ).bind(categoryId).first();
    if (!categoryExists) {
      return new Response(JSON.stringify({
        success: false,
        error: "Category not found"
      }), { status: 404 });
    }
    if (hero_id) {
      await DB.prepare(`
        UPDATE category_hero 
        SET hero_image = ?, updated_at = datetime('now')
        WHERE id = ? AND category_id = ?
      `).bind(hero_image, hero_id, categoryId).run();
    } else {
      const existingHero = await DB.prepare(
        "SELECT id FROM category_hero WHERE category_id = ?"
      ).bind(categoryId).first();
      if (existingHero) {
        await DB.prepare(`
          UPDATE category_hero 
          SET hero_image = ?, updated_at = datetime('now')
          WHERE category_id = ?
        `).bind(hero_image, categoryId).run();
      } else {
        await DB.prepare(`
          INSERT INTO category_hero (category_id, hero_image, is_active, created_at)
          VALUES (?, ?, 1, datetime('now'))
        `).bind(categoryId, hero_image).run();
      }
    }
    return new Response(JSON.stringify({
      success: true,
      message: "Hero image saved successfully"
    }));
  } catch (error) {
    console.error("Save hero error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Failed to save hero image"
    }), { status: 500 });
  }
};
const DELETE = async ({ params, request, locals }) => {
  const { DB } = locals.runtime.env;
  const categoryId = params.id;
  try {
    const { heroId } = await request.json();
    if (!heroId) {
      return new Response(JSON.stringify({
        success: false,
        error: "Hero ID is required"
      }), { status: 400 });
    }
    const hero = await DB.prepare(
      "SELECT id FROM category_hero WHERE id = ? AND category_id = ?"
    ).bind(heroId, categoryId).first();
    if (!hero) {
      return new Response(JSON.stringify({
        success: false,
        error: "Hero image not found for this category"
      }), { status: 404 });
    }
    await DB.prepare(
      "DELETE FROM category_hero WHERE id = ? AND category_id = ?"
    ).bind(heroId, categoryId).run();
    return new Response(JSON.stringify({
      success: true,
      message: "Hero image removed successfully"
    }));
  } catch (error) {
    console.error("Remove hero error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Failed to remove hero image"
    }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
