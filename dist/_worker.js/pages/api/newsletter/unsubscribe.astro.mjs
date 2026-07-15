globalThis.process ??= {}; globalThis.process.env ??= {};
import { m as unsubscribeSubscriber } from '../../../chunks/newsletter_igr2G-4O.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, locals }) => {
  try {
    const { email, token } = await request.json();
    const env = locals.env;
    const result = await unsubscribeSubscriber(env, token, email);
    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 404 }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        message: "You have been unsubscribed successfully."
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to unsubscribe" }),
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
