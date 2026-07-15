globalThis.process ??= {}; globalThis.process.env ??= {};
import { v as verifySubscriber } from '../../../chunks/newsletter_D8gOgD2s.mjs';
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
    return new Response(null, {
      status: 302,
      headers: { Location: "/verify-success" }
    });
  } catch (error) {
    console.error("Verification error:", error);
    return new Response("Verification failed", { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
