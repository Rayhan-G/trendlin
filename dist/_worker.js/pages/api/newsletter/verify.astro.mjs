globalThis.process ??= {}; globalThis.process.env ??= {};
import { v as verifySubscriber } from '../../../chunks/newsletter_DvXc4akD.mjs';
import { E as EmailService } from '../../../chunks/email-service_BZMp7oTW.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ url, locals }) => {
  try {
    const token = url.searchParams.get("token");
    const env = locals.env;
    if (!token) {
      return new Response("Invalid verification token", { status: 400 });
    }
    const result = await verifySubscriber(env, token);
    if (!result.success) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/verify-failed" }
      });
    }
    try {
      const apiKey = process.env.RESEND_API_KEY || locals.env?.RESEND_API_KEY;
      if (apiKey && result.subscriber) {
        const emailService = new EmailService(apiKey);
        let categories = [];
        try {
          const prefs = result.subscriber.preferences ? JSON.parse(result.subscriber.preferences) : {};
          categories = prefs.categories || [];
        } catch (e) {
        }
        await emailService.sendNewsletterWelcome(
          result.subscriber.email,
          result.subscriber.first_name || void 0,
          categories
        );
        console.log(`✅ Welcome email sent to ${result.subscriber.email}`);
      }
    } catch (emailError) {
      console.error("❌ Failed to send welcome email:", emailError);
    }
    return new Response(null, {
      status: 302,
      headers: { Location: "/verify-success" }
    });
  } catch (error) {
    console.error("❌ Verification error:", error);
    return new Response("Verification failed", { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
