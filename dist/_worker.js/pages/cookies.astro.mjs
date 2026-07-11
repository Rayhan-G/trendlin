globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                 */
import { a as createComponent, g as renderComponent, d as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_DVHrQl8d.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_CGfDT0zE.mjs';
export { renderers } from '../renderers.mjs';

const $$Cookies = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Cookie Policy - Trendlin" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="content-width py-12 sm:py-16"> <div class="max-w-4xl mx-auto"> <!-- Header --> <div class="mb-10"> <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Cookie Policy</h1> <div class="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div> <p class="text-gray-600 dark:text-gray-400 mt-4">Last updated: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p> </div> <div class="prose prose-lg dark:prose-invert max-w-none space-y-8"> <section class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700"> <h2 class="text-2xl font-bold mb-4">What Are Cookies?</h2> <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
Cookies are small text files stored on your device that help us improve your experience 
            on our website.
</p> </section> <section class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700"> <h2 class="text-2xl font-bold mb-4">How We Use Cookies</h2> <div class="space-y-4"> <div class="border-b border-gray-200 dark:border-gray-700 pb-4"> <h3 class="font-semibold text-lg">Essential Cookies</h3> <p class="text-gray-600 dark:text-gray-400 text-sm">Required for basic site functionality.</p> </div> <div class="border-b border-gray-200 dark:border-gray-700 pb-4"> <h3 class="font-semibold text-lg">Analytics Cookies</h3> <p class="text-gray-600 dark:text-gray-400 text-sm">Help us understand how visitors interact with our site.</p> </div> <div> <h3 class="font-semibold text-lg">Preference Cookies</h3> <p class="text-gray-600 dark:text-gray-400 text-sm">Remember your settings and preferences.</p> </div> </div> </section> <section class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700"> <h2 class="text-2xl font-bold mb-4">Managing Cookies</h2> <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
You can manage cookie preferences in your browser settings. Most browsers allow you to:
</p> <ul class="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mt-3"> <li>View cookies stored on your device</li> <li>Delete existing cookies</li> <li>Block cookies from specific sites</li> <li>Set preferences for future cookies</li> </ul> </section> <section class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700"> <h2 class="text-2xl font-bold mb-4">Contact Us</h2> <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
Questions about our cookie policy? Contact us at:
</p> <p class="text-gray-600 dark:text-gray-400 mt-3"> <a href="mailto:privacy@trendlin.com" class="text-blue-600 dark:text-blue-400 hover:underline">
privacy@trendlin.com
</a> </p> </section> </div> </div> </div> ` })}`;
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
