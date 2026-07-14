// src/pages/api/admin/reliable/websites.ts
import type { APIRoute } from 'astro';

export const prerender = false;

// GET - List all websites with filters
export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    
    const category = url.searchParams.get('category');
    const subcategory = url.searchParams.get('subcategory');
    const subsubcategory = url.searchParams.get('subsubcategory');
    const minScore = url.searchParams.get('min_score');
    const search = url.searchParams.get('search');
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = `
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
      WHERE w.is_active = 1
    `;

    const params: any[] = [];

    if (category) {
      query += ` AND c.id = ?`;
      params.push(parseInt(category));
    }

    if (subcategory) {
      query += ` AND sc.id = ?`;
      params.push(parseInt(subcategory));
    }

    if (subsubcategory) {
      query += ` AND ssc.id = ?`;
      params.push(parseInt(subsubcategory));
    }

    if (minScore) {
      query += ` AND w.reliability_score >= ?`;
      params.push(parseInt(minScore));
    }

    if (search) {
      query += ` AND (w.name LIKE ? OR w.description LIKE ? OR w.url LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY w.reliability_score DESC, w.name`;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const result = await db.prepare(query).bind(...params).all();

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM reliable_websites w
      LEFT JOIN reliable_subcategories sc ON w.subcategory_id = sc.id
      LEFT JOIN reliable_categories c ON sc.category_id = c.id
      LEFT JOIN reliable_sub_subcategories ssc ON w.sub_subcategory_id = ssc.id
      WHERE w.is_active = 1
    `;

    const countParams: any[] = [];

    if (category) {
      countQuery += ` AND c.id = ?`;
      countParams.push(parseInt(category));
    }

    if (subcategory) {
      countQuery += ` AND sc.id = ?`;
      countParams.push(parseInt(subcategory));
    }

    if (subsubcategory) {
      countQuery += ` AND ssc.id = ?`;
      countParams.push(parseInt(subsubcategory));
    }

    if (minScore) {
      countQuery += ` AND w.reliability_score >= ?`;
      countParams.push(parseInt(minScore));
    }

    if (search) {
      countQuery += ` AND (w.name LIKE ? OR w.description LIKE ? OR w.url LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const countResult = await db.prepare(countQuery).bind(...countParams).first();

    return new Response(JSON.stringify({
      success: true,
      data: result.results,
      meta: {
        total: countResult?.total || 0,
        limit,
        offset
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching websites:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch websites'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

// POST - Create a new website
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const data = await request.json();

    const {
      category_id,
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

    // Validate required fields
    if (!name || !url || !subcategory_id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Name, URL, and subcategory are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Verify subcategory exists
    const subcatCheck = await db.prepare(`
      SELECT id, category_id FROM reliable_subcategories WHERE id = ? AND is_active = 1
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

    // If subsubcategory_id provided, verify it belongs to the subcategory
    if (subsubcategory_id) {
      const subsubCheck = await db.prepare(`
        SELECT id FROM reliable_sub_subcategories WHERE id = ? AND subcategory_id = ? AND is_active = 1
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

    const result = await db.prepare(`
      INSERT INTO reliable_websites (
        subcategory_id,
        sub_subcategory_id,
        name,
        url,
        description,
        notes,
        reliability_score,
        country,
        language,
        logo_url,
        is_featured,
        is_active,
        last_verified,
        verified_by,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE('now'), 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(
      subcategory_id,
      subsubcategory_id || null,
      name,
      url,
      description || '',
      notes || '',
      reliability_score || 5,
      country || 'USA',
      language || 'English',
      logo_url || '',
      is_featured || 0,
      is_active !== undefined ? is_active : 1
    ).run();

    return new Response(JSON.stringify({
      success: true,
      data: {
        id: result.meta.last_row_id
      },
      message: 'Website created successfully'
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error creating website:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create website'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};