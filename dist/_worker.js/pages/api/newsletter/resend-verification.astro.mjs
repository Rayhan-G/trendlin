globalThis.process ??= {}; globalThis.process.env ??= {};
import { f as getSubscriberByEmail } from '../../../chunks/newsletter_D8gOgD2s.mjs';
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
    const baseUrl = process.env.BASE_URL || "https://trendlin.com";
    const verificationLink = `${baseUrl}/api/newsletter/verify?token=${subscriber.verification_token}`;
    console.log(`[NEWSLETTER] Resending verification to ${email}`);
    console.log(`[NEWSLETTER] Verification link: ${verificationLink}`);
    return new Response(
      JSON.stringify({
        success: true,
        message: "Verification email resent successfully"
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error resending verification:", error);
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
