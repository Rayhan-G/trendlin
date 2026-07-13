globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../../renderers.mjs';

const GET = async ({ params, locals }) => {
  try {
    const { id } = params;
    const env = locals.runtime?.env || globalThis.env;
    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: "Source ID is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log(`📡 GET /api/admin/sources/${id}`);
    const master = await env.DB.prepare(`
        SELECT 
          m.*, 
          c.name as category_name, 
          c.icon as category_icon,
          'master' as source_type,
          NULL as state_name,
          NULL as state_code,
          NULL as address,
          NULL as phone,
          NULL as email
        FROM sources_master m
        JOIN sources_categories c ON m.category_id = c.id
        WHERE m.id = ?
      `).bind(parseInt(id)).first();
    if (master) {
      return new Response(JSON.stringify({
        success: true,
        source: master,
        type: "master"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    const state = await env.DB.prepare(`
        SELECT 
          ss.*, 
          s.name as state_name, 
          s.code as state_code,
          c.name as category_name, 
          c.icon as category_icon,
          'state' as source_type,
          ss.address,
          ss.phone,
          ss.email
        FROM sources_state ss
        JOIN sources_states s ON ss.state_id = s.id
        JOIN sources_categories c ON ss.category_id = c.id
        WHERE ss.id = ?
      `).bind(parseInt(id)).first();
    if (state) {
      return new Response(JSON.stringify({
        success: true,
        source: state,
        type: "state"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      success: false,
      error: "Source not found"
    }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("❌ Error fetching source:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to fetch source: " + error.message
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
    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: "Source ID is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log(`📝 PUT /api/admin/sources/${id}`, body);
    const { type, name, url, category_id, description, source_type, logo_url, state_id, address, phone, email, is_active } = body;
    if (!name || !url || !category_id) {
      return new Response(JSON.stringify({
        success: false,
        error: "Name, URL, and category are required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (type !== "master" && type !== "state") {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid source type. Must be "master" or "state"'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    let result;
    if (type === "master") {
      const existing = await env.DB.prepare("SELECT id FROM sources_master WHERE id = ?").bind(parseInt(id)).first();
      if (!existing) {
        return new Response(JSON.stringify({
          success: false,
          error: "Source not found"
        }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      const duplicate = await env.DB.prepare("SELECT id FROM sources_master WHERE name = ? AND id != ?").bind(name, parseInt(id)).first();
      if (duplicate) {
        return new Response(JSON.stringify({
          success: false,
          error: "A source with this name already exists"
        }), {
          status: 409,
          headers: { "Content-Type": "application/json" }
        });
      }
      result = await env.DB.prepare(`
        UPDATE sources_master 
        SET name = ?, url = ?, category_id = ?, description = ?, 
            source_type = ?, logo_url = ?, is_active = ?, updated_at = datetime('now')
        WHERE id = ?
      `).bind(
        name,
        url,
        parseInt(category_id),
        description || "",
        source_type || "official",
        logo_url || "",
        is_active !== void 0 ? is_active : 1,
        parseInt(id)
      ).run();
    } else {
      const existing = await env.DB.prepare("SELECT id FROM sources_state WHERE id = ?").bind(parseInt(id)).first();
      if (!existing) {
        return new Response(JSON.stringify({
          success: false,
          error: "Source not found"
        }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      const duplicate = await env.DB.prepare("SELECT id FROM sources_state WHERE name = ? AND state_id = ? AND id != ?").bind(name, state_id ? parseInt(state_id) : 0, parseInt(id)).first();
      if (duplicate) {
        return new Response(JSON.stringify({
          success: false,
          error: "A source with this name already exists for this state"
        }), {
          status: 409,
          headers: { "Content-Type": "application/json" }
        });
      }
      result = await env.DB.prepare(`
        UPDATE sources_state 
        SET name = ?, url = ?, category_id = ?, description = ?, 
            source_type = ?, logo_url = ?, address = ?, phone = ?, email = ?,
            is_active = ?, updated_at = datetime('now')
        WHERE id = ?
      `).bind(
        name,
        url,
        parseInt(category_id),
        description || "",
        source_type || "official",
        logo_url || "",
        address || "",
        phone || "",
        email || "",
        is_active !== void 0 ? is_active : 1,
        parseInt(id)
      ).run();
    }
    if (result.changes === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: "Source not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log("✅ Source updated successfully");
    return new Response(JSON.stringify({
      success: true,
      message: "Source updated successfully"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("❌ Error updating source:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to update source: " + error.message
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
    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: "Source ID is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log(`🗑️ DELETE /api/admin/sources/${id}`);
    let body;
    try {
      body = await request.json();
    } catch (e) {
      body = { type: "master" };
    }
    const { type } = body;
    if (type !== "master" && type !== "state") {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid source type. Must be "master" or "state"'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log(`🔍 Deleting ${type} source with ID: ${id}`);
    let result;
    if (type === "master") {
      const existing = await env.DB.prepare("SELECT id FROM sources_master WHERE id = ?").bind(parseInt(id)).first();
      if (!existing) {
        return new Response(JSON.stringify({
          success: false,
          error: "Source not found"
        }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      result = await env.DB.prepare("DELETE FROM sources_master WHERE id = ?").bind(parseInt(id)).run();
    } else {
      const existing = await env.DB.prepare("SELECT id FROM sources_state WHERE id = ?").bind(parseInt(id)).first();
      if (!existing) {
        return new Response(JSON.stringify({
          success: false,
          error: "Source not found"
        }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      result = await env.DB.prepare("DELETE FROM sources_state WHERE id = ?").bind(parseInt(id)).run();
    }
    console.log(`✅ Source deleted successfully, changes: ${result.changes}`);
    return new Response(JSON.stringify({
      success: true,
      message: "Source deleted successfully"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("❌ Error deleting source:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to delete source: " + error.message
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
