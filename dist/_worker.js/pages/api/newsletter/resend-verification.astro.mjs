globalThis.process ??= {}; globalThis.process.env ??= {};
import { f as getSubscriberByEmail } from '../../../chunks/newsletter_DBEiW4Ks.mjs';
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
    const { email } = body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid email address" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const subscriber = await getSubscriberByEmail(email, db);
    if (!subscriber) {
      return new Response(
        JSON.stringify({ success: false, message: "No subscription found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    if (subscriber.status === "active") {
      return new Response(
        JSON.stringify({ success: false, message: "Email already verified" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    await db.prepare(`
      UPDATE subscribers 
      SET verification_token = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(token, subscriber.id).run();
    const emailService = new EmailService(apiKey);
    await emailService.sendNewsletterVerification(email, token, subscriber.first_name);
    return new Response(
      JSON.stringify({
        success: true,
        message: "Verification email resent! Please check your inbox."
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Resend verification error:", error);
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
