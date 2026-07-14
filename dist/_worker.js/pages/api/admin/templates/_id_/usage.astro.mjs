globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../../../renderers.mjs';

// ============================================
// API: /api/admin/templates/:id/usage
// POST - Increment template usage count
// ============================================

async function POST({ params, locals }) {
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
    
    // Increment usage count
    await DB.prepare(`
      UPDATE templates 
      SET usage_count = usage_count + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(id).run();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Usage count incremented'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error incrementing usage:', error);
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
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
