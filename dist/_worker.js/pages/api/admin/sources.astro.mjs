globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../renderers.mjs';

// ============================================
// API: /api/admin/sources
// GET - List all sources (master + state)
// POST - Create new source (master or state)
// ============================================

async function GET({ locals }) {
  try {
    const { DB } = locals.runtime.env;
    
    // Fetch master sources with category info
    const masterResult = await DB.prepare(`
      SELECT 
        sm.id,
        sm.name,
        sm.url,
        sm.category_id,
        sm.description,
        sm.source_type,
        sm.logo_url,
        sm.is_active,
        sm.is_featured,
        sm.trust_score,
        sm.usage_count,
        sm.created_at,
        sc.name as category_name,
        sc.icon as category_icon,
        'master' as source_type
      FROM sources_master sm
      LEFT JOIN sources_categories sc ON sc.id = sm.category_id
      WHERE sm.is_active = 1 OR sm.is_active = 0
      ORDER BY sm.name ASC
    `).all();
    
    // Fetch state sources with category and state info
    const stateResult = await DB.prepare(`
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
        ss.created_at,
        sc.name as category_name,
        sc.icon as category_icon,
        st.name as state_name,
        st.code as state_code,
        st.abbreviation as state_abbr,
        'state' as source_type
      FROM sources_state ss
      LEFT JOIN sources_categories sc ON sc.id = ss.category_id
      LEFT JOIN sources_states st ON st.id = ss.state_id
      WHERE ss.is_active = 1 OR ss.is_active = 0
      ORDER BY st.name ASC, ss.name ASC
    `).all();
    
    return new Response(JSON.stringify({
      success: true,
      master: masterResult.results || [],
      state: stateResult.results || []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error fetching sources:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function POST({ request, locals }) {
  try {
    const { DB } = locals.runtime.env;
    const data = await request.json();
    
    const {
      type, // 'master' or 'state'
      name,
      url,
      category_id,
      description,
      source_type,
      logo_url,
      is_active,
      is_featured,
      state_id,
      address,
      phone,
      email
    } = data;
    
    // Validate required fields
    if (!name || !url || !category_id || !type) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Name, URL, category, and type are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate type
    if (!['master', 'state'].includes(type)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Type must be "master" or "state"'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // For state sources, state_id is required
    if (type === 'state' && !state_id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'State ID is required for state sources'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    let result;
    let sourceId;
    
    if (type === 'master') {
      // Check if source with same name exists
      const existing = await DB.prepare(`
        SELECT id FROM sources_master WHERE name = ?
      `).bind(name).first();
      
      if (existing) {
        return new Response(JSON.stringify({
          success: false,
          error: 'A source with this name already exists'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Insert master source
      result = await DB.prepare(`
        INSERT INTO sources_master (
          name, url, category_id, description,
          source_type, logo_url, is_active, is_featured
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
      `).bind(
        name, url, category_id,
        description || '', logo_url || '',
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        is_featured ? 1 : 0
      ).run();
      
      sourceId = result.meta?.last_row_id || result.lastRowId;
      
      // Get the newly created source
      const newSource = await DB.prepare(`
        SELECT 
          sm.id, sm.name, sm.url, sm.category_id,
          sm.description, sm.source_type, sm.logo_url,
          sm.is_active, sm.is_featured, sm.trust_score,
          sm.usage_count, sm.created_at,
          sc.name as category_name,
          sc.icon as category_icon
        FROM sources_master sm
        LEFT JOIN sources_categories sc ON sc.id = sm.category_id
        WHERE sm.id = ?
      `).bind(sourceId).first();
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Universal source created successfully',
        source: { ...newSource, source_type: 'master' }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } else {
      // STATE SOURCE
      // Check if source with same name exists for this state
      const existing = await DB.prepare(`
        SELECT id FROM sources_state 
        WHERE name = ? AND state_id = ?
      `).bind(name, state_id).first();
      
      if (existing) {
        return new Response(JSON.stringify({
          success: false,
          error: 'A source with this name already exists for this state'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Insert state source
      result = await DB.prepare(`
        INSERT INTO sources_state (
          state_id, name, url, category_id, description,
          source_type, logo_url, address, phone, email,
          is_active, is_featured
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
      `).bind(
        state_id, name, url, category_id,
        description || '', source_type || 'official',
        logo_url || '', address || '', phone || '', email || '',
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        is_featured ? 1 : 0
      ).run();
      
      sourceId = result.meta?.last_row_id || result.lastRowId;
      
      // Get the newly created source
      const newSource = await DB.prepare(`
        SELECT 
          ss.id, ss.name, ss.url, ss.category_id,
          ss.description, ss.source_type, ss.logo_url,
          ss.is_active, ss.is_featured, ss.trust_score,
          ss.usage_count, ss.address, ss.phone, ss.email,
          ss.created_at,
          sc.name as category_name,
          sc.icon as category_icon,
          st.name as state_name,
          st.code as state_code
        FROM sources_state ss
        LEFT JOIN sources_categories sc ON sc.id = ss.category_id
        LEFT JOIN sources_states st ON st.id = ss.state_id
        WHERE ss.id = ?
      `).bind(sourceId).first();
      
      return new Response(JSON.stringify({
        success: true,
        message: 'State source created successfully',
        source: { ...newSource, source_type: 'state' }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
  } catch (error) {
    console.error('Error creating source:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
