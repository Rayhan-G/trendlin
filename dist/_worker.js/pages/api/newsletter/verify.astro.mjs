globalThis.process ??= {}; globalThis.process.env ??= {};
import { g as getDB, p as prepareFirst } from '../../../chunks/db_CaYABffz.mjs';
import { E as EmailService } from '../../../chunks/email-service_BZMp7oTW.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ url, locals, redirect }) => {
  try {
    const token = url.searchParams.get("token");
    const env = locals.env;
    const db = getDB(env);
    if (!token) {
      return redirect("/verify-failed?reason=missing_token");
    }
    const subscriber = await prepareFirst(
      db,
      "SELECT * FROM newsletter_subscribers WHERE verification_token = ?",
      [token]
    );
    if (!subscriber) {
      return redirect("/verify-failed?reason=invalid_token");
    }
    if (subscriber.status !== "pending") {
      if (subscriber.status === "active") {
        return redirect("/verify-success?already_verified=true");
      }
      return redirect("/verify-failed?reason=already_verified");
    }
    await db.prepare(`
        UPDATE newsletter_subscribers 
        SET status = 'active',
            verified_at = CURRENT_TIMESTAMP,
            verification_token = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(subscriber.id).run();
    await db.prepare(`
        INSERT OR IGNORE INTO newsletter_list_members (subscriber_id, list_id)
        VALUES (?, (SELECT id FROM newsletter_lists WHERE slug = 'general'))
      `).bind(subscriber.id).run();
    await db.prepare(`
        INSERT INTO newsletter_events (subscriber_id, type)
        VALUES (?, 'confirm')
      `).bind(subscriber.id).run();
    try {
      const emailService = new EmailService(env.RESEND_API_KEY);
      await emailService.sendNewsletterWelcome(
        subscriber.email,
        subscriber.first_name || void 0
      );
    } catch (emailError) {
      console.error("Welcome email failed:", emailError);
    }
    return redirect("/verify-success");
  } catch (error) {
    console.error("Verification error:", error);
    return redirect("/verify-failed?reason=server_error");
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
