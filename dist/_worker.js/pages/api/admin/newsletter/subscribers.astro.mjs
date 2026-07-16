globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../../renderers.mjs';

async function GET({ locals, url }) {
  try {
    console.log("📋 Admin: Get subscribers API called");
    const { DB } = locals.runtime.env;
    if (!DB) {
      console.error("❌ Database not available!");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Database not available"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const page = parseInt(url.searchParams.get("page") || "1");
    const perPage = parseInt(url.searchParams.get("per_page") || "20");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");
    const offset = (page - 1) * perPage;
    let query = `
      SELECT 
        id, email, first_name, last_name, status,
        source, created_at, verified_at, unsubscribed_at
      FROM newsletter_subscribers 
      WHERE 1=1
    `;
    const params = [];
    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }
    if (search) {
      query += ` AND email LIKE ?`;
      params.push(`%${search}%`);
    }
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(perPage, offset);
    const subscribers = await DB.prepare(query).bind(...params).all();
    let countQuery = `SELECT COUNT(*) as total FROM newsletter_subscribers WHERE 1=1`;
    const countParams = [];
    if (status) {
      countQuery += ` AND status = ?`;
      countParams.push(status);
    }
    if (search) {
      countQuery += ` AND email LIKE ?`;
      countParams.push(`%${search}%`);
    }
    const totalResult = await DB.prepare(countQuery).bind(...countParams).first();
    return new Response(
      JSON.stringify({
        success: true,
        data: subscribers.results || [],
        pagination: {
          page,
          perPage,
          total: totalResult?.total || 0,
          pages: Math.ceil((totalResult?.total || 0) / perPage)
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("❌ Fetch subscribers error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to fetch subscribers"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
async function DELETE({ request, locals }) {
  try {
    console.log("🗑️ Admin: Delete subscriber API called");
    const { DB } = locals.runtime.env;
    if (!DB) {
      console.error("❌ Database not available!");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Database not available"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const adminId = locals.user?.id;
    if (!adminId) {
      console.error("❌ Unauthorized: No admin user found");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized"
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get("id") || "0");
    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Subscriber ID required"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const subscriber = await DB.prepare("SELECT id, email FROM newsletter_subscribers WHERE id = ?").bind(id).first();
    if (!subscriber) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Subscriber not found"
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    await DB.prepare("DELETE FROM newsletter_subscribers WHERE id = ?").bind(id).run();
    console.log(`✅ Subscriber ${id} (${subscriber.email}) deleted successfully`);
    return new Response(
      JSON.stringify({
        success: true,
        message: "Subscriber deleted successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("❌ Delete subscriber error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to delete subscriber"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
