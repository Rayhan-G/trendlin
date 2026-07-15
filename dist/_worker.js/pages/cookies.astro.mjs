globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                 */
import { a as createComponent, g as renderComponent, f as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_DJuXqbzQ.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_Cya1Z72L.mjs';
export { renderers } from '../renderers.mjs';

const $$Cookies = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Cookie Policy - Trendlin" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-4xl mx-auto px-4 py-12 sm:py-16"> <!-- Header --> <div class="text-center mb-12"> <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
Cookie Policy
</h1> <div class="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div> <p class="text-gray-600 dark:text-gray-300 mt-6 max-w-2xl mx-auto">
Learn about how we use cookies to improve your experience.
</p> </div> <div class="space-y-6"> <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700"> <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">What Are Cookies?</h2> <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
Cookies are small text files stored on your device that help us improve your experience 
          on our website. They allow us to remember your preferences and understand how you interact 
          with our content.
</p> </div> <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700"> <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">How We Use Cookies</h2> <div class="space-y-4"> <div class="border-b border-gray-200 dark:border-gray-700 pb-4"> <h3 class="font-semibold text-lg text-gray-900 dark:text-white">Essential Cookies</h3> <p class="text-gray-600 dark:text-gray-300 text-sm">Required for basic site functionality. These cannot be disabled.</p> </div> <div class="border-b border-gray-200 dark:border-gray-700 pb-4"> <h3 class="font-semibold text-lg text-gray-900 dark:text-white">Analytics Cookies</h3> <p class="text-gray-600 dark:text-gray-300 text-sm">Help us understand how visitors interact with our site and improve our content.</p> </div> <div> <h3 class="font-semibold text-lg text-gray-900 dark:text-white">Preference Cookies</h3> <p class="text-gray-600 dark:text-gray-300 text-sm">Remember your settings and preferences for a better experience.</p> </div> </div> </div> <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700"> <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Managing Cookies</h2> <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
You can manage cookie preferences in your browser settings. Most browsers allow you to:
</p> <ul class="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mt-3"> <li>View cookies stored on your device</li> <li>Delete existing cookies</li> <li>Block cookies from specific sites</li> <li>Set preferences for future cookies</li> </ul> </div> <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700"> <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h2> <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
Questions about our Cookie Policy?
</p> <div class="mt-4"> <a href="/contact?subject=cookie" class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path> </svg>
Contact Support
</a> </div> </div> <div class="text-center text-sm text-gray-400 dark:text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-700"> <p>Last updated: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p> </div> </div> </div> ` })}`;
}, "P:/Projects/trendlin/src/pages/cookies.astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/cookies.astro";
const $$url = "/cookies";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Cookies,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
