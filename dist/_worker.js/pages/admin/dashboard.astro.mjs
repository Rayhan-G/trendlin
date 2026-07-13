globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                    */
import { c as createAstro, a as createComponent, g as renderComponent, f as renderScript, d as renderTemplate, m as maybeRenderHead, b as addAttribute } from '../../chunks/astro/server_DVHrQl8d.mjs';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_D8EielhZ.mjs';
/* empty css                                        */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://b484b1fd.my-content-site.pages.dev");
const $$Dashboard = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Dashboard;
  let posts = [];
  try {
    const response = await fetch(`${Astro2.url.origin}/api/admin/posts`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.posts && Array.isArray(data.posts)) {
        posts = data.posts;
      } else if (Array.isArray(data)) {
        posts = data;
      }
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
  const totalPosts = Array.isArray(posts) ? posts.length : 0;
  const publishedPosts = Array.isArray(posts) ? posts.filter((p) => !p.is_draft).length : 0;
  const draftPosts = Array.isArray(posts) ? posts.filter((p) => p.is_draft).length : 0;
  let products = [];
  let totalProducts = 0;
  let productsInStock = 0;
  let totalResources = 0;
  try {
    const productsResponse = await fetch(`${Astro2.url.origin}/api/admin/products`);
    if (productsResponse.ok) {
      const data = await productsResponse.json();
      if (data && data.products && Array.isArray(data.products)) {
        products = data.products;
        totalProducts = products.length;
        productsInStock = products.filter((p) => p.in_stock === 1).length;
        totalResources = products.reduce((sum, p) => sum + (p.resource_count || 0), 0);
      }
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }
  let totalMedia = 0;
  let totalFolders = 0;
  try {
    const mediaResponse = await fetch(`${Astro2.url.origin}/api/admin/media`);
    if (mediaResponse.ok) {
      const data = await mediaResponse.json();
      if (data && data.success) {
        totalMedia = (data.media || []).length;
        totalFolders = (data.folders || []).length;
      }
    }
  } catch (error) {
    console.error("Error fetching media:", error);
  }
  let templates = [];
  let totalTemplates = 0;
  let activeTemplates = 0;
  let templateUsage = 0;
  try {
    const templatesResponse = await fetch(`${Astro2.url.origin}/api/admin/templates`);
    if (templatesResponse.ok) {
      const data = await templatesResponse.json();
      if (data && data.templates && Array.isArray(data.templates)) {
        templates = data.templates;
        totalTemplates = templates.length;
        activeTemplates = templates.filter((t) => t.is_active === 1).length;
        templateUsage = templates.reduce((sum, t) => sum + (t.usage_count || 0), 0);
      }
    }
  } catch (error) {
    console.error("Error fetching templates:", error);
  }
  let masterSources = [];
  let stateSources = [];
  let totalSources = 0;
  let totalMasterSources = 0;
  let totalStateSources = 0;
  try {
    const sourcesResponse = await fetch(`${Astro2.url.origin}/api/admin/sources`);
    if (sourcesResponse.ok) {
      const data = await sourcesResponse.json();
      if (data && data.success) {
        masterSources = data.master || [];
        stateSources = data.state || [];
        totalMasterSources = masterSources.length;
        totalStateSources = stateSources.length;
        totalSources = totalMasterSources + totalStateSources;
      }
    }
  } catch (error) {
    console.error("Error fetching sources:", error);
  }
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Dashboard - Trendlin" }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="mb-8"> <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"> <div> <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
Dashboard
</h1> <p class="text-sm text-gray-500 mt-1">
Welcome back! Here's what's happening with your content.
</p> </div> <div class="flex flex-wrap items-center gap-3"> <a href="/admin/media" class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path> </svg>
Media Library
</a> <a href="/admin/products/new" class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path> </svg>
Add Product
</a> <a href="/admin/new" class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path> </svg>
New Post
</a> </div> </div> </div>     <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8"> <a href="/admin/dashboard" class="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"> <div class="flex items-start justify-between"> <div> <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform mb-3"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path> </svg> </div> <h3 class="font-bold text-gray-900 text-lg">Posts</h3> <p class="text-sm text-gray-500">Manage your articles</p> </div> <span class="text-3xl font-bold text-blue-600">${totalPosts}</span> </div> <div class="mt-4 flex items-center gap-4 text-xs text-gray-500"> <span class="flex items-center gap-1"> <span class="w-2 h-2 rounded-full bg-green-500"></span> ${publishedPosts} published
</span> <span class="flex items-center gap-1"> <span class="w-2 h-2 rounded-full bg-yellow-500"></span> ${draftPosts} drafts
</span> </div> <div class="mt-3 pt-3 border-t border-blue-100 flex items-center justify-between"> <span class="text-xs text-blue-600 font-medium">View all posts →</span> <a href="/admin/new" class="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors">+ New</a> </div> </a> <!-- Feature 2: PRODUCTS --> <a href="/admin/products" class="group bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"> <div class="flex items-start justify-between"> <div> <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform mb-3"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path> </svg> </div> <h3 class="font-bold text-gray-900 text-lg">Products</h3> <p class="text-sm text-gray-500">Product catalog</p> </div> <span class="text-3xl font-bold text-orange-600">${totalProducts}</span> </div> <div class="mt-4 flex items-center gap-4 text-xs text-gray-500"> <span class="flex items-center gap-1"> <span class="w-2 h-2 rounded-full bg-green-500"></span> ${productsInStock} in stock
</span> <span class="flex items-center gap-1"> <span class="w-2 h-2 rounded-full bg-purple-500"></span> ${totalResources} resources
</span> </div> <div class="mt-3 pt-3 border-t border-orange-100 flex items-center justify-between"> <span class="text-xs text-orange-600 font-medium">View all products →</span> <a href="/admin/products/new" class="text-xs bg-orange-600 text-white px-3 py-1 rounded-lg hover:bg-orange-700 transition-colors">+ New</a> </div> </a> <!-- Feature 3: MEDIA --> <a href="/admin/media" class="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"> <div class="flex items-start justify-between"> <div> <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform mb-3"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path> </svg> </div> <h3 class="font-bold text-gray-900 text-lg">Media</h3> <p class="text-sm text-gray-500">Images & videos</p> </div> <span class="text-3xl font-bold text-green-600">${totalMedia}</span> </div> <div class="mt-4 flex items-center gap-4 text-xs text-gray-500"> <span class="flex items-center gap-1"> <span class="w-2 h-2 rounded-full bg-blue-500"></span> ${totalFolders} folders
</span> <span class="flex items-center gap-1"> <span class="w-2 h-2 rounded-full bg-green-500"></span> ${totalMedia} files
</span> </div> <div class="mt-3 pt-3 border-t border-green-100 flex items-center justify-between"> <span class="text-xs text-green-600 font-medium">Open Media Library →</span> <button onclick="document.getElementById('uploadBtn')?.click()" class="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors">+ Upload</button> </div> </a> <!-- Feature 4: TEMPLATES --> <a href="/admin/templates" class="group bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"> <div class="flex items-start justify-between"> <div> <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform mb-3"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path> </svg> </div> <h3 class="font-bold text-gray-900 text-lg">Templates</h3> <p class="text-sm text-gray-500">Content templates</p> </div> <span class="text-3xl font-bold text-indigo-600">${totalTemplates}</span> </div> <div class="mt-4 flex items-center gap-4 text-xs text-gray-500"> <span class="flex items-center gap-1"> <span class="w-2 h-2 rounded-full bg-green-500"></span> ${activeTemplates} active
</span> <span class="flex items-center gap-1"> <span class="w-2 h-2 rounded-full bg-orange-500"></span> ${templateUsage} uses
</span> </div> <div class="mt-3 pt-3 border-t border-indigo-100 flex items-center justify-between"> <span class="text-xs text-indigo-600 font-medium">Manage templates →</span> <button onclick="document.getElementById('openAddTemplateModal')?.click()" class="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition-colors">+ New</button> </div> </a> <!-- Feature 5: SOURCES --> <a href="/admin/sources" class="group bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl p-6 border border-cyan-100 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"> <div class="flex items-start justify-between"> <div> <div class="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center text-cyan-600 group-hover:scale-110 transition-transform mb-3"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path> </svg> </div> <h3 class="font-bold text-gray-900 text-lg">Sources</h3> <p class="text-sm text-gray-500">Trusted sources</p> </div> <span class="text-3xl font-bold text-cyan-600">${totalSources}</span> </div> <div class="mt-4 flex items-center gap-4 text-xs text-gray-500"> <span class="flex items-center gap-1"> <span class="w-2 h-2 rounded-full bg-blue-500"></span> ${totalMasterSources} universal
</span> <span class="flex items-center gap-1"> <span class="w-2 h-2 rounded-full bg-green-500"></span> ${totalStateSources} state
</span> </div> <div class="mt-3 pt-3 border-t border-cyan-100 flex items-center justify-between"> <span class="text-xs text-cyan-600 font-medium">Manage sources →</span> <button onclick="document.getElementById('addMasterBtn')?.click()" class="text-xs bg-cyan-600 text-white px-3 py-1 rounded-lg hover:bg-cyan-700 transition-colors">+ New</button> </div> </a> </div>  <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8"> <a href="/admin/new" class="bg-white rounded-xl p-3 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-center"> <span class="text-2xl block mb-1">✏️</span> <span class="text-xs font-medium text-gray-700">New Post</span> </a> <a href="/admin/products/new" class="bg-white rounded-xl p-3 border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all text-center"> <span class="text-2xl block mb-1">📦</span> <span class="text-xs font-medium text-gray-700">Add Product</span> </a> <a href="/admin/media" class="bg-white rounded-xl p-3 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all text-center"> <span class="text-2xl block mb-1">🖼️</span> <span class="text-xs font-medium text-gray-700">Media Library</span> </a> <a href="/admin/templates" class="bg-white rounded-xl p-3 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all text-center"> <span class="text-2xl block mb-1">📋</span> <span class="text-xs font-medium text-gray-700">Templates</span> </a> <a href="/admin/sources" class="bg-white rounded-xl p-3 border border-gray-200 hover:border-cyan-300 hover:shadow-md transition-all text-center"> <span class="text-2xl block mb-1">📚</span> <span class="text-xs font-medium text-gray-700">Sources</span> </a> </div>  <div> <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4"> <div> <h2 class="text-lg font-semibold text-gray-900">Recent Posts</h2> <p class="text-sm text-gray-500">Manage your articles</p> </div> <div class="flex items-center gap-3"> <div class="relative"> <input type="text" id="searchInput" placeholder="Search posts..." class="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-40 sm:w-48"> <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path> </svg> </div> <a href="/admin/new" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-200 flex items-center gap-1.5"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path> </svg>
New
</a> </div> </div> <div class="bg-white rounded-2xl overflow-hidden border border-gray-100"> ${posts.length > 0 ? renderTemplate`<div class="overflow-x-auto"> <table class="w-full"> <thead> <tr class="bg-gray-50"> <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th> <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Status</th> <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Published</th> <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Views</th> <th class="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th> </tr> </thead> <tbody class="divide-y divide-gray-100" id="postsTableBody"> ${posts.slice(0, 5).map((post) => renderTemplate`<tr${addAttribute(post.id, "key")} class="hover:bg-gray-50 transition-colors duration-150"${addAttribute(post.id, "data-post-id")}> <td class="px-5 py-4"> <div class="font-medium text-gray-900 text-sm line-clamp-1">${post.title}</div> <div class="text-xs text-gray-400 sm:hidden mt-0.5">${post.is_draft ? "Draft" : "Published"}</div> </td> <td class="px-5 py-4 hidden sm:table-cell"> <span${addAttribute(`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${post.is_draft ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700"}`, "class")}> <span${addAttribute(`w-1.5 h-1.5 rounded-full ${post.is_draft ? "bg-yellow-500" : "bg-green-500"}`, "class")}></span> ${post.is_draft ? "Draft" : "Published"} </span> </td> <td class="px-5 py-4 text-sm text-gray-500 hidden md:table-cell"> ${post.published_at ? new Date(post.published_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }) : "\u2014"} </td> <td class="px-5 py-4 text-sm text-gray-500 hidden lg:table-cell">${post.views || 0}</td> <td class="px-5 py-4 text-right"> <div class="flex items-center justify-end gap-1.5"> <a${addAttribute(`/admin/edit/${post.id}`, "href")} class="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">Edit</a> <span class="text-gray-300">|</span> <button class="delete-btn px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"${addAttribute(post.id, "data-id")}>
Delete
</button> </div> </td> </tr>`)} </tbody> </table> </div>` : renderTemplate`<div class="py-12 text-center"> <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4"> <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path> </svg> </div> <p class="text-gray-500 text-sm">No posts yet</p> <a href="/admin/new" class="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block">Create your first post →</a> </div>`} </div> ${posts.length > 5 && renderTemplate`<div class="mt-4 text-center"> <a href="/admin/dashboard" class="text-sm text-blue-600 hover:text-blue-800 font-medium">
View all ${posts.length} posts →
</a> </div>`} </div> ` })} <!-- ============================================
DELETE FUNCTIONALITY
============================================ --> ${renderScript($$result, "P:/Projects/trendlin/src/pages/admin/dashboard.astro?astro&type=script&index=0&lang.ts")} `;
}, "P:/Projects/trendlin/src/pages/admin/dashboard.astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/admin/dashboard.astro";
const $$url = "/admin/dashboard";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Dashboard,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
