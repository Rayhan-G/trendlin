globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                 */
import { a as createComponent, g as renderComponent, f as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_DJuXqbzQ.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_Cya1Z72L.mjs';
export { renderers } from '../renderers.mjs';

const $$VerifyFailed = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$BaseLayout, { "title": "Verification Failed | Trendlin" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4"> <div class="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"> <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4"> <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path> </svg> </div> <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
Verification Failed ❌
</h1> <p class="text-gray-600 dark:text-gray-400">
The verification link is invalid or has expired. Please try subscribing again.
</p> <a href="/" class="inline-block mt-6 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300">
Return Home
</a> </div> </div> ` })}`;
}, "P:/Projects/trendlin/src/pages/verify-failed.astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/verify-failed.astro";
const $$url = "/verify-failed";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$VerifyFailed,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
