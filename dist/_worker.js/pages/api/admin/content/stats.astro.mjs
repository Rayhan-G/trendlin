globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../../renderers.mjs';

const prerender = false;
const GET = async ({ locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const total = await db.prepare(`
      SELECT COUNT(*) as count FROM content
    `).first();
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
    const scheduled = await db.prepare(`
      SELECT COUNT(*) as count
      FROM content
      WHERE status_id = (SELECT id FROM content_status WHERE slug = 'scheduled')
      AND scheduled_publish_at > datetime('now')
    `).first();
    const published = await db.prepare(`
      SELECT COUNT(*) as count
      FROM content
      WHERE status_id = (SELECT id FROM content_status WHERE slug = 'published')
    `).first();
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
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error fetching content stats:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to fetch content stats"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
