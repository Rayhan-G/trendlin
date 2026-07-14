// src/pages/api/admin/reliable/subsubcategories.ts
import type { APIRoute } from 'astro';

export const prerender = false;

// GET - List all sub-subcategories
export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const subcategoryId = url.searchParams.get('subcategory_id');
    
    let query = `
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
      WHERE ssc.is_active = 1
    `;

    const params: any[] = [];

    if (subcategoryId) {
      query += ` AND ssc.subcategory_id = ?`;
      params.push(parseInt(subcategoryId));
    }

    query += ` ORDER BY ssc.display_order, ssc.name`;

    const result = await db.prepare(query).bind(...params).all();

    return new Response(JSON.stringify({
      success: true,
      data: result.results
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching sub-subcategories:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch sub-subcategories'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

// POST - Create a new sub-subcategory
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const data = await request.json();

    const { subcategory_id, name, slug, description, display_order, is_active } = data;

    // Validate required fields
    if (!subcategory_id || !name || !slug) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Subcategory ID, name, and slug are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Check if subcategory exists
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

    // Check if slug exists
    const existing = await db.prepare(`
      SELECT id FROM reliable_sub_subcategories WHERE slug = ?
    `).bind(slug).first();

    if (existing) {
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

    const result = await db.prepare(`
      INSERT INTO reliable_sub_subcategories (
        subcategory_id, name, slug, description, display_order, is_active,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(
      subcategory_id,
      name,
      slug,
      description || '',
      display_order || 0,
      is_active !== undefined ? is_active : 1
    ).run();

    return new Response(JSON.stringify({
      success: true,
      data: { id: result.meta.last_row_id },
      message: 'Sub-subcategory created successfully'
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error creating sub-subcategory:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create sub-subcategory'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

// PUT - Update a sub-subcategory
export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const data = await request.json();

    const { id, subcategory_id, name, slug, description, display_order, is_active } = data;

    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Sub-subcategory ID is required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

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

// DELETE - Delete a sub-subcategory
export const DELETE: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const data = await request.json();
    const id = data.id;

    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Sub-subcategory ID is required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

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
      SELECT COUNT(*) as count FROM reliable_websites WHERE sub_subcategory_id = ? AND is_active = 1
    `).bind(id).first();

    if (websiteCheck && websiteCheck.count > 0) {
      return new Response(JSON.stringify({
        success: false,
        error: `Cannot delete sub-subcategory with ${websiteCheck.count} existing websites. Delete websites first.`
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