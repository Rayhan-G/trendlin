globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../../renderers.mjs';

const GET = async ({ params, locals }) => {
  try {
    const { id } = params;
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
    let result = await env.DB.prepare(`
        SELECT 
          m.*, 
          c.name as category_name, 
          c.icon as category_icon,
          'master' as source_type_actual
        FROM sources_master m
        LEFT JOIN sources_categories c ON m.category_id = c.id
        WHERE m.id = ?
      `).bind(parseInt(id)).first();
    if (!result) {
      result = await env.DB.prepare(`
          SELECT 
            ss.*, 
            s.name as state_name, 
            s.code as state_code,
            c.name as category_name, 
            c.icon as category_icon,
            'state' as source_type_actual
          FROM sources_state ss
          LEFT JOIN sources_states s ON ss.state_id = s.id
          LEFT JOIN sources_categories c ON ss.category_id = c.id
          WHERE ss.id = ?
        `).bind(parseInt(id)).first();
    }
    if (!result) {
      return new Response(JSON.stringify({
        success: false,
        error: "Source not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      data: result
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error fetching source:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const PUT = async ({ params, request, locals }) => {
  try {
    const { id } = params;
    const body = await request.json();
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
    const {
      name,
      url,
      category_id,
      description,
      source_type,
      logo_url,
      is_active,
      is_featured,
      trust_score,
      source_type_actual,
      state_id,
      address,
      phone,
      email
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
      const exists = await env.DB.prepare("SELECT id FROM sources_master WHERE id = ?").bind(parseInt(id)).first();
      if (!exists) {
        return new Response(JSON.stringify({
          success: false,
          error: "Source not found"
        }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      result = await env.DB.prepare(`
          UPDATE sources_master 
          SET name = ?, url = ?, category_id = ?, description = ?, 
              source_type = ?, logo_url = ?, is_active = ?, 
              is_featured = ?, trust_score = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(
        name,
        url,
        parseInt(category_id),
        description || "",
        source_type || "official",
        logo_url || "",
        is_active !== void 0 ? parseInt(is_active) : 1,
        is_featured !== void 0 ? parseInt(is_featured) : 0,
        trust_score !== void 0 ? parseInt(trust_score) : 0,
        parseInt(id)
      ).run();
    } else {
      const exists = await env.DB.prepare("SELECT id FROM sources_state WHERE id = ?").bind(parseInt(id)).first();
      if (!exists) {
        return new Response(JSON.stringify({
          success: false,
          error: "Source not found"
        }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      result = await env.DB.prepare(`
          UPDATE sources_state 
          SET state_id = ?, name = ?, url = ?, category_id = ?, description = ?, 
              source_type = ?, logo_url = ?, address = ?, phone = ?, email = ?,
              is_active = ?, is_featured = ?, trust_score = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(
        state_id ? parseInt(state_id) : null,
        name,
        url,
        parseInt(category_id),
        description || "",
        source_type || "official",
        logo_url || "",
        address || "",
        phone || "",
        email || "",
        is_active !== void 0 ? parseInt(is_active) : 1,
        is_featured !== void 0 ? parseInt(is_featured) : 0,
        trust_score !== void 0 ? parseInt(trust_score) : 0,
        parseInt(id)
      ).run();
    }
    return new Response(JSON.stringify({
      success: true,
      message: "Source updated successfully"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error updating source:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const DELETE = async ({ params, request, locals }) => {
  try {
    const { id } = params;
    const env = locals.runtime?.env || globalThis.env;
    console.log("🗑️ DELETE request for source ID:", id);
    if (!env || !env.DB) {
      return new Response(JSON.stringify({
        success: false,
        error: "Database connection not available"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: "Source ID is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    let body = {};
    try {
      body = await request.json();
    } catch (e) {
      console.log("No body provided, checking database for type");
    }
    const { type } = body;
    console.log("Delete type:", type || "auto-detect");
    let result;
    let tableName;
    if (type === "master") {
      tableName = "sources_master";
      const exists = await env.DB.prepare("SELECT id FROM sources_master WHERE id = ?").bind(parseInt(id)).first();
      if (!exists) {
        return new Response(JSON.stringify({
          success: false,
          error: "Source not found"
        }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      result = await env.DB.prepare("DELETE FROM sources_master WHERE id = ?").bind(parseInt(id)).run();
    } else if (type === "state") {
      tableName = "sources_state";
      const exists = await env.DB.prepare("SELECT id FROM sources_state WHERE id = ?").bind(parseInt(id)).first();
      if (!exists) {
        return new Response(JSON.stringify({
          success: false,
          error: "Source not found"
        }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      result = await env.DB.prepare("DELETE FROM sources_state WHERE id = ?").bind(parseInt(id)).run();
    } else {
      console.log("Auto-detecting source type...");
      const masterExists = await env.DB.prepare("SELECT id FROM sources_master WHERE id = ?").bind(parseInt(id)).first();
      if (masterExists) {
        result = await env.DB.prepare("DELETE FROM sources_master WHERE id = ?").bind(parseInt(id)).run();
        tableName = "sources_master";
      } else {
        const stateExists = await env.DB.prepare("SELECT id FROM sources_state WHERE id = ?").bind(parseInt(id)).first();
        if (stateExists) {
          result = await env.DB.prepare("DELETE FROM sources_state WHERE id = ?").bind(parseInt(id)).run();
          tableName = "sources_state";
        } else {
          return new Response(JSON.stringify({
            success: false,
            error: "Source not found"
          }), {
            status: 404,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    }
    console.log(`✅ Deleted from ${tableName}, changes: ${result.changes || 0}`);
    return new Response(JSON.stringify({
      success: true,
      message: "Source deleted successfully",
      deleted: true
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("❌ Error deleting source:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
