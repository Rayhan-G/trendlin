// P:\Projects\trendlin\src\pages\api\admin\categories\[id].ts
import type { APIRoute } from 'astro';

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const { DB } = locals.runtime.env;
  const id = params.id;
  const data = await request.json();
  
  try {
    const { name, slug, icon, description, hero_image, is_active } = data;
    
    // Update category
    await DB.prepare(`
      UPDATE categories 
      SET name = ?, slug = ?, icon = ?, description = ?, 
          hero_image = ?, is_active = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(name, slug, icon, description, hero_image || null, is_active || 1, id).run();
    
    return new Response(JSON.stringify({
      success: true,
      id: id
    }));
    
  } catch (error) {
    console.error('Category update error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const { DB } = locals.runtime.env;
  const id = params.id;
  
  try {
    // Check if category has posts
    const posts = await DB.prepare(
      'SELECT COUNT(*) as count FROM posts WHERE category_id = ?'
    ).bind(id).first();
    
    if (posts && posts.count > 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Cannot delete category with existing posts'
      }), { status: 400 });
    }
    
    // Delete category
    await DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
    
    return new Response(JSON.stringify({
      success: true
    }));
    
  } catch (error) {
    console.error('Category delete error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { status: 500 });
  }
};