import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const env = locals.runtime?.env || (globalThis as any).env;
    
    if (!env || !env.DB) {
      return new Response(JSON.stringify({ 
        success: true, 
        data: [] 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get all master sources with category info (including NULL categories)
    const master = await env.DB.prepare(`
      SELECT 
        m.id,
        m.name,
        m.url,
        m.category_id,
        m.description,
        m.source_type,
        m.logo_url,
        m.is_active,
        m.is_featured,
        m.trust_score,
        m.usage_count,
        COALESCE(c.name, 'Uncategorized') as category_name,
        COALESCE(c.icon, '📁') as category_icon,
        NULL as state_id,
        NULL as state_name,
        NULL as state_code,
        'master' as source_type_actual
      FROM sources_master m
      LEFT JOIN sources_categories c ON m.category_id = c.id
      WHERE m.is_active = 1
      ORDER BY m.is_featured DESC, m.trust_score DESC, m.name ASC
    `).all();
    
    // Get all state sources with category info (including NULL categories)
    const state = await env.DB.prepare(`
      SELECT 
        ss.id,
        ss.name,
        ss.url,
        ss.category_id,
        ss.description,
        ss.source_type,
        ss.logo_url,
        ss.is_active,
        ss.is_featured,
        ss.trust_score,
        ss.usage_count,
        ss.address,
        ss.phone,
        ss.email,
        COALESCE(c.name, 'Uncategorized') as category_name,
        COALESCE(c.icon, '📁') as category_icon,
        s.id as state_id,
        s.name as state_name,
        s.code as state_code,
        'state' as source_type_actual
      FROM sources_state ss
      LEFT JOIN sources_categories c ON ss.category_id = c.id
      LEFT JOIN sources_states s ON ss.state_id = s.id
      WHERE ss.is_active = 1
      ORDER BY ss.is_featured DESC, ss.trust_score DESC, ss.name ASC
    `).all();
    
    // Combine both
    const allSources = [...(master.results || []), ...(state.results || [])];
    
    console.log('✅ Returning', allSources.length, 'sources');
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: allSources,
      debug: {
        master_count: master.results?.length || 0,
        state_count: state.results?.length || 0,
        total: allSources.length
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: (error as Error).message,
      data: []
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
        error: 'Database not available' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
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
      source_type_actual = 'master'
    } = body;
    
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
      result = await env.DB.prepare(`
        INSERT INTO sources_master (
          name, url, category_id, description, source_type, 
          logo_url, is_active, is_featured, trust_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        name, 
        url, 
        parseInt(category_id), 
        description || '', 
        source_type,
        logo_url || '', 
        parseInt(is_active), 
        parseInt(is_featured), 
        parseInt(trust_score) || 0
      ).run();
    } else {
      const { state_id, address, phone, email } = body;
      if (!state_id) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'State ID is required for state sources' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      result = await env.DB.prepare(`
        INSERT INTO sources_state (
          state_id, name, url, category_id, description, source_type,
          logo_url, is_active, is_featured, trust_score,
          address, phone, email
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
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
      ).run();
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      id: result.lastID || result.meta?.last_row_id,
      message: 'Source created successfully'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: (error as Error).message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};