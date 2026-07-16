globalThis.process ??= {}; globalThis.process.env ??= {};
import { f as deleteSubscriber, h as getSubscribers } from '../../../../chunks/newsletter_l7Og6U9s.mjs';
export { renderers } from '../../../../renderers.mjs';

const GET = async ({ locals, url }) => {
  try {
    const env = locals.env;
    const page = parseInt(url.searchParams.get("page") || "1");
    const perPage = parseInt(url.searchParams.get("per_page") || "20");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");
    const offset = (page - 1) * perPage;
    const subscribers = await getSubscribers(env, {
      status: status || void 0,
      search: search || void 0,
      limit: perPage,
      offset
    });
    return new Response(
      JSON.stringify({
        success: true,
        data: subscribers,
        page,
        perPage
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch subscribers" }),
      { status: 500 }
    );
  }
};
const DELETE = async ({ request, locals }) => {
  try {
    const env = locals.env;
    const adminId = locals.user?.id;
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get("id") || "0");
    if (!adminId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }
    if (!id) {
      return new Response(
        JSON.stringify({ error: "Subscriber ID required" }),
        { status: 400 }
      );
    }
    await deleteSubscriber(env, id);
    return new Response(
      JSON.stringify({
        success: true,
        message: "Subscriber deleted successfully"
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting subscriber:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete subscriber" }),
      { status: 500 }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
