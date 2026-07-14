// API endpoint for US states - GET, POST, PUT, DELETE
// Cloudflare Workers with D1

export async function onRequest(context) {
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
    const region = url.searchParams.get('region');
    const isActive = url.searchParams.get('is_active');
    const search = url.searchParams.get('search');
    
    let query = `
      SELECT 
        id,
        name,
        code,
        abbreviation,
        region,
        is_active,
        created_at,
        updated_at,
        (
          SELECT COUNT(*) 
          FROM sources_state 
          WHERE state_id = sources_states.id AND is_active = 1
        ) as source_count
      FROM sources_states
      WHERE 1=1
    `;
    
    const params = [];
    
    if (region) {
      query += ` AND region = ?`;
      params.push(region);
    }
    
    if (isActive !== null && isActive !== undefined) {
      query += ` AND is_active = ?`;
      params.push(isActive === 'true' || isActive === '1' ? 1 : 0);
    }
    
    if (search) {
      query += ` AND (name LIKE ? OR code LIKE ? OR abbreviation LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    query += ` ORDER BY name ASC`;
    
    const result = await env.DB
      .prepare(query)
      .bind(...params)
      .all();
    
    return new Response(JSON.stringify({ success: true, data: result.results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in states GET:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to fetch states',
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
      code, 
      abbreviation, 
      region = '', 
      is_active = 1
    } = body;
    
    // Validate required fields
    if (!name || !code || !abbreviation) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Name, code, and abbreviation are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check for duplicate code or abbreviation
    const existing = await env.DB
      .prepare('SELECT id FROM sources_states WHERE code = ? OR abbreviation = ?')
      .bind(code, abbreviation)
      .first();
    
    if (existing) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'State with this code or abbreviation already exists' 
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const query = `
      INSERT INTO sources_states (
        name, code, abbreviation, region, is_active
      ) VALUES (?, ?, ?, ?, ?)
    `;
    
    const result = await env.DB
      .prepare(query)
      .bind(name, code, abbreviation, region, is_active)
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
    console.error('Error in states POST:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to create state',
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
    const { id, name, code, abbreviation, region, is_active } = body;
    
    if (!id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'State ID is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const query = `
      UPDATE sources_states SET
        name = ?,
        code = ?,
        abbreviation = ?,
        region = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await env.DB
      .prepare(query)
      .bind(
        name || '',
        code || '',
        abbreviation || '',
        region || '',
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
    console.error('Error in states PUT:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to update state',
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
        error: 'State ID is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if state has sources
    const usage = await env.DB
      .prepare('SELECT COUNT(*) as count FROM sources_state WHERE state_id = ?')
      .bind(id)
      .first();
    
    if (usage && usage.count > 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Cannot delete state that has sources associated with it' 
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    await env.DB
      .prepare('DELETE FROM sources_states WHERE id = ?')
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
    console.error('Error in states DELETE:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to delete state',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}