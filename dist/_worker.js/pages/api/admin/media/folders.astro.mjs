globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../../renderers.mjs';

// ============================================
// API: Manage Media Folders
// ============================================

// POST - Create a folder
async function POST({ request, locals }) {
  try {
    const { DB } = locals.runtime.env;
    const data = await request.json();
    const { folder, name } = data;
    
    if (!folder || !name) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Folder path and name are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if folder already exists
    const existing = await DB.prepare(
      "SELECT id FROM media WHERE folder = ? LIMIT 1"
    ).bind(folder).first();
    
    if (existing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Folder already exists'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create a placeholder file to represent the folder
    const result = await DB.prepare(`
      INSERT INTO media (
        filename, 
        original_name, 
        url, 
        file_size, 
        mime_type, 
        folder, 
        created_at, 
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      `${folder}/.folder`,
      '.folder',
      '',
      0,
      'application/x-folder',
      folder
    ).run();

    return new Response(JSON.stringify({
      success: true,
      folder: folder,
      name: name,
      id: result.meta.last_row_id
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error creating folder:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to create folder'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// DELETE - Delete a folder and all its contents
async function DELETE({ request, locals }) {
  try {
    const { R2_BUCKET, R2, DB } = locals.runtime.env;
    const R2_BINDING = R2_BUCKET || R2;
    
    const data = await request.json();
    const { folder } = data;
    
    if (!folder) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Folder path is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get all files in this folder
    const files = await DB.prepare(
      "SELECT id, filename FROM media WHERE folder = ?"
    ).bind(folder).all();
    
    // Delete from R2
    if (R2_BINDING) {
      for (const file of files.results || []) {
        try {
          await R2_BINDING.delete(file.filename);
        } catch (e) {
          console.error('Failed to delete from R2:', file.filename, e);
        }
      }
    }
    
    // Delete from database
    await DB.prepare("DELETE FROM media WHERE folder = ?")
      .bind(folder)
      .run();

    return new Response(JSON.stringify({
      success: true,
      message: `Folder "${folder}" deleted successfully`
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error deleting folder:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to delete folder'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
