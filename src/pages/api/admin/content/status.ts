// src/pages/api/admin/content/status.ts
import type { APIRoute } from 'astro';

export const prerender = false;

// GET - List all content statuses
export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = locals.runtime.env.DB;
    
    const result = await db.prepare(`
      SELECT * FROM content_status ORDER BY display_order
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
    console.error('Error fetching content statuses:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch content statuses'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};