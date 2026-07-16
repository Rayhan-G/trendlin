globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../../../renderers.mjs';

// ============================================
// API: GET /api/admin/products/:id/resources - Get product resources
// API: POST /api/admin/products/:id/resources - Add resource to product
// API: DELETE /api/admin/products/:id/resources - Delete resource
// ============================================

const ALLOWED_PLATFORMS = ['reddit', 'youtube', 'tiktok', 'shop'];

async function GET({ params, locals }) {
  try {
    const { DB } = locals.runtime.env;
    const { id } = params;
    
    // Check if product exists
    const product = await DB.prepare(`
      SELECT id, name FROM products WHERE id = ?
    `).bind(id).first();
    
    if (!product) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Product not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get resources
    const resources = await DB.prepare(`
      SELECT 
        id, platform, url, title, description, 
        author, shop_name, is_featured, display_order,
        created_at
      FROM product_resources
      WHERE product_id = ?
      ORDER BY display_order ASC
    `).bind(id).all();
    
    return new Response(JSON.stringify({
      success: true,
      product: product,
      resources: resources.results || []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error fetching resources:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function POST({ params, request, locals }) {
  try {
    const { DB } = locals.runtime.env;
    const { id } = params;
    const data = await request.json();
    
    const {
      platform, url, title, description,
      author, shop_name, is_featured
    } = data;
    
    // Validate required fields
    if (!platform || !url || !title) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Platform, URL, and title are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate platform
    if (!ALLOWED_PLATFORMS.includes(platform)) {
      return new Response(JSON.stringify({
        success: false,
        error: `Invalid platform. Allowed: ${ALLOWED_PLATFORMS.join(', ')}`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if product exists
    const product = await DB.prepare(`
      SELECT id FROM products WHERE id = ?
    `).bind(id).first();
    
    if (!product) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Product not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get max display order
    const maxOrder = await DB.prepare(`
      SELECT MAX(display_order) as max_order
      FROM product_resources
      WHERE product_id = ?
    `).bind(id).first();
    
    const display_order = (maxOrder?.max_order || 0) + 1;
    
    // Insert resource
    const result = await DB.prepare(`
      INSERT INTO product_resources (
        product_id, platform, url, title, description,
        author, shop_name, is_featured, display_order
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id
    `).bind(
      id, platform, url, title, description || '',
      author || '', shop_name || '',
      is_featured ? 1 : 0, display_order
    ).run();
    
    const resourceId = result.meta?.last_row_id || result.lastRowId;
    
    // Get the newly created resource
    const newResource = await DB.prepare(`
      SELECT 
        id, platform, url, title, description,
        author, shop_name, is_featured, display_order
      FROM product_resources
      WHERE id = ?
    `).bind(resourceId).first();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Resource added successfully',
      resource: newResource
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error adding resource:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function DELETE({ params, request, locals }) {
  try {
    const { DB } = locals.runtime.env;
    const { id } = params;
    const data = await request.json();
    const { resource_id } = data;
    
    if (!resource_id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Resource ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if resource exists and belongs to product
    const resource = await DB.prepare(`
      SELECT id FROM product_resources 
      WHERE id = ? AND product_id = ?
    `).bind(resource_id, id).first();
    
    if (!resource) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Resource not found or does not belong to this product'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Delete resource
    await DB.prepare(`
      DELETE FROM product_resources WHERE id = ?
    `).bind(resource_id).run();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Resource deleted successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error deleting resource:', error);
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
  DELETE,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
