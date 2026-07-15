globalThis.process ??= {}; globalThis.process.env ??= {};
import { g as getCampaigns } from '../../../chunks/newsletter_D8gOgD2s.mjs';
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
