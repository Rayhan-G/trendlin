globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../../renderers.mjs';

// ============================================
// API: GET /api/admin/products/:id - Get single product
// API: PUT /api/admin/products/:id - Update product
// API: DELETE /api/admin/products/:id - Delete product
// ============================================

async function GET({ params, locals }) {
  try {
    const { DB } = locals.runtime.env;
    const { id } = params;
    
    const product = await DB.prepare(`
      SELECT 
        id, name, slug, description, category, brand,
        cover_image, in_stock, is_top_pick, is_newly_released,
        created_at, updated_at
      FROM products 
      WHERE id = ?
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
        author, shop_name, is_featured, display_order
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
    console.error('Error fetching product:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function PUT({ params, request, locals }) {
  try {
    const { DB } = locals.runtime.env;
    const { id } = params;
    const data = await request.json();
    
    const {
      name, slug, description, category, brand,
      cover_image, in_stock, is_top_pick, is_newly_released
    } = data;
    
    // Check if product exists
    const existing = await DB.prepare(`
      SELECT id FROM products WHERE id = ?
    `).bind(id).first();
    
    if (!existing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Product not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if slug is taken by another product
    if (slug) {
      const slugCheck = await DB.prepare(`
        SELECT id FROM products WHERE slug = ? AND id != ?
      `).bind(slug, id).first();
      
      if (slugCheck) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Slug already taken by another product'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Update product
    await DB.prepare(`
      UPDATE products SET
        name = ?,
        slug = ?,
        description = ?,
        category = ?,
        brand = ?,
        cover_image = ?,
        in_stock = ?,
        is_top_pick = ?,
        is_newly_released = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      name, slug, description, category, brand,
      cover_image, in_stock, is_top_pick, is_newly_released,
      id
    ).run();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Product updated successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error updating product:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function DELETE({ params, locals }) {
  try {
    const { DB } = locals.runtime.env;
    const { id } = params;
    
    // Check if product exists
    const existing = await DB.prepare(`
      SELECT id FROM products WHERE id = ?
    `).bind(id).first();
    
    if (!existing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Product not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Delete product (resources will be deleted via CASCADE)
    await DB.prepare(`
      DELETE FROM products WHERE id = ?
    `).bind(id).run();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Product deleted successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error deleting product:', error);
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
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
