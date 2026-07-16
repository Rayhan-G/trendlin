globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../renderers.mjs';

const GET = async ({ locals }) => {
  const env1 = locals?.env || {};
  const env2 = locals?.runtime?.env || {};
  const env3 = locals || {};
  const allEnv = { ...env3, ...env1, ...env2 };
  return new Response(
    JSON.stringify({
      success: true,
      debug: {
        hasLocals: !!locals,
        hasEnv: !!locals?.env,
        hasRuntime: !!locals?.runtime,
        hasRuntimeEnv: !!locals?.runtime?.env,
        hasDB: !!allEnv.DB,
        dbType: allEnv.DB ? typeof allEnv.DB : "undefined",
        hasPrepare: allEnv.DB && typeof allEnv.DB.prepare === "function",
        hasResendKey: !!allEnv.RESEND_API_KEY,
        resendKeyPrefix: allEnv.RESEND_API_KEY ? allEnv.RESEND_API_KEY.substring(0, 6) : "none",
        allEnvKeys: Object.keys(allEnv),
        localsKeys: Object.keys(locals || {}),
        runtimeKeys: Object.keys(locals?.runtime || {}),
        runtimeEnvKeys: Object.keys(locals?.runtime?.env || {})
      }
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
