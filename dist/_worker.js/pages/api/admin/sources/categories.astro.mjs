globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../../renderers.mjs';

// ============================================
// API: /api/admin/sources/categories
// GET - Get all source categories
// ============================================

async function GET({ locals }) {
  try {
    const { DB } = locals.runtime.env;
    
    console.log('📡 Fetching categories...');
    
    const result = await DB.prepare(`
      SELECT 
        id, name, slug, icon, description,
        display_order, is_active
      FROM sources_categories
      WHERE is_active = 1
      ORDER BY display_order ASC, name ASC
    `).all();
    
    console.log(`✅ Found ${result.results?.length || 0} categories`);
    
    return new Response(JSON.stringify({
      success: true,
      categories: result.results || []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
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
