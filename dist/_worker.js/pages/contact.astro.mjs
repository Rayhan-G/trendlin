globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                 */
import { a as createComponent, g as renderComponent, d as renderTemplate, m as maybeRenderHead, f as renderScript } from '../chunks/astro/server_DVHrQl8d.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_CGfDT0zE.mjs';
export { renderers } from '../renderers.mjs';

const $$Contact = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$BaseLayout, { "title": "Contact Us - Trendlin" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-5xl mx-auto px-4 py-12 sm:py-16"> <!-- Header --> <div class="text-center mb-12"> <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-wide" style="font-family: 'Space Grotesk', sans-serif;">
CONTACT US
</h1> <p class="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg" style="font-family: 'Inter', sans-serif;">
If you have any questions, please feel free to get in touch with us via email or the form below.
</p> </div> <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12"> <!-- Form --> <div class="lg:col-span-2"> <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 tracking-wide" style="font-family: 'Space Grotesk', sans-serif;">
GET IN TOUCH
</h2> <form id="contactForm" class="space-y-5"> <div> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 tracking-wide" style="font-family: 'Inter', sans-serif;">
NAME <span class="text-red-500">*</span> </label> <input type="text" id="name" required placeholder="Enter your name" class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" style="font-family: 'Inter', sans-serif;"> </div> <div> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 tracking-wide" style="font-family: 'Inter', sans-serif;">
EMAIL <span class="text-red-500">*</span> </label> <input type="email" id="email" required placeholder="Enter your email" class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" style="font-family: 'Inter', sans-serif;"> </div> <div> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 tracking-wide" style="font-family: 'Inter', sans-serif;">
MESSAGE <span class="text-red-500">*</span> </label> <textarea id="message" rows="5" required placeholder="Enter your message" class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-shadow" style="font-family: 'Inter', sans-serif;"></textarea> </div> <div id="statusMessage" class="hidden p-3 rounded-lg text-sm" style="font-family: 'Inter', sans-serif;"></div> <button type="submit" id="submitBtn" class="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors tracking-wide" style="font-family: 'Inter', sans-serif;">
SEND MESSAGE
</button> </form> </div> <!-- Contact Information --> <div class="lg:col-span-1"> <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 tracking-wide" style="font-family: 'Space Grotesk', sans-serif;">
CONTACT INFORMATION
</h2> <div> <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1" style="font-family: 'Inter', sans-serif;">
EMAIL
</h3> <p class="text-gray-600 dark:text-gray-400" style="font-family: 'Inter', sans-serif;"> <a href="mailto:contact@trendlin.com" class="hover:text-blue-600 transition-colors">contact@trendlin.com</a> </p> <!-- Gmail Link Option --> <p class="text-xs text-gray-400 dark:text-gray-500 mt-1"> <a href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@trendlin.com" target="_blank" rel="noopener noreferrer" class="hover:text-blue-600 transition-colors">
Open in Gmail →
</a> </p> </div> </div> </div> </div> ${renderScript($$result2, "P:/Projects/trendlin/src/pages/contact.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "P:/Projects/trendlin/src/pages/contact.astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/contact.astro";
const $$url = "/contact";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Contact,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
