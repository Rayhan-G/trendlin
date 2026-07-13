// ============================================
// API: Sources Management
// ============================================

// GET - List all sources
export async function GET({ locals }) {
  try {
    const { DB } = locals.runtime.env;
    
    const result = await DB.prepare(`
      SELECT * FROM sources 
      ORDER BY category ASC, name ASC
    `).all();
    
    const sources = result.results || [];
    
    return new Response(JSON.stringify({
      success: true,
      sources: sources,
      count: sources.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST - Add a new source
export async function POST({ request, locals }) {
  try {
    const { DB } = locals.runtime.env;
    const data = await request.json();
    
    const { name, url, category, description, source_type, logo_url } = data;
    
    if (!name || !url || !category) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Name, URL, and category are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const result = await DB.prepare(`
      INSERT INTO sources (name, url, category, description, source_type, logo_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(name, url, category, description || '', source_type || 'official', logo_url || '').run();
    
    const newSource = await DB.prepare('SELECT * FROM sources WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first();
    
    return new Response(JSON.stringify({
      success: true,
      source: newSource
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// DELETE - Delete a source
export async function DELETE({ request, locals }) {
  try {
    const { DB } = locals.runtime.env;
    const data = await request.json();
    const { id } = data;
    
    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Source ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    await DB.prepare('DELETE FROM sources WHERE id = ?')
      .bind(id)
      .run();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Source deleted successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// PUT - Update a source
export async function PUT({ request, locals }) {
  try {
    const { DB } = locals.runtime.env;
    const data = await request.json();
    const { id, name, url, category, description, source_type, logo_url, is_active } = data;
    
    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Source ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    await DB.prepare(`
      UPDATE sources 
      SET name = ?, url = ?, category = ?, description = ?, source_type = ?, logo_url = ?, is_active = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(name, url, category, description || '', source_type || 'official', logo_url || '', is_active !== undefined ? is_active : 1, id).run();
    
    const updatedSource = await DB.prepare('SELECT * FROM sources WHERE id = ?')
      .bind(id)
      .first();
    
    return new Response(JSON.stringify({
      success: true,
      source: updatedSource
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}