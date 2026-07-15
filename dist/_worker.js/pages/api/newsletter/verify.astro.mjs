globalThis.process ??= {}; globalThis.process.env ??= {};
import { l as getSubscriberByToken, v as verifySubscriber } from '../../../chunks/newsletter_DBEiW4Ks.mjs';
import { E as EmailService } from '../../../chunks/email-service_ZcUUqy12.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ url, locals }) => {
  try {
    const db = locals?.runtime?.env?.DB;
    const apiKey = locals?.runtime?.env?.RESEND_API_KEY || "re_Kfpjk4uw_7ZACMZFkoSWKJHoTh7cosEf9";
    if (!db) {
      return new Response(
        JSON.stringify({ success: false, message: "Database not available" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const token = url.searchParams.get("token");
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing verification token" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const subscriber = await getSubscriberByToken(token, db);
    if (!subscriber) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid verification token" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    if (subscriber.status === "active") {
      return new Response(null, {
        status: 302,
        headers: { Location: "/verify-success" }
      });
    }
    const verified = await verifySubscriber(token, db);
    if (apiKey && verified) {
      try {
        const emailService = new EmailService(apiKey);
        const categories = verified.categories ? verified.categories.split(",") : [];
        await emailService.sendNewsletterWelcome(
          verified.email,
          verified.first_name || void 0,
          categories
        );
      } catch (emailError) {
        console.error("Welcome email error:", emailError);
      }
    }
    return new Response(null, {
      status: 302,
      headers: { Location: "/verify-success" }
    });
  } catch (error) {
    console.error("Verification error:", error);
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
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
