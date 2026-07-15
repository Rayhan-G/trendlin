// src/pages/api/admin/content/stats.ts
import type { APIRoute } from 'astro';

export const prerender = false;

// GET - Get content stats
export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = locals.runtime.env.DB;
    
    // Get total content count
    const total = await db.prepare(`
      SELECT COUNT(*) as count FROM content
    `).first();

    // Get count by status
    const statusCounts = await db.prepare(`
      SELECT 
        cs.name,
        cs.slug,
        cs.color,
        COUNT(c.id) as count
      FROM content_status cs
      LEFT JOIN content c ON c.status_id = cs.id
      GROUP BY cs.id
      ORDER BY cs.display_order
    `).all();

    // Get count by type
    const typeCounts = await db.prepare(`
      SELECT 
        ct.name,
        ct.icon,
        ct.color,
        COUNT(c.id) as count
      FROM content_types ct
      LEFT JOIN content c ON c.content_type_id = ct.id
      WHERE ct.is_active = 1
      GROUP BY ct.id
      ORDER BY ct.name
    `).all();

    // Get scheduled posts count
    const scheduled = await db.prepare(`
      SELECT COUNT(*) as count
      FROM content
      WHERE status_id = (SELECT id FROM content_status WHERE slug = 'scheduled')
      AND scheduled_publish_at > datetime('now')
    `).first();

    // Get published count
    const published = await db.prepare(`
      SELECT COUNT(*) as count
      FROM content
      WHERE status_id = (SELECT id FROM content_status WHERE slug = 'published')
    `).first();

    // Get this month's content
    const thisMonth = await db.prepare(`
      SELECT COUNT(*) as count
      FROM content
      WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `).first();

    return new Response(JSON.stringify({
      success: true,
      data: {
        total: total?.count || 0,
        published: published?.count || 0,
        scheduled: scheduled?.count || 0,
        thisMonth: thisMonth?.count || 0,
        byStatus: statusCounts.results || [],
        byType: typeCounts.results || []
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching content stats:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch content stats'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};