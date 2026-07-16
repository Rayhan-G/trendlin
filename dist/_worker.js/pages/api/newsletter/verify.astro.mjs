globalThis.process ??= {}; globalThis.process.env ??= {};
import { E as EmailService } from '../../../chunks/email-service_B8-8MdeA.mjs';
export { renderers } from '../../../renderers.mjs';

async function GET({ url, locals, redirect }) {
  try {
    console.log("📧 Verify API called");
    const { DB } = locals.runtime.env;
    if (!DB) {
      console.error("❌ Database not available!");
      return redirect("/verify-failed?reason=database_error");
    }
    const token = url.searchParams.get("token");
    if (!token) {
      console.error("❌ No token provided");
      return redirect("/verify-failed?reason=missing_token");
    }
    console.log("🔍 Verifying token:", token.substring(0, 10) + "...");
    const subscriber = await DB.prepare("SELECT * FROM newsletter_subscribers WHERE verification_token = ?").bind(token).first();
    if (!subscriber) {
      console.error("❌ Invalid token:", token);
      return redirect("/verify-failed?reason=invalid_token");
    }
    console.log("✅ Found subscriber:", subscriber.email, "Status:", subscriber.status);
    if (subscriber.status !== "pending") {
      if (subscriber.status === "active") {
        console.log("✅ Already verified:", subscriber.email);
        return redirect("/verify-success?already_verified=true");
      }
      console.log("❌ Invalid status:", subscriber.status);
      return redirect("/verify-failed?reason=already_verified");
    }
    await DB.prepare(`
        UPDATE newsletter_subscribers 
        SET status = 'active',
            verified_at = CURRENT_TIMESTAMP,
            verification_token = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(subscriber.id).run();
    await DB.prepare(`
        INSERT OR IGNORE INTO newsletter_list_members (subscriber_id, list_id)
        VALUES (?, (SELECT id FROM newsletter_lists WHERE slug = 'general'))
      `).bind(subscriber.id).run();
    await DB.prepare(`
        INSERT INTO newsletter_events (subscriber_id, type)
        VALUES (?, 'confirm')
      `).bind(subscriber.id).run();
    try {
      const RESEND_API_KEY = locals.runtime.env.RESEND_API_KEY;
      if (RESEND_API_KEY) {
        const emailService = new EmailService(RESEND_API_KEY);
        await emailService.sendNewsletterWelcome(
          subscriber.email,
          subscriber.first_name || void 0
        );
        console.log("✅ Welcome email sent to:", subscriber.email);
      } else {
        console.warn("⚠️ RESEND_API_KEY not available, skipping welcome email");
      }
    } catch (emailError) {
      console.error("❌ Welcome email failed:", emailError);
    }
    console.log("✅ Verification complete for:", subscriber.email);
    return redirect("/verify-success");
  } catch (error) {
    console.error("❌ Verification error:", error);
    return redirect("/verify-failed?reason=server_error");
  }
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
