globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                 */
import { a as createComponent, g as renderComponent, f as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_DJuXqbzQ.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_atBcAxL6.mjs';
export { renderers } from '../renderers.mjs';

const $$Terms = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Terms of Service - Trendlin" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-4xl mx-auto px-4 py-12 sm:py-16"> <!-- Header --> <div class="text-center mb-12"> <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
Terms of Service
</h1> <div class="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div> <p class="text-gray-600 dark:text-gray-300 mt-6 max-w-2xl mx-auto">
By using Trendlin, you agree to these terms.
</p> </div> <div class="space-y-6"> <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700"> <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Acceptance of Terms</h2> <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
By accessing and using Trendlin, you agree to comply with these Terms of Service. 
          If you do not agree, please do not use our services.
</p> </div> <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700"> <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Content Ownership</h2> <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
You retain ownership of content you submit to Trendlin. By submitting content, you grant us 
          a license to display and distribute it on our platform.
</p> </div> <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700"> <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">User Responsibilities</h2> <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
You are responsible for:
</p> <ul class="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mt-3"> <li>Content you publish</li> <li>Maintaining account security</li> <li>Complying with applicable laws</li> <li>Respecting intellectual property rights</li> </ul> </div> <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700"> <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Prohibited Content</h2> <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
You may not publish content that:
</p> <ul class="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mt-3"> <li>Infringes on intellectual property</li> <li>Contains hate speech or discrimination</li> <li>Promotes illegal activities</li> <li>Contains malware or harmful code</li> </ul> </div> <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700"> <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Termination</h2> <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
We reserve the right to terminate accounts for violations of these terms or for any other reason.
</p> </div> <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700"> <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h2> <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
Questions about these Terms?
</p> <div class="mt-4"> <a href="/contact?subject=legal" class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path> </svg>
Contact Legal Team
</a> </div> </div> <div class="text-center text-sm text-gray-400 dark:text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-700"> <p>Last updated: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p> </div> </div> </div> ` })}`;
}, "P:/Projects/trendlin/src/pages/terms.astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/terms.astro";
const $$url = "/terms";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Terms,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
