// ============================================
// API: /api/admin/templates/:id
// GET - Get single template
// PUT - Update template
// DELETE - Delete template
// ============================================

export async function GET({ params, locals }) {
  try {
    const { DB } = locals.runtime.env;
    const { id } = params;
    
    const template = await DB.prepare(`
      SELECT 
        id, name, category, content, description,
        thumbnail_url, is_active, usage_count,
        created_at, updated_at
      FROM templates WHERE id = ?
    `).bind(id).first();
    
    if (!template) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Template not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      template: template
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error fetching template:', error);
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
    
    // Check if template exists
    const existing = await DB.prepare(`
      SELECT id FROM templates WHERE id = ?
    `).bind(id).first();
    
    if (!existing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Template not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if another template has same name in category
    const duplicate = await DB.prepare(`
      SELECT id FROM templates 
      WHERE name = ? AND category = ? AND id != ?
    `).bind(name, category, id).first();
    
    if (duplicate) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Another template with this name already exists in this category'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Update template
    await DB.prepare(`
      UPDATE templates SET
        name = ?,
        category = ?,
        content = ?,
        description = ?,
        thumbnail_url = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      name, category, content,
      description || '', thumbnail_url || '',
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      id
    ).run();
    
    // Get updated template
    const updatedTemplate = await DB.prepare(`
      SELECT 
        id, name, category, content, description,
        thumbnail_url, is_active, usage_count,
        created_at, updated_at
      FROM templates WHERE id = ?
    `).bind(id).first();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Template updated successfully',
      template: updatedTemplate
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error updating template:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE({ params, locals }) {
  try {
    const { DB } = locals.runtime.env;
    const { id } = params;
    
    // Check if template exists
    const existing = await DB.prepare(`
      SELECT id FROM templates WHERE id = ?
    `).bind(id).first();
    
    if (!existing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Template not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Delete template
    await DB.prepare(`
      DELETE FROM templates WHERE id = ?
    `).bind(id).run();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Template deleted successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error deleting template:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}