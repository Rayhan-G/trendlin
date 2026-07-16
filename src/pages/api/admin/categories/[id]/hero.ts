// ============================================
// API: Manage Category Hero Image
// ============================================

import type { APIRoute } from 'astro';

// PUT: Add or Update Hero Image
export const PUT: APIRoute = async ({ params, request, locals }) => {
  const { DB } = locals.runtime.env;
  const categoryId = params.id;
  
  try {
    const { hero_image, hero_id } = await request.json();
    
    if (!hero_image) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Hero image URL is required'
      }), { status: 400 });
    }
    
    if (hero_id) {
      // Update existing hero
      await DB.prepare(`
        UPDATE category_hero 
        SET hero_image = ?, updated_at = datetime('now')
        WHERE id = ? AND category_id = ?
      `).bind(hero_image, hero_id, categoryId).run();
    } else {
      // Insert new hero
      await DB.prepare(`
        INSERT INTO category_hero (category_id, hero_image, is_active, created_at)
        VALUES (?, ?, 1, datetime('now'))
      `).bind(categoryId, hero_image).run();
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Hero image saved successfully'
    }));
    
  } catch (error) {
    console.error('Save hero error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to save hero image'
    }), { status: 500 });
  }
};

// DELETE: Remove Hero Image
export const DELETE: APIRoute = async ({ params, request, locals }) => {
  const { DB } = locals.runtime.env;
  const categoryId = params.id;
  
  try {
    const { heroId } = await request.json();
    
    if (!heroId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Hero ID is required'
      }), { status: 400 });
    }
    
    await DB.prepare(
      'DELETE FROM category_hero WHERE id = ? AND category_id = ?'
    ).bind(heroId, categoryId).run();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Hero image removed successfully'
    }));
    
  } catch (error) {
    console.error('Remove hero error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to remove hero image'
    }), { status: 500 });
  }
};