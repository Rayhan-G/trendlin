// ============================================
// API: /api/admin/templates
// GET - List all templates (with optional category filter)
// POST - Create new template
// ============================================

export async function GET({ locals, url }) {
  try {
    const { DB } = locals.runtime.env;
    const category = url.searchParams.get('category');
    
    let query = `
      SELECT 
        id, name, category, content, description,
        thumbnail_url, is_active, usage_count,
        created_at, updated_at
      FROM templates
    `;
    
    const params = [];
    
    if (category) {
      query += ` WHERE category = ?`;
      params.push(category);
    }
    
    query += ` ORDER BY category, name ASC`;
    
    const result = await DB.prepare(query).bind(...params).all();
    
    return new Response(JSON.stringify({
      success: true,
      templates: result.results || []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error fetching templates:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST({ request, locals }) {
  try {
    const { DB } = locals.runtime.env;
    const data = await request.json();
    
    const { name, category, content, description, thumbnail_url, is_active } = data;
    
    // Validate required fields
    if (!name || !category || !content) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Name, category, and content are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if template with same name in category exists
    const existing = await DB.prepare(`
      SELECT id FROM templates WHERE name = ? AND category = ?
    `).bind(name, category).first();
    
    if (existing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'A template with this name already exists in this category'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Insert template
    const result = await DB.prepare(`
      INSERT INTO templates (
        name, category, content, description,
        thumbnail_url, is_active
      )
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING id
    `).bind(
      name, category, content, 
      description || '', thumbnail_url || '',
      is_active !== undefined ? (is_active ? 1 : 0) : 1
    ).run();
    
    const templateId = result.meta?.last_row_id || result.lastRowId;
    
    // Get the newly created template
    const newTemplate = await DB.prepare(`
      SELECT 
        id, name, category, content, description,
        thumbnail_url, is_active, usage_count,
        created_at, updated_at
      FROM templates WHERE id = ?
    `).bind(templateId).first();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Template created successfully',
      template: newTemplate
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error creating template:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}