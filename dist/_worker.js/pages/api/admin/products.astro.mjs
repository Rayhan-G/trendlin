globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../renderers.mjs';

// ============================================
// API: GET /api/admin/products - List all products
// API: POST /api/admin/products - Create new product with resources
// ============================================

async function GET({ locals, url }) {
  try {
    const { DB } = locals.runtime.env;
    
    const result = await DB.prepare(`
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.category,
        p.brand,
        p.cover_image,
        p.in_stock,
        p.is_top_pick,
        p.is_newly_released,
        p.created_at,
        COUNT(r.id) as resource_count
      FROM products p
      LEFT JOIN product_resources r ON r.product_id = p.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `).all();
    
    return new Response(JSON.stringify({
      success: true,
      products: result.results || []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error fetching products:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function POST({ request, locals }) {
  try {
    const { DB } = locals.runtime.env;
    const formData = await request.formData();
    
    // Get product data
    const name = formData.get('name');
    const slug = formData.get('slug') || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const description = formData.get('description');
    const category = formData.get('category');
    const brand = formData.get('brand');
    const cover_image = formData.get('cover_image');
    const in_stock = formData.get('in_stock') ? 1 : 0;
    const is_top_pick = formData.get('is_top_pick') ? 1 : 0;
    const is_newly_released = formData.get('is_newly_released') ? 1 : 0;
    
    // Validate required fields
    if (!name || !category) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Name and category are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if slug already exists
    const existing = await DB.prepare(`
      SELECT id FROM products WHERE slug = ?
    `).bind(slug).first();
    
    if (existing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'A product with this slug already exists'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Insert product
    const result = await DB.prepare(`
      INSERT INTO products (
        name, slug, description, category, brand, 
        cover_image, in_stock, is_top_pick, is_newly_released
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id
    `).bind(
      name, slug, description, category, brand, 
      cover_image, in_stock, is_top_pick, is_newly_released
    ).run();
    
    const productId = result.meta?.last_row_id || result.lastRowId;
    
    if (!productId) {
      throw new Error('Failed to create product');
    }
    
    // Process resources (up to 4)
    const allowedPlatforms = ['reddit', 'youtube', 'tiktok', 'shop'];
    const resources = [];
    
    for (let i = 0; i < 4; i++) {
      const platform = formData.get(`resource_platform_${i}`);
      const url = formData.get(`resource_url_${i}`);
      const title = formData.get(`resource_title_${i}`);
      const description = formData.get(`resource_description_${i}`);
      const author = formData.get(`resource_author_${i}`);
      const shop_name = formData.get(`resource_shop_name_${i}`);
      const is_featured = formData.get(`resource_featured_${i}`) ? 1 : 0;
      
      // Only add if platform, url, and title are provided
      if (platform && url && title) {
        if (!allowedPlatforms.includes(platform)) {
          return new Response(JSON.stringify({
            success: false,
            error: `Invalid platform: ${platform}. Allowed: reddit, youtube, tiktok, shop`
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        resources.push({
          platform,
          url,
          title,
          description: description || '',
          author: author || '',
          shop_name: shop_name || '',
          is_featured
        });
      }
    }
    
    // Insert resources
    if (resources.length > 0) {
      for (let i = 0; i < resources.length; i++) {
        const r = resources[i];
        await DB.prepare(`
          INSERT INTO product_resources (
            product_id, platform, url, title, description, 
            author, shop_name, is_featured, display_order
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          productId, r.platform, r.url, r.title, r.description,
          r.author, r.shop_name, r.is_featured, i + 1
        ).run();
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      productId: productId,
      resourcesAdded: resources.length,
      redirect: `/admin/products/${productId}/resources`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error creating product:', error);
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
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
