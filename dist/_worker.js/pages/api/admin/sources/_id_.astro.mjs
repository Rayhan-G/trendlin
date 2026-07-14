globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../../renderers.mjs';

// API endpoint for individual source operations - GET, PUT, DELETE
async function onRequest(context) {
  const { request, env, params } = context;
  
  if (request.method === 'GET') {
    return await handleGet(params, env);
  }
  
  if (request.method === 'PUT') {
    return await handlePut(request, params, env);
  }
  
  if (request.method === 'DELETE') {
    return await handleDelete(params, env);
  }
  
  return new Response(JSON.stringify({ 
    success: false, 
    error: 'Method not allowed' 
  }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleGet(params, env) {
  try {
    const { id } = params;
    
    // Try to find in state sources first
    let query = `
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
      WHERE s.id = ?
    `;
    
    let result = await env.DB
      .prepare(query)
      .bind(parseInt(id))
      .first();
    
    if (!result) {
      // Try master sources
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
        WHERE s.id = ?
      `;
      
      result = await env.DB
        .prepare(query)
        .bind(parseInt(id))
        .first();
    }
    
    if (!result) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Source not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in source GET:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to fetch source',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handlePut(request, params, env) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const { 
      name, 
      url, 
      category_id, 
      description, 
      source_type,
      logo_url,
      is_active,
      is_featured,
      trust_score,
      state_id,
      address,
      phone,
      email
    } = body;
    
    // First check if source exists and determine type
    let checkQuery = `SELECT id, 'state' as type FROM sources_state WHERE id = ?`;
    let result = await env.DB
      .prepare(checkQuery)
      .bind(parseInt(id))
      .first();
    
    if (!result) {
      checkQuery = `SELECT id, 'master' as type FROM sources_master WHERE id = ?`;
      result = await env.DB
        .prepare(checkQuery)
        .bind(parseInt(id))
        .first();
    }
    
    if (!result) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Source not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const sourceType = result.type;
    
    if (sourceType === 'master') {
      const query = `
        UPDATE sources_master SET
          name = ?,
          url = ?,
          category_id = ?,
          description = ?,
          source_type = ?,
          logo_url = ?,
          is_active = ?,
          is_featured = ?,
          trust_score = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      await env.DB
        .prepare(query)
        .bind(
          name || '',
          url || '',
          parseInt(category_id),
          description || '',
          source_type || 'official',
          logo_url || '',
          is_active !== undefined ? parseInt(is_active) : 1,
          is_featured !== undefined ? parseInt(is_featured) : 0,
          trust_score !== undefined ? parseInt(trust_score) : 0,
          parseInt(id)
        )
        .run();
        
    } else {
      // State source
      const query = `
        UPDATE sources_state SET
          state_id = ?,
          name = ?,
          url = ?,
          category_id = ?,
          description = ?,
          source_type = ?,
          logo_url = ?,
          address = ?,
          phone = ?,
          email = ?,
          is_active = ?,
          is_featured = ?,
          trust_score = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      await env.DB
        .prepare(query)
        .bind(
          state_id ? parseInt(state_id) : null,
          name || '',
          url || '',
          parseInt(category_id),
          description || '',
          source_type || 'official',
          logo_url || '',
          address || '',
          phone || '',
          email || '',
          is_active !== undefined ? parseInt(is_active) : 1,
          is_featured !== undefined ? parseInt(is_featured) : 0,
          trust_score !== undefined ? parseInt(trust_score) : 0,
          parseInt(id)
        )
        .run();
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: { id, ...body } 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in source PUT:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to update source',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleDelete(params, env) {
  try {
    const { id } = params;
    
    // Determine which table to delete from
    let checkQuery = `SELECT id, 'state' as type FROM sources_state WHERE id = ?`;
    let result = await env.DB
      .prepare(checkQuery)
      .bind(parseInt(id))
      .first();
    
    if (!result) {
      checkQuery = `SELECT id, 'master' as type FROM sources_master WHERE id = ?`;
      result = await env.DB
        .prepare(checkQuery)
        .bind(parseInt(id))
        .first();
    }
    
    if (!result) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Source not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const sourceType = result.type;
    
    if (sourceType === 'master') {
      await env.DB
        .prepare('DELETE FROM sources_master WHERE id = ?')
        .bind(parseInt(id))
        .run();
    } else {
      await env.DB
        .prepare('DELETE FROM sources_state WHERE id = ?')
        .bind(parseInt(id))
        .run();
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: { id, deleted: true } 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in source DELETE:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to delete source',
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
