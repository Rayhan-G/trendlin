globalThis.process ??= {}; globalThis.process.env ??= {};
import { g as getDB, p as prepareFirst } from '../../../chunks/db_CaYABffz.mjs';
import { E as EmailService } from '../../../chunks/email-service_BZMp7oTW.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, locals }) => {
  try {
    const { email, firstName, lastName, categories } = await request.json();
    const env = locals.env;
    const db = getDB(env);
    console.log("🔍 Subscribe API called with:", { email, firstName, categories });
    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email address" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY is missing from environment!");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email service is not configured. Please try again later."
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const existing = await prepareFirst(
      db,
      "SELECT * FROM newsletter_subscribers WHERE email = ?",
      [email.toLowerCase().trim()]
    );
    if (existing) {
      if (existing.status === "active") {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Already subscribed"
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      if (existing.status === "pending") {
        console.log("📧 Resending verification for pending subscriber:", email);
        try {
          const emailService = new EmailService(env.RESEND_API_KEY);
          await emailService.sendNewsletterVerification(
            email,
            existing.verification_token,
            firstName
          );
          console.log("✅ Verification email resent successfully!");
        } catch (emailError) {
          console.error("❌ Failed to resend verification:", emailError);
          return new Response(
            JSON.stringify({
              success: false,
              error: "Failed to send verification email. Please try again."
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
        return new Response(
          JSON.stringify({
            success: true,
            message: "Verification email resent. Please check your inbox."
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      if (existing.status === "unsubscribed") {
        const newToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        await db.prepare(`
            UPDATE newsletter_subscribers 
            SET status = 'pending',
                verification_token = ?,
                unsubscribed_at = NULL,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).bind(newToken, existing.id).run();
        console.log("📧 Sending verification for re-subscribe:", email);
        try {
          const emailService = new EmailService(env.RESEND_API_KEY);
          await emailService.sendNewsletterVerification(email, newToken, firstName);
          console.log("✅ Verification email sent successfully!");
        } catch (emailError) {
          console.error("❌ Failed to send verification:", emailError);
          return new Response(
            JSON.stringify({
              success: false,
              error: "Failed to send verification email. Please try again."
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
        return new Response(
          JSON.stringify({
            success: true,
            message: "Welcome back! Please verify your email."
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
    }
    console.log("📝 Creating new subscriber:", email);
    const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const unsubscribeToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const result = await db.prepare(`
        INSERT INTO newsletter_subscribers (
          email, first_name, last_name, status,
          verification_token, unsubscribe_token, source,
          ip_address, user_agent
        ) VALUES (?, ?, ?, 'pending', ?, ?, 'website', ?, ?)
      `).bind(
      email.toLowerCase().trim(),
      firstName || "",
      lastName || "",
      verificationToken,
      unsubscribeToken,
      request.headers.get("cf-connecting-ip") || "",
      request.headers.get("user-agent") || ""
    ).run();
    const subscriberId = result.meta.last_row_id;
    await db.prepare(`
        INSERT OR IGNORE INTO newsletter_list_members (subscriber_id, list_id)
        VALUES (?, (SELECT id FROM newsletter_lists WHERE slug = 'general'))
      `).bind(subscriberId).run();
    await db.prepare(`
        INSERT INTO newsletter_events (subscriber_id, type)
        VALUES (?, 'subscribe')
      `).bind(subscriberId).run();
    console.log("📧 Sending verification email to:", email);
    console.log("🔑 Verification token:", verificationToken);
    try {
      const emailService = new EmailService(env.RESEND_API_KEY);
      await emailService.sendNewsletterVerification(email, verificationToken, firstName);
      console.log("✅ Verification email sent successfully!");
    } catch (emailError) {
      console.error("❌ Failed to send verification email:", emailError);
      console.error("❌ Error details:", {
        message: emailError.message,
        stack: emailError.stack
      });
      return new Response(
        JSON.stringify({
          success: true,
          message: "Account created but verification email failed. Please try resending.",
          warning: true,
          data: {
            email,
            status: "pending"
          }
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        message: "Please check your email to verify your subscription.",
        data: {
          email,
          status: "pending"
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Subscribe error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to subscribe"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
