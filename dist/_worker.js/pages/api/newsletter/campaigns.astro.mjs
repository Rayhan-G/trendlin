globalThis.process ??= {}; globalThis.process.env ??= {};
import { a as getCampaigns } from '../../../chunks/newsletter_igr2G-4O.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ locals, url }) => {
  try {
    const env = locals.env;
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const campaigns = await getCampaigns(env, { limit });
    return new Response(
      JSON.stringify({
        success: true,
        data: campaigns
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch campaigns" }),
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
