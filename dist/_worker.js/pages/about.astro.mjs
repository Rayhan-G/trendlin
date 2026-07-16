globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                 */
import { a as createComponent, g as renderComponent, f as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_DJuXqbzQ.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_DQkzEtM1.mjs';
export { renderers } from '../renderers.mjs';

const $$About = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "About - Trendlin" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-4xl mx-auto px-4 py-12 sm:py-16"> <!-- Header --> <div class="text-center mb-12"> <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
About Trendlin
</h1> <div class="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div> </div> <!-- Content --> <div class="space-y-6"> <!-- Mission --> <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700"> <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2> <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
Trendlin is a modern content platform dedicated to sharing insightful articles, 
          stories, and perspectives on technology, design, and the future. We believe in 
          the power of ideas and the importance of thoughtful discourse.
</p> </div> <!-- What We Do --> <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700"> <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">What We Do</h2> <ul class="space-y-3 text-gray-600 dark:text-gray-300"> <li class="flex items-start gap-3"> <span class="text-blue-500 mt-1">✦</span> <span>Publish high-quality articles on diverse topics</span> </li> <li class="flex items-start gap-3"> <span class="text-blue-500 mt-1">✦</span> <span>Provide a platform for thoughtful perspectives</span> </li> <li class="flex items-start gap-3"> <span class="text-blue-500 mt-1">✦</span> <span>Build a community of curious minds</span> </li> <li class="flex items-start gap-3"> <span class="text-blue-500 mt-1">✦</span> <span>Explore the intersection of technology and humanity</span> </li> </ul> </div> <!-- Contact --> <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700"> <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Get in Touch</h2> <p class="text-gray-600 dark:text-gray-300 mb-6">
Have questions, suggestions, or want to contribute? We'd love to hear from you!
</p> <a href="/contact" class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path> </svg>
Contact Us
</a> </div> </div> </div> ` })}`;
}, "P:/Projects/trendlin/src/pages/about.astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/about.astro";
const $$url = "/about";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$About,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
