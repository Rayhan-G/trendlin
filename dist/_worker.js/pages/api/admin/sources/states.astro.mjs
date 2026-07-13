globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../../renderers.mjs';

// ============================================
// API: /api/admin/sources/states
// GET - Get all US states
// ============================================

async function GET({ locals }) {
  try {
    const { DB } = locals.runtime.env;
    
    const result = await DB.prepare(`
      SELECT 
        id, name, code, abbreviation, region,
        is_active
      FROM sources_states
      WHERE is_active = 1
      ORDER BY name ASC
    `).all();
    
    return new Response(JSON.stringify({
      success: true,
      states: result.results || []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error fetching states:', error);
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
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
