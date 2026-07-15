globalThis.process ??= {}; globalThis.process.env ??= {};
import { f as getSubscriberByEmail, j as createSubscriber } from '../../../chunks/newsletter_DBEiW4Ks.mjs';
import { E as EmailService } from '../../../chunks/email-service_ZcUUqy12.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, locals }) => {
  try {
    const db = locals?.runtime?.env?.DB;
    const apiKey = locals?.runtime?.env?.RESEND_API_KEY || "re_Kfpjk4uw_7ZACMZFkoSWKJHoTh7cosEf9";
    if (!db) {
      return new Response(
        JSON.stringify({ success: false, message: "Database not available" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!apiKey) ;
    const body = await request.json();
    const { email, firstName, categories, source } = body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid email address" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const existing = await getSubscriberByEmail(email, db);
    if (existing) {
      if (existing.status === "active") {
        return new Response(
          JSON.stringify({ success: false, message: "Email already subscribed" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      if (existing.status === "pending") {
        const token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        await db.prepare(`
          UPDATE subscribers 
          SET verification_token = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(token, existing.id).run();
        const emailService2 = new EmailService(apiKey);
        await emailService2.sendNewsletterVerification(email, token, firstName);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Verification email resent! Please check your inbox."
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      if (existing.status === "unsubscribed") {
        const token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        await db.prepare(`
          UPDATE subscribers 
          SET status = 'pending',
              verification_token = ?,
              unsubscribed_at = NULL,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(token, existing.id).run();
        if (categories && categories.length > 0) {
          const categoriesStr = categories.join(",");
          await db.prepare(`
            UPDATE subscribers SET categories = ? WHERE id = ?
          `).bind(categoriesStr, existing.id).run();
        }
        const emailService2 = new EmailService(apiKey);
        await emailService2.sendNewsletterVerification(email, token, firstName);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Please check your email to verify your subscription."
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
    }
    const subscriber = await createSubscriber({
      email,
      firstName,
      categories: categories || ["general"],
      source: source || "website",
      ipAddress: request.headers.get("cf-connecting-ip") || void 0,
      userAgent: request.headers.get("user-agent") || void 0,
      referrer: request.headers.get("referer") || void 0
    }, db);
    const emailService = new EmailService(apiKey);
    await emailService.sendNewsletterVerification(email, subscriber.verification_token, firstName);
    return new Response(
      JSON.stringify({
        success: true,
        message: "Please check your email to verify your subscription."
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Subscribe error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong"
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
