globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                       */
import { a as createComponent, g as renderComponent, e as renderScript, f as renderTemplate, m as maybeRenderHead } from '../../../chunks/astro/server_DJuXqbzQ.mjs';
import { $ as $$AdminLayout } from '../../../chunks/AdminLayout_Cu1IFVzQ.mjs';
export { renderers } from '../../../renderers.mjs';

const $$Subscribers = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Subscribers | Newsletter" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="p-6"> <div class="flex justify-between items-center mb-6"> <div> <h1 class="text-2xl font-bold text-gray-900 dark:text-white">📬 Subscribers</h1> <p class="text-sm text-gray-500 dark:text-gray-400">Manage your newsletter subscribers</p> </div> <div class="flex gap-3"> <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Export CSV</button> </div> </div> <!-- Stats --> <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6"> <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4"> <p class="text-sm text-gray-500 dark:text-gray-400">Total</p> <p id="total-subscribers" class="text-2xl font-bold text-gray-900 dark:text-white">—</p> </div> <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4"> <p class="text-sm text-gray-500 dark:text-gray-400">Active</p> <p id="active-subscribers" class="text-2xl font-bold text-green-600">—</p> </div> <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4"> <p class="text-sm text-gray-500 dark:text-gray-400">Pending</p> <p id="pending-subscribers" class="text-2xl font-bold text-yellow-600">—</p> </div> <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4"> <p class="text-sm text-gray-500 dark:text-gray-400">Unsubscribed</p> <p id="unsubscribed-subscribers" class="text-2xl font-bold text-red-600">—</p> </div> </div> <!-- Filters --> <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6"> <div class="flex flex-wrap gap-4"> <select id="status-filter" class="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"> <option value="">All Status</option> <option value="active">Active</option> <option value="pending">Pending</option> <option value="unsubscribed">Unsubscribed</option> </select> <input type="text" id="search-input" placeholder="Search by email..." class="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 flex-1 min-w-[200px]"> <button id="search-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Search</button> </div> </div> <!-- Subscriber List --> <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"> <div class="overflow-x-auto"> <table class="w-full"> <thead class="bg-gray-50 dark:bg-gray-700"> <tr> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subscribed</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Opens</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th> </tr> </thead> <tbody id="subscriber-list" class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"> <tr><td colspan="6" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">Loading subscribers...</td></tr> </tbody> </table> </div> </div> </div> ` })} ${renderScript($$result, "P:/Projects/trendlin/src/pages/admin/newsletter/subscribers.astro?astro&type=script&index=0&lang.ts")}`;
}, "P:/Projects/trendlin/src/pages/admin/newsletter/subscribers.astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/admin/newsletter/subscribers.astro";
const $$url = "/admin/newsletter/subscribers";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Subscribers,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
