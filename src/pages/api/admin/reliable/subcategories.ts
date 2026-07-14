// src/pages/api/admin/reliable/subcategories/index.ts
import type { APIRoute } from 'astro';

export const prerender = false;

// GET - List all subcategories
export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const categoryId = url.searchParams.get('category_id');
    
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
      WHERE 1=1
    `;

    const params: any[] = [];

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
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch subcategories'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

// POST - Create a new subcategory
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const data = await request.json();

    const { category_id, name, slug, description, display_order, is_active } = data;

    // Validate required fields
    if (!category_id || !name || !slug) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Category ID, name, and slug are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Check if category exists
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

    // Check if slug exists
    const existing = await db.prepare(`
      SELECT id FROM reliable_subcategories WHERE slug = ?
    `).bind(slug).first();

    if (existing) {
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

    const result = await db.prepare(`
      INSERT INTO reliable_subcategories (
        category_id, name, slug, description, display_order, is_active,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(
      category_id,
      name,
      slug,
      description || '',
      display_order || 0,
      is_active !== undefined ? is_active : 1
    ).run();

    return new Response(JSON.stringify({
      success: true,
      data: { id: result.meta.last_row_id },
      message: 'Subcategory created successfully'
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error creating subcategory:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create subcategory'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};