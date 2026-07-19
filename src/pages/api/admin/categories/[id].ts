// P:\Projects\trendlin\src\pages\api\admin\categories\[id].ts
import type { APIRoute } from 'astro';

// ============================================
// PUT - Update Category
// ============================================
export const PUT: APIRoute = async ({ params, request, locals }) => {
  const { DB } = locals.runtime.env;
  const id = params.id;
  const data = await request.json();
  
  try {
    const { name, slug, icon, description, hero_image, is_active } = data;
    
    // Validate required fields
    if (!name || !slug) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Name and slug are required'
      }), { status: 400 });
    }
    
    // Check if slug already exists (excluding this category)
    const existing = await DB.prepare(
      'SELECT id FROM categories WHERE slug = ? AND id != ?'
    ).bind(slug, id).first();
    
    if (existing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Category with this slug already exists'
      }), { status: 400 });
    }
    
    // Check if category exists
    const categoryExists = await DB.prepare(
      'SELECT id FROM categories WHERE id = ?'
    ).bind(id).first();
    
    if (!categoryExists) {
      // If category doesn't exist, create it
      await DB.prepare(`
        INSERT INTO categories (id, name, slug, icon, description, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(id, name, slug, icon || null, description || null, is_active || 1).run();
    } else {
      // Update existing category
      await DB.prepare(`
        UPDATE categories 
        SET 
          name = ?,
          slug = ?,
          icon = ?,
          description = ?,
          is_active = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `).bind(name, slug, icon || null, description || null, is_active || 1, id).run();
    }
    
    // Update or insert hero image
    if (hero_image) {
      const existingHero = await DB.prepare(
        'SELECT id FROM category_hero WHERE category_id = ?'
      ).bind(id).first();
      
      if (existingHero) {
        // Update existing hero image
        await DB.prepare(`
          UPDATE category_hero 
          SET hero_image = ?, updated_at = datetime('now')
          WHERE category_id = ?
        `).bind(hero_image, id).run();
      } else {
        // Insert new hero image
        await DB.prepare(`
          INSERT INTO category_hero (category_id, hero_image, is_active, created_at)
          VALUES (?, ?, 1, datetime('now'))
        `).bind(id, hero_image).run();
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      id: id,
      message: 'Category updated successfully'
    }));
    
  } catch (error) {
    console.error('Category update error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to update category'
    }), { status: 500 });
  }
};

// ============================================
// DELETE - Delete Category
// ============================================
export const DELETE: APIRoute = async ({ params, locals }) => {
  const { DB } = locals.runtime.env;
  const id = params.id;
  
  try {
    // Check if category has posts
    const posts = await DB.prepare(
      'SELECT COUNT(*) as count FROM posts WHERE category = (SELECT name FROM categories WHERE id = ?) AND is_draft = 0'
    ).bind(id).first();
    
    if (posts && posts.count > 0) {
      return new Response(JSON.stringify({
        success: false,
        error: `Cannot delete category with ${posts.count} published post(s)`
      }), { status: 400 });
    }
    
    // Delete hero images first (foreign key constraint)
    await DB.prepare(
      'DELETE FROM category_hero WHERE category_id = ?'
    ).bind(id).run();
    
    // Delete the category
    await DB.prepare(
      'DELETE FROM categories WHERE id = ?'
    ).bind(id).run();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Category deleted successfully'
    }));
    
  } catch (error) {
    console.error('Category delete error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to delete category'
    }), { status: 500 });
  }
};

// ============================================
// GET - Get Single Category
// ============================================
export const GET: APIRoute = async ({ params, locals }) => {
  const { DB } = locals.runtime.env;
  const id = params.id;
  
  try {
    const category = await DB.prepare(`
      SELECT 
        c.*,
        ch.hero_image,
        (SELECT COUNT(*) FROM posts WHERE category = c.name AND is_draft = 0) as post_count
      FROM categories c
      LEFT JOIN category_hero ch ON c.id = ch.category_id AND ch.is_active = 1
      WHERE c.id = ?
    `).bind(id).first();
    
    if (!category) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Category not found'
      }), { status: 404 });
    }
    
    return new Response(JSON.stringify({
      success: true,
      category
    }));
    
  } catch (error) {
    console.error('Category fetch error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to fetch category'
    }), { status: 500 });
  }
};