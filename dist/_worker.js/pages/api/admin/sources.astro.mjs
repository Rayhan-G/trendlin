globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../renderers.mjs';

const GET = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "all";
    const categoryId = url.searchParams.get("category");
    const stateId = url.searchParams.get("state");
    const search = url.searchParams.get("search");
    const featured = url.searchParams.get("featured") === "true";
    const env = locals.runtime?.env || globalThis.env;
    if (!env || !env.DB) {
      return new Response(JSON.stringify({
        success: false,
        error: "Database connection not available"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    let results = [];
    if (type === "master") {
      let query = `
        SELECT 
          m.id,
          m.name,
          m.url,
          m.category_id,
          m.description,
          m.source_type,
          m.logo_url,
          m.is_active,
          m.is_featured,
          m.trust_score,
          m.usage_count,
          c.name as category_name,
          c.icon as category_icon,
          NULL as state_id,
          NULL as state_name,
          NULL as state_code,
          'master' as source_type_actual
        FROM sources_master m
        JOIN sources_categories c ON m.category_id = c.id
        WHERE 1=1
      `;
      const params = [];
      if (categoryId) {
        query += ` AND m.category_id = ?`;
        params.push(parseInt(categoryId));
      }
      if (search) {
        query += ` AND (m.name LIKE ? OR m.description LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }
      if (featured) {
        query += ` AND m.is_featured = 1`;
      }
      query += ` ORDER BY m.is_featured DESC, m.trust_score DESC, m.name ASC`;
      const result = await env.DB.prepare(query).bind(...params).all();
      results = result.results || [];
    } else if (type === "state") {
      let query = `
        SELECT 
          ss.id,
          ss.name,
          ss.url,
          ss.category_id,
          ss.description,
          ss.source_type,
          ss.logo_url,
          ss.is_active,
          ss.is_featured,
          ss.trust_score,
          ss.usage_count,
          ss.address,
          ss.phone,
          ss.email,
          c.name as category_name,
          c.icon as category_icon,
          s.id as state_id,
          s.name as state_name,
          s.code as state_code,
          'state' as source_type_actual
        FROM sources_state ss
        JOIN sources_categories c ON ss.category_id = c.id
        LEFT JOIN sources_states s ON ss.state_id = s.id
        WHERE 1=1
      `;
      const params = [];
      if (categoryId) {
        query += ` AND ss.category_id = ?`;
        params.push(parseInt(categoryId));
      }
      if (stateId) {
        query += ` AND ss.state_id = ?`;
        params.push(parseInt(stateId));
      }
      if (search) {
        query += ` AND (ss.name LIKE ? OR ss.description LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }
      if (featured) {
        query += ` AND ss.is_featured = 1`;
      }
      query += ` ORDER BY ss.is_featured DESC, ss.trust_score DESC, ss.name ASC`;
      const result = await env.DB.prepare(query).bind(...params).all();
      results = result.results || [];
    } else {
      const masterQuery = `
        SELECT 
          m.id,
          m.name,
          m.url,
          m.category_id,
          m.description,
          m.source_type,
          m.logo_url,
          m.is_active,
          m.is_featured,
          m.trust_score,
          m.usage_count,
          c.name as category_name,
          c.icon as category_icon,
          NULL as state_id,
          NULL as state_name,
          NULL as state_code,
          'master' as source_type_actual,
          NULL as address,
          NULL as phone,
          NULL as email
        FROM sources_master m
        JOIN sources_categories c ON m.category_id = c.id
        WHERE 1=1
      `;
      const stateQuery = `
        SELECT 
          ss.id,
          ss.name,
          ss.url,
          ss.category_id,
          ss.description,
          ss.source_type,
          ss.logo_url,
          ss.is_active,
          ss.is_featured,
          ss.trust_score,
          ss.usage_count,
          ss.address,
          ss.phone,
          ss.email,
          c.name as category_name,
          c.icon as category_icon,
          s.id as state_id,
          s.name as state_name,
          s.code as state_code,
          'state' as source_type_actual
        FROM sources_state ss
        JOIN sources_categories c ON ss.category_id = c.id
        LEFT JOIN sources_states s ON ss.state_id = s.id
        WHERE 1=1
      `;
      let whereClause = "";
      const params = [];
      if (categoryId) {
        whereClause = ` AND category_id = ?`;
        params.push(parseInt(categoryId));
      }
      if (stateId) {
        whereClause += ` AND state_id = ?`;
        params.push(parseInt(stateId));
      }
      if (search) {
        whereClause += ` AND (name LIKE ? OR description LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }
      if (featured) {
        whereClause += ` AND is_featured = 1`;
      }
      const combinedQuery = `(${masterQuery}${whereClause}) UNION ALL (${stateQuery}${whereClause}) ORDER BY is_featured DESC, trust_score DESC, name ASC`;
      const allParams = [...params, ...params];
      const result = await env.DB.prepare(combinedQuery).bind(...allParams).all();
      results = result.results || [];
    }
    return new Response(JSON.stringify({
      success: true,
      data: results
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in sources GET:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to fetch sources: " + error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const POST = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const env = locals.runtime?.env || globalThis.env;
    console.log("📝 POST /api/admin/sources", body);
    if (!env || !env.DB) {
      return new Response(JSON.stringify({
        success: false,
        error: "Database connection not available"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const {
      name,
      url,
      category_id,
      description,
      source_type = "official",
      logo_url = "",
      is_active = 1,
      is_featured = 0,
      trust_score = 0,
      state_id = null,
      source_type_actual = "state",
      address = "",
      phone = "",
      email = ""
    } = body;
    if (!name || !url || !category_id) {
      return new Response(JSON.stringify({
        success: false,
        error: "Name, URL, and category are required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    let result;
    if (source_type_actual === "master") {
      const existing = await env.DB.prepare("SELECT id FROM sources_master WHERE name = ?").bind(name).first();
      if (existing) {
        return new Response(JSON.stringify({
          success: false,
          error: "A source with this name already exists"
        }), {
          status: 409,
          headers: { "Content-Type": "application/json" }
        });
      }
      result = await env.DB.prepare(`
        INSERT INTO sources_master (
          name, url, category_id, description, source_type, 
          logo_url, is_active, is_featured, trust_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        name,
        url,
        parseInt(category_id),
        description || "",
        source_type,
        logo_url || "",
        parseInt(is_active),
        parseInt(is_featured),
        parseInt(trust_score) || 0
      ).run();
    } else {
      if (!state_id) {
        return new Response(JSON.stringify({
          success: false,
          error: "State ID is required for state sources"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const existing = await env.DB.prepare("SELECT id FROM sources_state WHERE state_id = ? AND name = ?").bind(parseInt(state_id), name).first();
      if (existing) {
        return new Response(JSON.stringify({
          success: false,
          error: "A source with this name already exists in this state"
        }), {
          status: 409,
          headers: { "Content-Type": "application/json" }
        });
      }
      result = await env.DB.prepare(`
        INSERT INTO sources_state (
          state_id, name, url, category_id, description, source_type,
          logo_url, is_active, is_featured, trust_score,
          address, phone, email
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        parseInt(state_id),
        name,
        url,
        parseInt(category_id),
        description || "",
        source_type,
        logo_url || "",
        parseInt(is_active),
        parseInt(is_featured),
        parseInt(trust_score) || 0,
        address || "",
        phone || "",
        email || ""
      ).run();
    }
    return new Response(JSON.stringify({
      success: true,
      id: result.lastID || result.meta?.last_row_id,
      message: "Source created successfully"
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in sources POST:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to create source: " + error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
