globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                 */
import { a as createComponent, f as renderComponent, d as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_C5D88m4V.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_o7T6o6BI.mjs';
export { renderers } from '../renderers.mjs';

const $$Terms = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Terms of Service - Trendlin" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="content-width py-12 sm:py-16"> <div class="max-w-4xl mx-auto"> <!-- Header --> <div class="mb-10"> <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1> <div class="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div> <p class="text-gray-600 dark:text-gray-400 mt-4">Last updated: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p> </div> <div class="prose prose-lg dark:prose-invert max-w-none space-y-8"> <section class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700"> <h2 class="text-2xl font-bold mb-4">1. Acceptance of Terms</h2> <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
By using Trendlin, you agree to these Terms of Service. If you do not agree, please do not use our services.
</p> </section> <section class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700"> <h2 class="text-2xl font-bold mb-4">2. Content Ownership</h2> <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
You retain ownership of content you submit to Trendlin. By submitting content, you grant us 
            a license to display and distribute it on our platform.
</p> </section> <section class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700"> <h2 class="text-2xl font-bold mb-4">3. User Responsibilities</h2> <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
You are responsible for:
</p> <ul class="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mt-3"> <li>Content you publish</li> <li>Maintaining account security</li> <li>Complying with applicable laws</li> <li>Respecting intellectual property rights</li> </ul> </section> <section class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700"> <h2 class="text-2xl font-bold mb-4">4. Prohibited Content</h2> <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
You may not publish content that:
</p> <ul class="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mt-3"> <li>Infringes on intellectual property</li> <li>Contains hate speech or discrimination</li> <li>Promotes illegal activities</li> <li>Contains malware or harmful code</li> </ul> </section> <section class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700"> <h2 class="text-2xl font-bold mb-4">5. Termination</h2> <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
We reserve the right to terminate accounts for violations of these terms or for any other reason.
</p> </section> <section class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700"> <h2 class="text-2xl font-bold mb-4">6. Contact</h2> <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
Questions about these Terms? Contact us at:
</p> <p class="text-gray-600 dark:text-gray-400 mt-3"> <a href="mailto:legal@trendlin.com" class="text-blue-600 dark:text-blue-400 hover:underline">
legal@trendlin.com
</a> </p> </section> </div> </div> </div> ` })}`;
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
