globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../renderers.mjs';

// API endpoint for sources - GET (list) and POST (create)
async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method === 'GET') {
    return await handleGet(request, env);
  }
  
  if (request.method === 'POST') {
    return await handlePost(request, env);
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
    const categoryId = url.searchParams.get('category');
    const stateId = url.searchParams.get('state');
    const search = url.searchParams.get('search');
    const type = url.searchParams.get('type') || 'all';
    const featured = url.searchParams.get('featured') === 'true';
    
    let query = '';
    const params = [];
    
    if (type === 'master') {
      query = `
        SELECT 
          s.id,
          s.name,
          s.url,
          s.category_id,
          s.description,
          s.source_type,
          s.logo_url,
          s.is_active,
          s.is_featured,
          s.trust_score,
          s.usage_count,
          c.name as category_name,
          c.icon as category_icon,
          NULL as state_id,
          NULL as state_name,
          NULL as state_code,
          'master' as source_type_actual
        FROM sources_master s
        JOIN sources_categories c ON s.category_id = c.id
        WHERE 1=1
      `;
      
      if (categoryId) {
        query += ` AND s.category_id = ?`;
        params.push(parseInt(categoryId));
      }
      
      if (search) {
        query += ` AND (s.name LIKE ? OR s.description LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }
      
      if (featured) {
        query += ` AND s.is_featured = 1`;
      }
      
      query += ` ORDER BY s.is_featured DESC, s.trust_score DESC, s.name ASC`;
      
    } else if (type === 'state') {
      query = `
        SELECT 
          s.id,
          s.name,
          s.url,
          s.category_id,
          s.description,
          s.source_type,
          s.logo_url,
          s.is_active,
          s.is_featured,
          s.trust_score,
          s.usage_count,
          s.address,
          s.phone,
          s.email,
          c.name as category_name,
          c.icon as category_icon,
          st.id as state_id,
          st.name as state_name,
          st.code as state_code,
          'state' as source_type_actual
        FROM sources_state s
        JOIN sources_categories c ON s.category_id = c.id
        LEFT JOIN sources_states st ON s.state_id = st.id
        WHERE 1=1
      `;
      
      if (categoryId) {
        query += ` AND s.category_id = ?`;
        params.push(parseInt(categoryId));
      }
      
      if (stateId) {
        query += ` AND s.state_id = ?`;
        params.push(parseInt(stateId));
      }
      
      if (search) {
        query += ` AND (s.name LIKE ? OR s.description LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }
      
      if (featured) {
        query += ` AND s.is_featured = 1`;
      }
      
      query += ` ORDER BY s.is_featured DESC, s.trust_score DESC, s.name ASC`;
      
    } else {
      // 'all' - combine both using UNION
      const masterQuery = `
        SELECT 
          s.id,
          s.name,
          s.url,
          s.category_id,
          s.description,
          s.source_type,
          s.logo_url,
          s.is_active,
          s.is_featured,
          s.trust_score,
          s.usage_count,
          c.name as category_name,
          c.icon as category_icon,
          NULL as state_id,
          NULL as state_name,
          NULL as state_code,
          'master' as source_type_actual,
          NULL as address,
          NULL as phone,
          NULL as email
        FROM sources_master s
        JOIN sources_categories c ON s.category_id = c.id
        WHERE 1=1
      `;
      
      const stateQuery = `
        SELECT 
          s.id,
          s.name,
          s.url,
          s.category_id,
          s.description,
          s.source_type,
          s.logo_url,
          s.is_active,
          s.is_featured,
          s.trust_score,
          s.usage_count,
          s.address,
          s.phone,
          s.email,
          c.name as category_name,
          c.icon as category_icon,
          st.id as state_id,
          st.name as state_name,
          st.code as state_code,
          'state' as source_type_actual
        FROM sources_state s
        JOIN sources_categories c ON s.category_id = c.id
        LEFT JOIN sources_states st ON s.state_id = st.id
        WHERE 1=1
      `;
      
      let whereClause = '';
      const unionParams = [];
      
      if (categoryId) {
        whereClause = ` AND category_id = ?`;
        unionParams.push(parseInt(categoryId));
      }
      
      if (stateId) {
        whereClause += ` AND state_id = ?`;
        unionParams.push(parseInt(stateId));
      }
      
      if (search) {
        whereClause += ` AND (name LIKE ? OR description LIKE ?)`;
        unionParams.push(`%${search}%`, `%${search}%`);
      }
      
      if (featured) {
        whereClause += ` AND is_featured = 1`;
      }
      
      query = `(${masterQuery}${whereClause}) UNION ALL (${stateQuery}${whereClause}) ORDER BY is_featured DESC, trust_score DESC, name ASC`;
      params.push(...unionParams, ...unionParams);
    }
    
    const result = await env.DB.prepare(query).bind(...params).all();
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: result.results || [] 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in sources GET:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to fetch sources',
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
      url, 
      category_id, 
      description, 
      source_type = 'official',
      logo_url = '',
      is_active = 1,
      is_featured = 0,
      trust_score = 0,
      state_id = null,
      source_type_actual = 'state',
      address = '',
      phone = '',
      email = ''
    } = body;
    
    // Validate required fields
    if (!name || !url || !category_id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Name, URL, and category are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    let result;
    
    if (source_type_actual === 'master') {
      // Insert into master sources
      const query = `
        INSERT INTO sources_master (
          name, url, category_id, description, source_type, 
          logo_url, is_active, is_featured, trust_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      result = await env.DB
        .prepare(query)
        .bind(name, url, parseInt(category_id), description || '', source_type,
          logo_url || '', parseInt(is_active), parseInt(is_featured), parseInt(trust_score) || 0)
        .run();
        
    } else {
      // Insert into state sources
      if (!state_id) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'State ID is required for state sources' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Check for duplicate per state
      const checkQuery = `SELECT id FROM sources_state WHERE state_id = ? AND name = ?`;
      const existing = await env.DB
        .prepare(checkQuery)
        .bind(parseInt(state_id), name)
        .first();
      
      if (existing) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'A source with this name already exists in this state' 
        }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const query = `
        INSERT INTO sources_state (
          state_id, name, url, category_id, description, source_type,
          logo_url, is_active, is_featured, trust_score,
          address, phone, email
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      result = await env.DB
        .prepare(query)
        .bind(
          parseInt(state_id), 
          name, 
          url, 
          parseInt(category_id), 
          description || '', 
          source_type,
          logo_url || '', 
          parseInt(is_active), 
          parseInt(is_featured), 
          parseInt(trust_score) || 0,
          address || '', 
          phone || '', 
          email || ''
        )
        .run();
    }
    
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
    console.error('Error in sources POST:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to create source',
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
