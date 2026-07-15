globalThis.process ??= {}; globalThis.process.env ??= {};
import { i as getSubscriberByEmail } from '../../../chunks/newsletter_DvXc4akD.mjs';
import { E as EmailService } from '../../../chunks/email-service_BZMp7oTW.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, locals }) => {
  try {
    const { email } = await request.json();
    const env = locals.env;
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400 }
      );
    }
    const subscriber = await getSubscriberByEmail(env, email);
    if (!subscriber) {
      return new Response(
        JSON.stringify({ error: "Subscriber not found" }),
        { status: 404 }
      );
    }
    if (subscriber.status === "active") {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Subscriber is already verified"
        }),
        { status: 400 }
      );
    }
    if (!subscriber.verification_token) {
      return new Response(
        JSON.stringify({ error: "No verification token found" }),
        { status: 400 }
      );
    }
    const apiKey = process.env.RESEND_API_KEY || locals.env?.RESEND_API_KEY;
    if (!apiKey) {
      console.error("❌ RESEND_API_KEY not set");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500 }
      );
    }
    const emailService = new EmailService(apiKey);
    await emailService.sendNewsletterVerification(
      email,
      subscriber.verification_token,
      subscriber.first_name || void 0
    );
    return new Response(
      JSON.stringify({
        success: true,
        message: "Verification email resent successfully"
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error resending verification:", error);
    return new Response(
      JSON.stringify({ error: "Failed to resend verification" }),
      { status: 500 }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
