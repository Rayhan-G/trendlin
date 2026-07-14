globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../renderers.mjs';

// ============================================
// API: Media Management with Folders
// ============================================

// GET - List all media with folders
async function GET({ locals }) {
  try {
    const { DB } = locals.runtime.env;
    
    // Get all media (exclude hidden folder placeholders)
    const result = await DB.prepare(`
      SELECT * FROM media 
      WHERE filename NOT LIKE '%.folder'
      ORDER BY folder ASC, created_at DESC
    `).all();
    
    const media = result.results || [];
    
    // Get unique folders
    const foldersResult = await DB.prepare(`
      SELECT DISTINCT folder FROM media 
      WHERE folder != '' AND folder IS NOT NULL
      ORDER BY folder ASC
    `).all();
    
    const folders = foldersResult.results?.map(f => f.folder).filter(Boolean) || [];
    
    return new Response(JSON.stringify({
      success: true,
      media: media,
      folders: folders,
      count: media.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to fetch media',
      media: []
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// DELETE - Delete media
async function DELETE({ request, locals }) {
  try {
    const { R2_BUCKET, R2, DB } = locals.runtime.env;
    const R2_BINDING = R2_BUCKET || R2;
    
    const data = await request.json();
    const { id, filename } = data;
    
    if (!id || !filename) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Media ID and filename are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete from R2
    if (R2_BINDING) {
      try {
        await R2_BINDING.delete(filename);
        console.log('🗑️ Deleted from R2:', filename);
      } catch (r2Error) {
        console.error('❌ R2 delete error:', r2Error);
      }
    }

    // Delete from database
    const result = await DB.prepare('DELETE FROM media WHERE id = ?')
      .bind(id)
      .run();

    if (result.meta.changes === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Media not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Media deleted successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error deleting media:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to delete media'
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
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
