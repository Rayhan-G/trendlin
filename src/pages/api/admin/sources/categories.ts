// /src/pages/api/admin/sources/categories.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const isActive = url.searchParams.get('is_active');
    const search = url.searchParams.get('search');
    
    const env = locals.runtime?.env || (globalThis as any).env;
    
    if (!env || !env.DB) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Database connection not available' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    let query = `
      SELECT 
        id,
        name,
        slug,
        icon,
        description,
        display_order,
        is_active,
        created_at,
        updated_at,
        (
          SELECT COUNT(*) 
          FROM sources_state 
          WHERE category_id = sources_categories.id AND is_active = 1
        ) + (
          SELECT COUNT(*) 
          FROM sources_master 
          WHERE category_id = sources_categories.id AND is_active = 1
        ) as source_count
      FROM sources_categories
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (isActive !== null && isActive !== undefined) {
      query += ` AND is_active = ?`;
      params.push(isActive === 'true' || isActive === '1' ? 1 : 0);
    }
    
    if (search) {
      query += ` AND (name LIKE ? OR description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ` ORDER BY display_order ASC, name ASC`;
    
    const result = await env.DB.prepare(query).bind(...params).all();
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: result.results || [] 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error fetching categories:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to fetch categories: ' + (error as Error).message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const env = locals.runtime?.env || (globalThis as any).env;
    
    if (!env || !env.DB) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Database connection not available' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { 
      name, 
      slug, 
      icon = '📁', 
      description = '', 
      display_order = 0,
      is_active = 1
    } = body;
    
    if (!name || !slug) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Name and slug are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check for duplicate slug
    const existing = await env.DB
      .prepare('SELECT id FROM sources_categories WHERE slug = ?')
      .bind(slug)
      .first();
    
    if (existing) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Category with this slug already exists' 
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const result = await env.DB.prepare(`
      INSERT INTO sources_categories (
        name, slug, icon, description, display_order, is_active
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(name, slug, icon, description, parseInt(display_order), parseInt(is_active)).run();
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: { 
        id: result.lastID || result.meta?.last_row_id,
        ...body 
      } 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error creating category:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to create category: ' + (error as Error).message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { id, name, slug, icon, description, display_order, is_active } = body;
    const env = locals.runtime?.env || (globalThis as any).env;
    
    if (!env || !env.DB) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Database connection not available' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!id) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Category ID is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const result = await env.DB.prepare(`
      UPDATE sources_categories SET
        name = ?,
        slug = ?,
        icon = ?,
        description = ?,
        display_order = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      name || '',
      slug || '',
      icon || '📁',
      description || '',
      display_order !== undefined ? parseInt(display_order) : 0,
      is_active !== undefined ? parseInt(is_active) : 1,
      parseInt(id)
    ).run();
    
    if (result.changes === 0) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Category not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: { id, ...body } 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error updating category:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to update category: ' + (error as Error).message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const env = locals.runtime?.env || (globalThis as any).env;
    
    if (!env || !env.DB) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Database connection not available' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!id) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Category ID is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if category is in use
    const usage = await env.DB
      .prepare(`
        SELECT 
          (SELECT COUNT(*) FROM sources_state WHERE category_id = ?) +
          (SELECT COUNT(*) FROM sources_master WHERE category_id = ?) as usage_count
      `)
      .bind(parseInt(id), parseInt(id))
      .first();
    
    if (usage && usage.usage_count > 0) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Cannot delete category that is in use by sources' 
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const result = await env.DB
      .prepare('DELETE FROM sources_categories WHERE id = ?')
      .bind(parseInt(id))
      .run();
    
    if (result.changes === 0) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Category not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: { id, deleted: true } 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error deleting category:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to delete category: ' + (error as Error).message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};