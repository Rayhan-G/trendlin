// src/pages/api/admin/reliable/subcategories/[id].ts
import type { APIRoute } from 'astro';

export const prerender = false;

// GET - Get single subcategory
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const id = parseInt(params.id);

    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid ID'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const result = await db.prepare(`
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
      WHERE sc.id = ?
    `).bind(id).first();

    if (!result) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Subcategory not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: result
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching subcategory:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch subcategory'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

// PUT - Update subcategory
export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const id = parseInt(params.id);
    const data = await request.json();

    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid ID'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const { category_id, name, slug, description, display_order, is_active } = data;

    // Check if subcategory exists
    const existing = await db.prepare(`
      SELECT id FROM reliable_subcategories WHERE id = ?
    `).bind(id).first();

    if (!existing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Subcategory not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Check if category exists (if category_id provided)
    if (category_id) {
      const categoryCheck = await db.prepare(`
        SELECT id FROM reliable_categories WHERE id = ? AND is_active = 1
      `).bind(category_id).first();

      if (!categoryCheck) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Category not found'
        }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }

    // Check slug uniqueness
    if (slug) {
      const slugCheck = await db.prepare(`
        SELECT id FROM reliable_subcategories WHERE slug = ? AND id != ?
      `).bind(slug, id).first();

      if (slugCheck) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Subcategory with this slug already exists'
        }), {
          status: 409,
          headers: {
            'Content-Type': 'application/json'
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
      display_order !== undefined ? display_order : null,
      is_active !== undefined ? is_active : null,
      id
    ).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Subcategory updated successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error updating subcategory:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update subcategory'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

// DELETE - Delete subcategory
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const id = parseInt(params.id);

    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid ID'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Check if subcategory exists
    const existing = await db.prepare(`
      SELECT id FROM reliable_subcategories WHERE id = ?
    `).bind(id).first();

    if (!existing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Subcategory not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Check if subcategory has sub-subcategories
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
          'Content-Type': 'application/json'
        }
      });
    }

    // Check if subcategory has websites
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
          'Content-Type': 'application/json'
        }
      });
    }

    // Soft delete
    await db.prepare(`
      UPDATE reliable_subcategories SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(id).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Subcategory deleted successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to delete subcategory'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};