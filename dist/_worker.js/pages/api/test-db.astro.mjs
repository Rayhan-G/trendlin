globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../renderers.mjs';

const GET = async ({ locals }) => {
  try {
    let db = null;
    let source = "none";
    let debugInfo = {};
    debugInfo = {
      localsKeys: Object.keys(locals),
      hasRuntime: !!locals.runtime,
      hasCloudflare: !!locals.cloudflare,
      hasEnv: !!locals.env,
      runtimeKeys: locals.runtime ? Object.keys(locals.runtime) : [],
      cloudflareKeys: locals.cloudflare ? Object.keys(locals.cloudflare) : [],
      envKeys: locals.env ? Object.keys(locals.env) : []
    };
    if (locals.env?.DB) {
      db = locals.env.DB;
      source = "locals.env.DB";
    } else if (locals.runtime?.env?.DB) {
      db = locals.runtime.env.DB;
      source = "locals.runtime.env.DB";
    } else if (locals.cloudflare?.env?.DB) {
      db = locals.cloudflare.env.DB;
      source = "locals.cloudflare.env.DB";
    } else if (globalThis.DB) {
      db = globalThis.DB;
      source = "globalThis.DB";
    }
    if (!db) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Database not found in any location",
          debug: debugInfo,
          availableMethods: {
            "locals.env.DB": !!locals.env?.DB,
            "locals.runtime.env.DB": !!locals.runtime?.env?.DB,
            "locals.cloudflare.env.DB": !!locals.cloudflare?.env?.DB,
            "globalThis.DB": !!globalThis.DB
          }
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const countResult = await db.prepare("SELECT COUNT(*) as count FROM subscribers").first();
    return new Response(
      JSON.stringify({
        success: true,
        message: "Database connected successfully!",
        source,
        subscriberCount: countResult?.count || 0,
        debug: debugInfo
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : void 0
      }),
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
