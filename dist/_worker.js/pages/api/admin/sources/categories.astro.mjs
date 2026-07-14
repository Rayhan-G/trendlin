globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../../renderers.mjs';

// API endpoint for sources categories - GET, POST, PUT, DELETE
// Cloudflare Workers with D1

async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method === 'GET') {
    return await handleGet(request, env);
  }
  
  if (request.method === 'POST') {
    return await handlePost(request, env);
  }
  
  if (request.method === 'PUT') {
    return await handlePut(request, env);
  }
  
  if (request.method === 'DELETE') {
    return await handleDelete(request, env);
  }
  
  return new Response(JSON.stringify({ 
    success: false, 
    error: 'Method not allowed' 
  }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleGet(request, env) {
  try {
    const url = new URL(request.url);
    const isActive = url.searchParams.get('is_active');
    const search = url.searchParams.get('search');
    
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
    
    const params = [];
    
    if (isActive !== null && isActive !== undefined) {
      query += ` AND is_active = ?`;
      params.push(isActive === 'true' || isActive === '1' ? 1 : 0);
    }
    
    if (search) {
      query += ` AND (name LIKE ? OR description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ` ORDER BY display_order ASC, name ASC`;
    
    const result = await env.DB
      .prepare(query)
      .bind(...params)
      .all();
    
    return new Response(JSON.stringify({ success: true, data: result.results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in categories GET:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to fetch categories',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handlePost(request, env) {
  try {
    const body = await request.json();
    
    const { 
      name, 
      slug, 
      icon = '📁', 
      description = '', 
      display_order = 0,
      is_active = 1
    } = body;
    
    // Validate required fields
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
    
    const query = `
      INSERT INTO sources_categories (
        name, slug, icon, description, display_order, is_active
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const result = await env.DB
      .prepare(query)
      .bind(name, slug, icon, description, display_order, is_active)
      .run();
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: { 
        id: result.meta?.last_row_id || result.lastID,
        ...body 
      } 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in categories POST:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to create category',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handlePut(request, env) {
  try {
    const body = await request.json();
    const { id, name, slug, icon, description, display_order, is_active } = body;
    
    if (!id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Category ID is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const query = `
      UPDATE sources_categories SET
        name = ?,
        slug = ?,
        icon = ?,
        description = ?,
        display_order = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await env.DB
      .prepare(query)
      .bind(
        name || '',
        slug || '',
        icon || '📁',
        description || '',
        display_order || 0,
        is_active !== undefined ? is_active : 1,
        id
      )
      .run();
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: { id, ...body } 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in categories PUT:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to update category',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleDelete(request, env) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
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
    const usageQuery = `
      SELECT 
        (SELECT COUNT(*) FROM sources_state WHERE category_id = ?) +
        (SELECT COUNT(*) FROM sources_master WHERE category_id = ?) as usage_count
    `;
    const usage = await env.DB
      .prepare(usageQuery)
      .bind(id, id)
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
    
    await env.DB
      .prepare('DELETE FROM sources_categories WHERE id = ?')
      .bind(id)
      .run();
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: { id, deleted: true } 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in categories DELETE:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to delete category',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  onRequest
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
