// GET - Fetch all sources
export async function GET({ locals }) {
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

// POST - Create new source
export async function POST({ request, locals }) {
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
    
    // Validate
    if (!name || !url || !category_id || !type) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Name, URL, category, and type are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (type === 'master') {
      // Insert into sources_master
      const result = await DB.prepare(`
        INSERT INTO sources_master (
          name, url, category_id, description,
          source_type, logo_url, is_active, is_featured
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
      `).bind(
        name, url, category_id,
        description || '', source_type || 'official',
        logo_url || '',
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        is_featured ? 1 : 0
      ).run();
      
      const sourceId = result.meta?.last_row_id || result.lastRowId;
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Universal source created successfully',
        sourceId: sourceId
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } else if (type === 'state') {
      // Insert into sources_state
      const result = await DB.prepare(`
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
      
      const sourceId = result.meta?.last_row_id || result.lastRowId;
      
      return new Response(JSON.stringify({
        success: true,
        message: 'State source created successfully',
        sourceId: sourceId
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