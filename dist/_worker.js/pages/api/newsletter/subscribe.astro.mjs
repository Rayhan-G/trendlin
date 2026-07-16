globalThis.process ??= {}; globalThis.process.env ??= {};
import { E as EmailService } from '../../../chunks/email-service_B8-8MdeA.mjs';
export { renderers } from '../../../renderers.mjs';

async function POST({ request, locals }) {
  try {
    console.log("📧 Subscribe API called");
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
    const RESEND_API_KEY = locals.runtime.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY missing");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email service not configured"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const { email, firstName, lastName } = await request.json();
    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid email address"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await DB.prepare("SELECT * FROM newsletter_subscribers WHERE email = ?").bind(normalizedEmail).first();
    if (existing && existing.status === "active") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Already subscribed"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    if (existing && existing.status === "pending") {
      const emailService2 = new EmailService(RESEND_API_KEY);
      await emailService2.sendNewsletterVerification(
        normalizedEmail,
        existing.verification_token,
        firstName
      );
      return new Response(
        JSON.stringify({
          success: true,
          message: "Verification email resent. Please check your inbox."
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    if (existing && existing.status === "unsubscribed") {
      const newToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      await DB.prepare(`
          UPDATE newsletter_subscribers 
          SET status = 'pending',
              verification_token = ?,
              unsubscribed_at = NULL,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(newToken, existing.id).run();
      const emailService2 = new EmailService(RESEND_API_KEY);
      await emailService2.sendNewsletterVerification(normalizedEmail, newToken, firstName);
      return new Response(
        JSON.stringify({
          success: true,
          message: "Welcome back! Please verify your email."
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const unsubscribeToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const result = await DB.prepare(`
        INSERT INTO newsletter_subscribers (
          email, first_name, last_name, status,
          verification_token, unsubscribe_token, source,
          ip_address, user_agent
        ) VALUES (?, ?, ?, 'pending', ?, ?, 'website', ?, ?)
      `).bind(
      normalizedEmail,
      firstName || "",
      lastName || "",
      verificationToken,
      unsubscribeToken,
      request.headers.get("cf-connecting-ip") || "",
      request.headers.get("user-agent") || ""
    ).run();
    const subscriberId = result.meta.last_row_id;
    await DB.prepare(`
        INSERT OR IGNORE INTO newsletter_list_members (subscriber_id, list_id)
        VALUES (?, (SELECT id FROM newsletter_lists WHERE slug = 'general'))
      `).bind(subscriberId).run();
    const emailService = new EmailService(RESEND_API_KEY);
    await emailService.sendNewsletterVerification(normalizedEmail, verificationToken, firstName);
    return new Response(
      JSON.stringify({
        success: true,
        message: "Please check your email to verify your subscription."
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("❌ Subscribe error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to subscribe"
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
