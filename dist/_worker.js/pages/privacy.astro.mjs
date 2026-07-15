globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                 */
import { a as createComponent, g as renderComponent, f as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_DJuXqbzQ.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_Cya1Z72L.mjs';
export { renderers } from '../renderers.mjs';

const $$Privacy = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Privacy Policy - Trendlin" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-4xl mx-auto px-4 py-12 sm:py-16"> <!-- Header --> <div class="text-center mb-12"> <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
Privacy Policy
</h1> <div class="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div> <p class="text-gray-600 dark:text-gray-300 mt-6 max-w-2xl mx-auto">
Your privacy matters to us. Here's how we handle your data.
</p> </div> <div class="space-y-6"> <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700"> <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Information We Collect</h2> <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
We collect information you provide directly to us, such as when you create an account, 
          subscribe to our newsletter, or contact us. This may include:
</p> <ul class="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mt-3"> <li>Name and email address</li> <li>Account credentials</li> <li>Content you submit or publish</li> <li>Communication preferences</li> </ul> </div> <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700"> <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">How We Use Your Information</h2> <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
We use the information we collect to:
</p> <ul class="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mt-3"> <li>Provide, maintain, and improve our services</li> <li>Send you updates and newsletters</li> <li>Respond to your comments and questions</li> <li>Monitor and analyze usage trends</li> </ul> </div> <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700"> <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Data Security</h2> <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
We implement appropriate technical and organizational measures to protect your personal 
          information against unauthorized access, alteration, disclosure, or destruction.
</p> </div> <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700"> <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Cookies</h2> <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
We use cookies to enhance your experience on our site. You can control cookie preferences 
          in your browser settings.
</p> </div> <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700"> <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h2> <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
If you have any questions about this Privacy Policy, please contact us:
</p> <div class="mt-4"> <a href="/contact?subject=privacy" class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path> </svg>
Contact Privacy Team
</a> </div> </div> <div class="text-center text-sm text-gray-400 dark:text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-700"> <p>Last updated: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p> </div> </div> </div> ` })}`;
}, "P:/Projects/trendlin/src/pages/privacy.astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/privacy.astro";
const $$url = "/privacy";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Privacy,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
