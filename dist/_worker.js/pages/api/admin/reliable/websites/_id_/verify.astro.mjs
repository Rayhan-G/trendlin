globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../../../../renderers.mjs';

const prerender = false;
const POST = async ({ params, request, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const id = parseInt(params.id);
    const data = await request.json();
    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid website ID"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const { verified_by, notes } = data;
    const existing = await db.prepare(`
      SELECT id, reliability_score FROM reliable_websites WHERE id = ?
    `).bind(id).first();
    if (!existing) {
      return new Response(JSON.stringify({
        success: false,
        error: "Website not found"
      }), {
        status: 404,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    await db.prepare(`
      UPDATE reliable_websites SET
        last_verified = DATE('now'),
        verified_by = COALESCE(?, verified_by),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      verified_by || "admin",
      id
    ).run();
    await db.prepare(`
      INSERT INTO reliable_verification_log (
        website_id,
        verified_by,
        verification_date,
        old_score,
        new_score,
        status,
        notes,
        created_at
      ) VALUES (?, ?, DATE('now'), ?, ?, 'verified', ?, CURRENT_TIMESTAMP)
    `).bind(
      id,
      verified_by || "admin",
      existing.reliability_score,
      existing.reliability_score,
      notes || "Website verified"
    ).run();
    return new Response(JSON.stringify({
      success: true,
      message: "Website verified successfully",
      data: {
        id,
        verified_at: (/* @__PURE__ */ new Date()).toISOString(),
        verified_by: verified_by || "admin"
      }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error verifying website:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to verify website"
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
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
