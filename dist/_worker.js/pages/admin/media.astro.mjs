globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                    */
import { a as createComponent, g as renderComponent, f as renderScript, d as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_DVHrQl8d.mjs';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_D8EielhZ.mjs';
/* empty css                                    */
export { renderers } from '../../renderers.mjs';

const $$Media = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Media Library - Trendlin", "data-astro-cid-wlnxg25n": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-7xl mx-auto p-6" data-astro-cid-wlnxg25n> <!-- Header --> <div class="flex flex-wrap items-center justify-between gap-4 mb-6" data-astro-cid-wlnxg25n> <div data-astro-cid-wlnxg25n> <h1 class="text-3xl font-bold text-gray-900" data-astro-cid-wlnxg25n>Media Library</h1> <p class="text-sm text-gray-500 mt-1" data-astro-cid-wlnxg25n> <span id="currentLocationDisplay" data-astro-cid-wlnxg25n>📁 Root</span> </p> </div> <div class="flex gap-3" data-astro-cid-wlnxg25n> <button id="createFolderBtn" class="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-xl shadow-lg shadow-green-500/25 transition-all" data-astro-cid-wlnxg25n>
📁 Create Folder
</button> <button id="uploadBtn" class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all" data-astro-cid-wlnxg25n>
📤 Upload to this Folder
</button> </div> </div> <!-- Breadcrumb Navigation --> <div class="flex items-center gap-2 mb-4 text-sm bg-gray-50 rounded-xl p-3 border border-gray-200" data-astro-cid-wlnxg25n> <button id="rootBtn" class="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1" data-astro-cid-wlnxg25n> <span data-astro-cid-wlnxg25n>📁</span> Root
</button> <span id="folderPath" class="text-gray-400" data-astro-cid-wlnxg25n></span> </div> <!-- Upload Progress --> <div id="uploadProgress" class="hidden mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200" data-astro-cid-wlnxg25n> <div class="flex items-center gap-3" data-astro-cid-wlnxg25n> <div class="flex-1" data-astro-cid-wlnxg25n> <div class="flex justify-between text-sm text-gray-600 mb-1" data-astro-cid-wlnxg25n> <span id="uploadFileName" data-astro-cid-wlnxg25n>Uploading...</span> <span id="uploadPercent" data-astro-cid-wlnxg25n>0%</span> </div> <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden" data-astro-cid-wlnxg25n> <div id="progressBar" class="h-full bg-blue-600 transition-all duration-300" style="width: 0%" data-astro-cid-wlnxg25n></div> </div> </div> </div> </div> <!-- Media Grid --> <div id="mediaGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" data-astro-cid-wlnxg25n></div> <!-- Empty State --> <div id="emptyState" class="hidden text-center py-12" data-astro-cid-wlnxg25n> <div class="text-6xl mb-4" data-astro-cid-wlnxg25n>📂</div> <h3 class="text-xl font-semibold text-gray-700 mb-2" data-astro-cid-wlnxg25n>This folder is empty</h3> <p class="text-gray-500" data-astro-cid-wlnxg25n>Upload images or create subfolders to organize your files</p> </div> <!-- Loading State --> <div id="loadingState" class="text-center py-12" data-astro-cid-wlnxg25n> <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" data-astro-cid-wlnxg25n></div> <p class="text-gray-500 mt-2" data-astro-cid-wlnxg25n>Loading media...</p> </div> <!-- Toast --> <div id="toast" class="hidden fixed bottom-4 right-4 max-w-sm p-4 rounded-xl shadow-lg z-50" data-astro-cid-wlnxg25n></div> </div> ` })} ${renderScript($$result, "P:/Projects/trendlin/src/pages/admin/media.astro?astro&type=script&index=0&lang.ts")} `;
}, "P:/Projects/trendlin/src/pages/admin/media.astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/admin/media.astro";
const $$url = "/admin/media";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Media,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
