// src/pages/api/admin/content/index.ts
import type { APIRoute } from 'astro';

export const prerender = false;

// GET - List content with filters
export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    const type = url.searchParams.get('type');
    const search = url.searchParams.get('search');
    const month = url.searchParams.get('month');
    const year = url.searchParams.get('year');
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = `
      SELECT 
        c.id,
        c.title,
        c.slug,
        c.excerpt,
        c.content,
        c.content_type_id,
        ct.name as content_type_name,
        ct.icon as content_type_icon,
        ct.color as content_type_color,
        c.category_id,
        cc.name as category_name,
        cc.slug as category_slug,
        c.status_id,
        cs.name as status_name,
        cs.slug as status_slug,
        cs.color as status_color,
        c.author_id,
        a.username as author_name,
        c.featured_image,
        c.cover_image,
        c.tags,
        c.meta_title,
        c.meta_description,
        c.scheduled_publish_at,
        c.published_at,
        c.created_at,
        c.updated_at,
        c.is_published,
        c.is_featured,
        c.views,
        c.source_url,
        c.source_name,
        c.source_type
      FROM content c
      LEFT JOIN content_types ct ON c.content_type_id = ct.id
      LEFT JOIN content_categories cc ON c.category_id = cc.id
      LEFT JOIN content_status cs ON c.status_id = cs.id
      LEFT JOIN admins a ON c.author_id = a.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (status) {
      query += ` AND c.status_id = ?`;
      params.push(parseInt(status));
    }

    if (category) {
      query += ` AND c.category_id = ?`;
      params.push(parseInt(category));
    }

    if (type) {
      query += ` AND c.content_type_id = ?`;
      params.push(parseInt(type));
    }

    if (search) {
      query += ` AND (c.title LIKE ? OR c.content LIKE ? OR c.excerpt LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (month && year) {
      query += ` AND strftime('%m', c.scheduled_publish_at) = ? AND strftime('%Y', c.scheduled_publish_at) = ?`;
      params.push(month.padStart(2, '0'), year);
    }

    query += ` ORDER BY c.scheduled_publish_at DESC, c.created_at DESC`;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const result = await db.prepare(query).bind(...params).all();

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM content c
      WHERE 1=1
    `;

    const countParams: any[] = [];
    let countIndex = 0;

    if (status) {
      countQuery += ` AND c.status_id = ?`;
      countParams.push(parseInt(status));
    }

    if (category) {
      countQuery += ` AND c.category_id = ?`;
      countParams.push(parseInt(category));
    }

    if (type) {
      countQuery += ` AND c.content_type_id = ?`;
      countParams.push(parseInt(type));
    }

    if (search) {
      countQuery += ` AND (c.title LIKE ? OR c.content LIKE ? OR c.excerpt LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (month && year) {
      countQuery += ` AND strftime('%m', c.scheduled_publish_at) = ? AND strftime('%Y', c.scheduled_publish_at) = ?`;
      countParams.push(month.padStart(2, '0'), year);
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
    console.error('Error fetching content:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch content'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

// POST - Create new content
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const data = await request.json();

    const {
      title,
      slug,
      content,
      excerpt,
      content_type_id,
      category_id,
      status_id,
      featured_image,
      cover_image,
      tags,
      meta_title,
      meta_description,
      meta_keywords,
      scheduled_publish_at,
      source_url,
      source_name,
      source_type,
      is_featured
    } = data;

    // Validate required fields
    if (!title || !slug || !content_type_id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Title, slug, and content type are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Check if slug exists
    const existing = await db.prepare(`
      SELECT id FROM content WHERE slug = ?
    `).bind(slug).first();

    if (existing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Content with this slug already exists'
      }), {
        status: 409,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Get status_id if not provided
    let finalStatusId = status_id;
    if (!finalStatusId) {
      const draftStatus = await db.prepare(`
        SELECT id FROM content_status WHERE slug = 'draft'
      `).first();
      finalStatusId = draftStatus?.id || 1;
    }

    const result = await db.prepare(`
      INSERT INTO content (
        title, slug, content, excerpt, content_type_id, category_id,
        status_id, featured_image, cover_image, tags,
        meta_title, meta_description, meta_keywords,
        scheduled_publish_at, source_url, source_name, source_type,
        is_featured, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(
      title,
      slug,
      content || '',
      excerpt || '',
      content_type_id,
      category_id || null,
      finalStatusId,
      featured_image || '',
      cover_image || '',
      tags || '',
      meta_title || title,
      meta_description || excerpt || '',
      meta_keywords || '',
      scheduled_publish_at || null,
      source_url || '',
      source_name || '',
      source_type || 'original',
      is_featured || 0
    ).run();

    return new Response(JSON.stringify({
      success: true,
      data: { id: result.meta.last_row_id },
      message: 'Content created successfully'
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error creating content:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create content'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};