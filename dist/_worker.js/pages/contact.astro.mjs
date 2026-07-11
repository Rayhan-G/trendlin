globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                 */
import { a as createComponent, g as renderComponent, d as renderTemplate, m as maybeRenderHead, f as renderScript } from '../chunks/astro/server_DVHrQl8d.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_CGfDT0zE.mjs';
export { renderers } from '../renderers.mjs';

const $$Contact = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$BaseLayout, { "title": "Contact Us - Trendlin" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-4xl mx-auto px-4 py-12"> <div class="text-center mb-12"> <h1 class="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1> <p class="text-lg text-gray-600 max-w-2xl mx-auto">
Have a question, suggestion, or just want to say hello? We'd love to hear from you!
</p> </div> <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"> <div class="text-center p-6 bg-gray-50 rounded-xl"> <div class="text-3xl mb-3">📧</div> <h3 class="font-semibold text-gray-900">Email</h3> <p class="text-gray-600">contact@trendlin.com</p> </div> <div class="text-center p-6 bg-gray-50 rounded-xl"> <div class="text-3xl mb-3">💬</div> <h3 class="font-semibold text-gray-900">Response Time</h3> <p class="text-gray-600">24-48 hours</p> </div> <div class="text-center p-6 bg-gray-50 rounded-xl"> <div class="text-3xl mb-3">🌐</div> <h3 class="font-semibold text-gray-900">Social</h3> <p class="text-gray-600">@trendlin</p> </div> </div> <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"> <form id="contactForm" class="space-y-6"> <div class="grid grid-cols-1 md:grid-cols-2 gap-6"> <div> <label class="block text-sm font-medium text-gray-700 mb-2">Name *</label> <input type="text" id="name" required placeholder="Your name" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"> </div> <div> <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label> <input type="email" id="email" required placeholder="your@email.com" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"> </div> </div> <div> <label class="block text-sm font-medium text-gray-700 mb-2">Subject *</label> <input type="text" id="subject" required placeholder="What's this about?" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"> </div> <div> <label class="block text-sm font-medium text-gray-700 mb-2">Phone (optional)</label> <input type="tel" id="phone" placeholder="+1 (555) 123-4567" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"> </div> <div> <label class="block text-sm font-medium text-gray-700 mb-2">Message *</label> <textarea id="message" rows="6" required placeholder="Tell us how we can help..." class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea> </div> <div id="statusMessage" class="hidden p-4 rounded-xl"></div> <button type="submit" id="submitBtn" class="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all">
Send Message
</button> </form> </div> </div> ${renderScript($$result2, "P:/Projects/trendlin/src/pages/contact.astro?astro&type=script&index=0&lang.ts")} ` })}`;
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
