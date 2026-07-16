globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../renderers.mjs';

async function POST({ request, locals }) {
  try {
    console.log("📧 Unsubscribe API called");
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
    const { email, token, reason, feedback } = await request.json();
    let subscriber = null;
    if (token) {
      subscriber = await DB.prepare("SELECT * FROM newsletter_subscribers WHERE unsubscribe_token = ?").bind(token).first();
    } else if (email) {
      subscriber = await DB.prepare("SELECT * FROM newsletter_subscribers WHERE email = ?").bind(email.toLowerCase().trim()).first();
    }
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
    if (subscriber.status === "unsubscribed") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Already unsubscribed"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    await DB.prepare(`
        UPDATE newsletter_subscribers 
        SET status = 'unsubscribed',
            unsubscribed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(subscriber.id).run();
    await DB.prepare(`
        UPDATE newsletter_list_members 
        SET subscribed = 0,
            updated_at = CURRENT_TIMESTAMP
        WHERE subscriber_id = ?
      `).bind(subscriber.id).run();
    await DB.prepare(`
        INSERT INTO newsletter_events (subscriber_id, type, metadata)
        VALUES (?, 'unsubscribe', ?)
      `).bind(
      subscriber.id,
      JSON.stringify({ reason, feedback })
    ).run();
    if (reason || feedback) {
      await DB.prepare(`
          INSERT INTO unsubscribe_feedback (subscriber_id, reason, feedback)
          VALUES (?, ?, ?)
        `).bind(
        subscriber.id,
        reason || null,
        feedback || null
      ).run();
    }
    return new Response(
      JSON.stringify({
        success: true,
        message: "Successfully unsubscribed",
        data: {
          email: subscriber.email,
          unsubscribedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("❌ Unsubscribe error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to unsubscribe"
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
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
