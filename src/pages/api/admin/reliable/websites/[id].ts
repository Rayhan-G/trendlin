// src/pages/api/admin/reliable/websites/[id].ts
import type { APIRoute } from 'astro';

export const prerender = false;

// GET - Get a single website
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const id = parseInt(params.id);

    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid website ID'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const result = await db.prepare(`
      SELECT 
        w.id,
        w.name,
        w.url,
        w.description,
        w.reliability_score,
        w.notes,
        w.country,
        w.language,
        w.logo_url,
        w.is_featured,
        w.is_active,
        w.last_verified,
        w.verified_by,
        w.usage_count,
        w.created_at,
        w.updated_at,
        w.subcategory_id,
        w.sub_subcategory_id,
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug,
        c.icon as category_icon,
        sc.name as subcategory_name,
        sc.slug as subcategory_slug,
        ssc.name as subsubcategory_name,
        ssc.slug as subsubcategory_slug
      FROM reliable_websites w
      LEFT JOIN reliable_subcategories sc ON w.subcategory_id = sc.id
      LEFT JOIN reliable_categories c ON sc.category_id = c.id
      LEFT JOIN reliable_sub_subcategories ssc ON w.sub_subcategory_id = ssc.id
      WHERE w.id = ?
    `).bind(id).first();

    if (!result) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Website not found'
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
    console.error('Error fetching website:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch website'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

// PUT - Update a website
export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const id = parseInt(params.id);
    const data = await request.json();

    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid website ID'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const {
      subcategory_id,
      subsubcategory_id,
      name,
      url,
      description,
      notes,
      reliability_score,
      country,
      language,
      logo_url,
      is_featured,
      is_active
    } = data;

    // Check if website exists
    const existing = await db.prepare(`
      SELECT id FROM reliable_websites WHERE id = ?
    `).bind(id).first();

    if (!existing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Website not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Verify subcategory exists
    if (subcategory_id) {
      const subcatCheck = await db.prepare(`
        SELECT id FROM reliable_subcategories WHERE id = ?
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

    // If subsubcategory_id provided, verify it belongs to the subcategory
    if (subsubcategory_id && subcategory_id) {
      const subsubCheck = await db.prepare(`
        SELECT id FROM reliable_sub_subcategories WHERE id = ? AND subcategory_id = ?
      `).bind(subsubcategory_id, subcategory_id).first();

      if (!subsubCheck) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Sub-subcategory not found or does not belong to the selected subcategory'
        }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }

    await db.prepare(`
      UPDATE reliable_websites SET
        subcategory_id = COALESCE(?, subcategory_id),
        sub_subcategory_id = ?,
        name = COALESCE(?, name),
        url = COALESCE(?, url),
        description = COALESCE(?, description),
        notes = COALESCE(?, notes),
        reliability_score = COALESCE(?, reliability_score),
        country = COALESCE(?, country),
        language = COALESCE(?, language),
        logo_url = COALESCE(?, logo_url),
        is_featured = COALESCE(?, is_featured),
        is_active = COALESCE(?, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      subcategory_id || null,
      subsubcategory_id || null,
      name || null,
      url || null,
      description || null,
      notes || null,
      reliability_score || null,
      country || null,
      language || null,
      logo_url || null,
      is_featured !== undefined ? is_featured : null,
      is_active !== undefined ? is_active : null,
      id
    ).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Website updated successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error updating website:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update website'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

// DELETE - Delete a website
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const id = parseInt(params.id);

    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid website ID'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Check if website exists
    const existing = await db.prepare(`
      SELECT id FROM reliable_websites WHERE id = ?
    `).bind(id).first();

    if (!existing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Website not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Soft delete (set inactive) instead of hard delete
    await db.prepare(`
      UPDATE reliable_websites SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(id).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Website deleted successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error deleting website:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to delete website'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};