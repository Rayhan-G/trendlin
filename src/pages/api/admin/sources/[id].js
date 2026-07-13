// ============================================
// API: /api/admin/sources/:id
// GET - Get single source
// PUT - Update source
// DELETE - Delete source
// ============================================

export async function GET({ params, locals }) {
  try {
    const { DB } = locals.runtime.env;
    const { id } = params;
    
    // Try to find in master sources
    let source = await DB.prepare(`
      SELECT 
        sm.id, sm.name, sm.url, sm.category_id,
        sm.description, sm.source_type, sm.logo_url,
        sm.is_active, sm.is_featured, sm.trust_score,
        sm.usage_count, sm.created_at,
        sc.name as category_name,
        sc.icon as category_icon,
        'master' as source_type
      FROM sources_master sm
      LEFT JOIN sources_categories sc ON sc.id = sm.category_id
      WHERE sm.id = ?
    `).bind(id).first();
    
    let sourceType = 'master';
    
    if (!source) {
      // Try state sources
      source = await DB.prepare(`
        SELECT 
          ss.id, ss.name, ss.url, ss.category_id,
          ss.description, ss.source_type, ss.logo_url,
          ss.is_active, ss.is_featured, ss.trust_score,
          ss.usage_count, ss.address, ss.phone, ss.email,
          ss.created_at,
          sc.name as category_name,
          sc.icon as category_icon,
          st.name as state_name,
          st.code as state_code,
          ss.state_id,
          'state' as source_type
        FROM sources_state ss
        LEFT JOIN sources_categories sc ON sc.id = ss.category_id
        LEFT JOIN sources_states st ON st.id = ss.state_id
        WHERE ss.id = ?
      `).bind(id).first();
      sourceType = 'state';
    }
    
    if (!source) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Source not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      source: source,
      type: sourceType
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error fetching source:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT({ params, request, locals }) {
  try {
    const { DB } = locals.runtime.env;
    const { id } = params;
    const data = await request.json();
    
    const {
      type,
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
    if (!name || !url || !category_id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Name, URL, and category are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (type === 'master') {
      // Check if source exists
      const existing = await DB.prepare(`
        SELECT id FROM sources_master WHERE id = ?
      `).bind(id).first();
      
      if (!existing) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Source not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Check for duplicate name
      const duplicate = await DB.prepare(`
        SELECT id FROM sources_master WHERE name = ? AND id != ?
      `).bind(name, id).first();
      
      if (duplicate) {
        return new Response(JSON.stringify({
          success: false,
          error: 'A source with this name already exists'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Update master source
      await DB.prepare(`
        UPDATE sources_master SET
          name = ?,
          url = ?,
          category_id = ?,
          description = ?,
          source_type = ?,
          logo_url = ?,
          is_active = ?,
          is_featured = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        name, url, category_id,
        description || '', source_type || 'official',
        logo_url || '',
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        is_featured ? 1 : 0,
        id
      ).run();
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Universal source updated successfully'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } else if (type === 'state') {
      // Check if source exists
      const existing = await DB.prepare(`
        SELECT id FROM sources_state WHERE id = ?
      `).bind(id).first();
      
      if (!existing) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Source not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (!state_id) {
        return new Response(JSON.stringify({
          success: false,
          error: 'State ID is required for state sources'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Check for duplicate name in same state
      const duplicate = await DB.prepare(`
        SELECT id FROM sources_state 
        WHERE name = ? AND state_id = ? AND id != ?
      `).bind(name, state_id, id).first();
      
      if (duplicate) {
        return new Response(JSON.stringify({
          success: false,
          error: 'A source with this name already exists for this state'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Update state source
      await DB.prepare(`
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
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        state_id, name, url, category_id,
        description || '', source_type || 'official',
        logo_url || '', address || '', phone || '', email || '',
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        is_featured ? 1 : 0,
        id
      ).run();
      
      return new Response(JSON.stringify({
        success: true,
        message: 'State source updated successfully'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid source type. Must be "master" or "state"'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
  } catch (error) {
    console.error('Error updating source:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE({ params, request, locals }) {
  try {
    const { DB } = locals.runtime.env;
    const { id } = params;
    const data = await request.json();
    const { type } = data;
    
    if (!type || !['master', 'state'].includes(type)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Source type is required (master or state)'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const table = type === 'master' ? 'sources_master' : 'sources_state';
    
    // Check if source exists
    const existing = await DB.prepare(`
      SELECT id FROM ${table} WHERE id = ?
    `).bind(id).first();
    
    if (!existing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Source not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Delete source
    await DB.prepare(`
      DELETE FROM ${table} WHERE id = ?
    `).bind(id).run();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Source deleted successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error deleting source:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}