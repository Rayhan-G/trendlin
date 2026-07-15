globalThis.process ??= {}; globalThis.process.env ??= {};
import { j as getSubscriberStats, k as getCampaignStats, g as getLists } from '../../../chunks/newsletter_igr2G-4O.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ locals }) => {
  try {
    const env = locals.env;
    const [subscribers, campaigns, lists] = await Promise.all([
      getSubscriberStats(env),
      getCampaignStats(env),
      getLists(env, true)
    ]);
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          subscribers,
          campaigns,
          lists
        }
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching newsletter stats:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch stats" }),
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
