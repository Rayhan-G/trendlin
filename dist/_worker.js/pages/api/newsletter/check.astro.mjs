globalThis.process ??= {}; globalThis.process.env ??= {};
import { i as getSubscriberByEmail } from '../../../chunks/newsletter_DvXc4akD.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ url, locals }) => {
  try {
    const email = url.searchParams.get("email");
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
        JSON.stringify({
          success: true,
          status: "not_found",
          message: "Email not found in our system"
        }),
        { status: 200 }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        status: subscriber.status,
        message: `Subscriber status: ${subscriber.status}`
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking subscriber:", error);
    return new Response(
      JSON.stringify({ error: "Failed to check subscriber" }),
      { status: 500 }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
