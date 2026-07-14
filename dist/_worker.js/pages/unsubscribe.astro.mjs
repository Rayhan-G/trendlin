globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                 */
import { a as createComponent, g as renderComponent, e as renderScript, f as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_DJuXqbzQ.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_CwoGLPu0.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$BaseLayout, { "title": "Unsubscribe | Trendlin" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div id="unsubscribe-app" class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"> <!-- Loading State --> <div id="loading-state" class="text-center"> <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div> <p class="mt-4 text-gray-600 dark:text-gray-400">Loading...</p> </div> <!-- Error State --> <div id="error-state" class="hidden max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"> <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4"> <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path> </svg> </div> <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something Went Wrong</h2> <p id="error-message" class="text-gray-600 dark:text-gray-400"></p> <a href="/" class="inline-block mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
Return Home
</a> </div> <!-- Success State --> <div id="success-state" class="hidden max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"> <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"> <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg> </div> <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Unsubscribed Successfully</h2> <p id="success-message" class="text-gray-600 dark:text-gray-400"></p> <p class="text-sm text-gray-500 dark:text-gray-500 mt-4">
You won't receive any more emails from us. If this was a mistake, you can${" "} <a href="/" class="text-blue-600 dark:text-blue-400 hover:underline">resubscribe</a>.
</p> </div> <!-- Modal Container --> <div id="modal-container"></div> </div> ` })} ${renderScript($$result, "P:/Projects/trendlin/src/pages/unsubscribe/index.astro?astro&type=script&index=0&lang.ts")} `;
}, "P:/Projects/trendlin/src/pages/unsubscribe/index.astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/unsubscribe/index.astro";
const $$url = "/unsubscribe";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
