// src/pages/api/admin/content/types.ts
import type { APIRoute } from 'astro';

export const prerender = false;

// GET - List all content types
export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = locals.runtime.env.DB;
    
    const result = await db.prepare(`
      SELECT * FROM content_types WHERE is_active = 1 ORDER BY name
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
    console.error('Error fetching content types:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch content types'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};