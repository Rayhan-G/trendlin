// src/pages/api/admin/reliable/subsubcategories/[id].ts
import type { APIRoute } from 'astro';

export const prerender = false;

// GET - Get single sub-subcategory
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const id = parseInt(params.id);

    const result = await db.prepare(`
      SELECT 
        ssc.id,
        ssc.name,
        ssc.slug,
        ssc.description,
        ssc.display_order,
        ssc.is_active,
        ssc.created_at,
        ssc.updated_at,
        ssc.subcategory_id,
        sc.name as subcategory_name,
        sc.slug as subcategory_slug,
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug,
        (SELECT COUNT(*) FROM reliable_websites WHERE sub_subcategory_id = ssc.id AND is_active = 1) as website_count
      FROM reliable_sub_subcategories ssc
      JOIN reliable_subcategories sc ON ssc.subcategory_id = sc.id
      JOIN reliable_categories c ON sc.category_id = c.id
      WHERE ssc.id = ?
    `).bind(id).first();

    if (!result) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Sub-subcategory not found'
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
    console.error('Error fetching sub-subcategory:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch sub-subcategory'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

// PUT - Update sub-subcategory
export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const id = parseInt(params.id);
    const data = await request.json();

    const { subcategory_id, name, slug, description, display_order, is_active } = data;

    // Check if sub-subcategory exists
    const existing = await db.prepare(`
      SELECT id FROM reliable_sub_subcategories WHERE id = ?
    `).bind(id).first();

    if (!existing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Sub-subcategory not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Check if subcategory exists (if subcategory_id provided)
    if (subcategory_id) {
      const subcatCheck = await db.prepare(`
        SELECT id FROM reliable_subcategories WHERE id = ? AND is_active = 1
      `).bind(subcategory_id).first();

      if (!subcatCheck) {
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
    }

    // Check slug uniqueness
    if (slug) {
      const slugCheck = await db.prepare(`
        SELECT id FROM reliable_sub_subcategories WHERE slug = ? AND id != ?
      `).bind(slug, id).first();

      if (slugCheck) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Sub-subcategory with this slug already exists'
        }), {
          status: 409,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }

    await db.prepare(`
      UPDATE reliable_sub_subcategories SET
        subcategory_id = COALESCE(?, subcategory_id),
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        display_order = COALESCE(?, display_order),
        is_active = COALESCE(?, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      subcategory_id || null,
      name || null,
      slug || null,
      description || null,
      display_order !== undefined ? display_order : null,
      is_active !== undefined ? is_active : null,
      id
    ).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Sub-subcategory updated successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error updating sub-subcategory:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update sub-subcategory'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

// DELETE - Delete sub-subcategory
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const id = parseInt(params.id);

    // Check if sub-subcategory exists
    const existing = await db.prepare(`
      SELECT id FROM reliable_sub_subcategories WHERE id = ?
    `).bind(id).first();

    if (!existing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Sub-subcategory not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Check if sub-subcategory has websites
    const websiteCheck = await db.prepare(`
      SELECT COUNT(*) as count FROM reliable_websites WHERE sub_subcategory_id = ?
    `).bind(id).first();

    if (websiteCheck && websiteCheck.count > 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Cannot delete sub-subcategory with existing websites. Delete websites first.'
      }), {
        status: 409,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Soft delete
    await db.prepare(`
      UPDATE reliable_sub_subcategories SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(id).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Sub-subcategory deleted successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error deleting sub-subcategory:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to delete sub-subcategory'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};