// src/pages/api/admin/reliable/categories.ts
import type { APIRoute } from 'astro';

export const prerender = false;

// GET - List all categories
export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = locals.runtime.env.DB;
    
    const result = await db.prepare(`
      SELECT 
        id,
        name,
        slug,
        description,
        icon,
        display_order,
        is_active,
        created_at,
        updated_at,
        (SELECT COUNT(*) FROM reliable_subcategories WHERE category_id = c.id AND is_active = 1) as subcategory_count
      FROM reliable_categories c
      WHERE is_active = 1
      ORDER BY display_order, name
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
    console.error('Error fetching categories:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch categories'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};