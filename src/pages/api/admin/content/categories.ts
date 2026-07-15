// src/pages/api/admin/content/categories.ts
import type { APIRoute } from 'astro';

export const prerender = false;

// GET - List all content categories
export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = locals.runtime.env.DB;
    
    const result = await db.prepare(`
      SELECT 
        cc.*,
        rc.name as reliable_category_name,
        rc.icon as reliable_category_icon,
        (SELECT COUNT(*) FROM content WHERE category_id = cc.id) as content_count
      FROM content_categories cc
      LEFT JOIN reliable_categories rc ON cc.category_id = rc.id
      WHERE cc.is_active = 1
      ORDER BY cc.name
    `).all();

    return new Response(JSON.stringify({
      success: true,
      data: result.results
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching content categories:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch content categories'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};