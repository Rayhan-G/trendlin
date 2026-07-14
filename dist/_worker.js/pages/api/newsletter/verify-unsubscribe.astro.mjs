globalThis.process ??= {}; globalThis.process.env ??= {};
import { g as getSubscriberByEmailAndToken } from '../../../chunks/newsletter_CaZ-NDLu.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ url }) => {
  try {
    const email = url.searchParams.get("email");
    const token = url.searchParams.get("token");
    if (!email || !token) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required parameters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const subscriber = await getSubscriberByEmailAndToken(email, token);
    if (!subscriber) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid unsubscribe link" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    if (subscriber.subscribed === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "You are already unsubscribed" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          email: subscriber.email,
          firstName: subscriber.firstName
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Verify unsubscribe error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Something went wrong" }),
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
