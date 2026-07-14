globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../../renderers.mjs';

const prerender = false;
const GET = async ({ url, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const categoryId = url.searchParams.get("category_id");
    let query = `
      SELECT 
        sc.id,
        sc.name,
        sc.slug,
        sc.description,
        sc.display_order,
        sc.is_active,
        sc.created_at,
        sc.updated_at,
        sc.category_id,
        c.name as category_name,
        c.slug as category_slug,
        c.icon as category_icon,
        (SELECT COUNT(*) FROM reliable_sub_subcategories WHERE subcategory_id = sc.id AND is_active = 1) as subsubcategory_count,
        (SELECT COUNT(*) FROM reliable_websites WHERE subcategory_id = sc.id AND is_active = 1) as website_count
      FROM reliable_subcategories sc
      JOIN reliable_categories c ON sc.category_id = c.id
      WHERE sc.is_active = 1
    `;
    const params = [];
    if (categoryId) {
      query += ` AND sc.category_id = ?`;
      params.push(parseInt(categoryId));
    }
    query += ` ORDER BY sc.display_order, sc.name`;
    const result = await db.prepare(query).bind(...params).all();
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
    console.error("Error fetching subcategories:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to fetch subcategories"
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
    const { category_id, name, slug, description, display_order, is_active } = data;
    if (!category_id || !name || !slug) {
      return new Response(JSON.stringify({
        success: false,
        error: "Category ID, name, and slug are required"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const categoryCheck = await db.prepare(`
      SELECT id FROM reliable_categories WHERE id = ? AND is_active = 1
    `).bind(category_id).first();
    if (!categoryCheck) {
      return new Response(JSON.stringify({
        success: false,
        error: "Category not found"
      }), {
        status: 404,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const existing = await db.prepare(`
      SELECT id FROM reliable_subcategories WHERE slug = ?
    `).bind(slug).first();
    if (existing) {
      return new Response(JSON.stringify({
        success: false,
        error: "Subcategory with this slug already exists"
      }), {
        status: 409,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const result = await db.prepare(`
      INSERT INTO reliable_subcategories (
        category_id, name, slug, description, display_order, is_active,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(
      category_id,
      name,
      slug,
      description || "",
      display_order || 0,
      is_active !== void 0 ? is_active : 1
    ).run();
    return new Response(JSON.stringify({
      success: true,
      data: { id: result.meta.last_row_id },
      message: "Subcategory created successfully"
    }), {
      status: 201,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error creating subcategory:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to create subcategory"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};
const PUT = async ({ request, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const data = await request.json();
    const { id, category_id, name, slug, description, display_order, is_active } = data;
    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: "Subcategory ID is required"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const existing = await db.prepare(`
      SELECT id FROM reliable_subcategories WHERE id = ?
    `).bind(id).first();
    if (!existing) {
      return new Response(JSON.stringify({
        success: false,
        error: "Subcategory not found"
      }), {
        status: 404,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    if (category_id) {
      const categoryCheck = await db.prepare(`
        SELECT id FROM reliable_categories WHERE id = ? AND is_active = 1
      `).bind(category_id).first();
      if (!categoryCheck) {
        return new Response(JSON.stringify({
          success: false,
          error: "Category not found"
        }), {
          status: 404,
          headers: {
            "Content-Type": "application/json"
          }
        });
      }
    }
    if (slug) {
      const slugCheck = await db.prepare(`
        SELECT id FROM reliable_subcategories WHERE slug = ? AND id != ?
      `).bind(slug, id).first();
      if (slugCheck) {
        return new Response(JSON.stringify({
          success: false,
          error: "Subcategory with this slug already exists"
        }), {
          status: 409,
          headers: {
            "Content-Type": "application/json"
          }
        });
      }
    }
    await db.prepare(`
      UPDATE reliable_subcategories SET
        category_id = COALESCE(?, category_id),
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        display_order = COALESCE(?, display_order),
        is_active = COALESCE(?, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      category_id || null,
      name || null,
      slug || null,
      description || null,
      display_order !== void 0 ? display_order : null,
      is_active !== void 0 ? is_active : null,
      id
    ).run();
    return new Response(JSON.stringify({
      success: true,
      message: "Subcategory updated successfully"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error updating subcategory:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to update subcategory"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};
const DELETE = async ({ request, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const data = await request.json();
    const id = data.id;
    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: "Subcategory ID is required"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const existing = await db.prepare(`
      SELECT id FROM reliable_subcategories WHERE id = ?
    `).bind(id).first();
    if (!existing) {
      return new Response(JSON.stringify({
        success: false,
        error: "Subcategory not found"
      }), {
        status: 404,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const subsubCheck = await db.prepare(`
      SELECT COUNT(*) as count FROM reliable_sub_subcategories WHERE subcategory_id = ? AND is_active = 1
    `).bind(id).first();
    if (subsubCheck && subsubCheck.count > 0) {
      return new Response(JSON.stringify({
        success: false,
        error: `Cannot delete subcategory with ${subsubCheck.count} existing sub-subcategories. Delete sub-subcategories first.`
      }), {
        status: 409,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const websiteCheck = await db.prepare(`
      SELECT COUNT(*) as count FROM reliable_websites WHERE subcategory_id = ? AND is_active = 1
    `).bind(id).first();
    if (websiteCheck && websiteCheck.count > 0) {
      return new Response(JSON.stringify({
        success: false,
        error: `Cannot delete subcategory with ${websiteCheck.count} existing websites. Delete websites first.`
      }), {
        status: 409,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    await db.prepare(`
      UPDATE reliable_subcategories SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(id).run();
    return new Response(JSON.stringify({
      success: true,
      message: "Subcategory deleted successfully"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to delete subcategory"
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
  DELETE,
  GET,
  POST,
  PUT,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
