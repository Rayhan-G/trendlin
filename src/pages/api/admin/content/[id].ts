// src/pages/api/admin/content/[id].ts
import type { APIRoute } from 'astro';

export const prerender = false;

// GET - Get single content
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
        c.id,
        c.title,
        c.slug,
        c.content,
        c.excerpt,
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
        c.meta_keywords,
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
      WHERE c.id = ?
    `).bind(id).first();

    if (!result) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Content not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Get resources
    const resources = await db.prepare(`
      SELECT * FROM content_resources WHERE content_id = ? ORDER BY display_order
    `).bind(id).all();

    return new Response(JSON.stringify({
      success: true,
      data: {
        ...result,
        resources: resources.results || []
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

// PUT - Update content
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
      is_featured,
      is_published
    } = data;

    // Check if content exists
    const existing = await db.prepare(`
      SELECT id FROM content WHERE id = ?
    `).bind(id).first();

    if (!existing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Content not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Check slug uniqueness
    if (slug) {
      const slugCheck = await db.prepare(`
        SELECT id FROM content WHERE slug = ? AND id != ?
      `).bind(slug, id).first();

      if (slugCheck) {
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
    }

    await db.prepare(`
      UPDATE content SET
        title = COALESCE(?, title),
        slug = COALESCE(?, slug),
        content = COALESCE(?, content),
        excerpt = COALESCE(?, excerpt),
        content_type_id = COALESCE(?, content_type_id),
        category_id = ?,
        status_id = COALESCE(?, status_id),
        featured_image = COALESCE(?, featured_image),
        cover_image = COALESCE(?, cover_image),
        tags = COALESCE(?, tags),
        meta_title = COALESCE(?, meta_title),
        meta_description = COALESCE(?, meta_description),
        meta_keywords = COALESCE(?, meta_keywords),
        scheduled_publish_at = ?,
        source_url = COALESCE(?, source_url),
        source_name = COALESCE(?, source_name),
        source_type = COALESCE(?, source_type),
        is_featured = COALESCE(?, is_featured),
        is_published = COALESCE(?, is_published),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      title || null,
      slug || null,
      content || null,
      excerpt || null,
      content_type_id || null,
      category_id || null,
      status_id || null,
      featured_image || null,
      cover_image || null,
      tags || null,
      meta_title || null,
      meta_description || null,
      meta_keywords || null,
      scheduled_publish_at || null,
      source_url || null,
      source_name || null,
      source_type || null,
      is_featured !== undefined ? is_featured : null,
      is_published !== undefined ? is_published : null,
      id
    ).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Content updated successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error updating content:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update content'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

// DELETE - Delete content
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

    // Check if content exists
    const existing = await db.prepare(`
      SELECT id FROM content WHERE id = ?
    `).bind(id).first();

    if (!existing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Content not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Delete resources first (cascade will handle it, but let's be explicit)
    await db.prepare(`
      DELETE FROM content_resources WHERE content_id = ?
    `).bind(id).run();

    // Delete content
    await db.prepare(`
      DELETE FROM content WHERE id = ?
    `).bind(id).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Content deleted successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to delete content'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};