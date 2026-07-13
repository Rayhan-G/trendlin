globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                    */
import { c as createAstro, a as createComponent, g as renderComponent, f as renderScript, d as renderTemplate, m as maybeRenderHead, b as addAttribute } from '../../chunks/astro/server_DVHrQl8d.mjs';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_Dnz1eFlL.mjs';
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
      } else {
        if (data && data.id) {
          posts = [data];
        } else {
          posts = [];
        }
      }
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
  const totalPosts = Array.isArray(posts) ? posts.length : 0;
  const publishedPosts = Array.isArray(posts) ? posts.filter((p) => !p.is_draft).length : 0;
  const draftPosts = Array.isArray(posts) ? posts.filter((p) => p.is_draft).length : 0;
  Array.isArray(posts) ? posts.reduce((sum, p) => sum + (p.views || 0), 0) : 0;
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
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Dashboard - Trendlin" }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="mb-8"> <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"> <div> <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
Dashboard
</h1> <p class="text-sm text-gray-500 mt-1">
Welcome back! Here's what's happening with your content.
</p> </div> <div class="flex flex-wrap items-center gap-3"> <a href="/admin/media" class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path> </svg>
Media Library
</a> <a href="/admin/products/new" class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path> </svg>
Add Product
</a> <a href="/admin/new" class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path> </svg>
New Post
</a> </div> </div> </div>  <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-8"> <!-- Total Posts --> <div class="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-200"> <div class="flex items-center justify-between"> <div> <p class="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Posts</p> <p class="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">${totalPosts}</p> </div> <div class="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path> </svg> </div> </div> <div class="mt-3 flex items-center gap-1 text-xs text-gray-400"> <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> <span>${publishedPosts} published</span> </div> </div> <!-- Published --> <div class="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-200"> <div class="flex items-center justify-between"> <div> <p class="text-xs font-medium text-gray-400 uppercase tracking-wider">Published</p> <p class="text-2xl sm:text-3xl font-bold text-green-600 mt-1">${publishedPosts}</p> </div> <div class="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center text-green-600"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> </div> </div> <div class="mt-3 flex items-center gap-1 text-xs text-gray-400"> <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> <span>Live on site</span> </div> </div> <!-- Drafts --> <div class="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-200"> <div class="flex items-center justify-between"> <div> <p class="text-xs font-medium text-gray-400 uppercase tracking-wider">Drafts</p> <p class="text-2xl sm:text-3xl font-bold text-yellow-600 mt-1">${draftPosts}</p> </div> <div class="w-11 h-11 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path> </svg> </div> </div> <div class="mt-3 flex items-center gap-1 text-xs text-gray-400"> <span class="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> <span>In progress</span> </div> </div> <!-- Products --> <div class="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-200"> <div class="flex items-center justify-between"> <div> <p class="text-xs font-medium text-gray-400 uppercase tracking-wider">Products</p> <p class="text-2xl sm:text-3xl font-bold text-orange-600 mt-1">${totalProducts}</p> </div> <div class="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path> </svg> </div> </div> <div class="mt-3 flex items-center gap-1 text-xs text-gray-400"> <span class="w-1.5 h-1.5 rounded-full bg-orange-500"></span> <span>${productsInStock} in stock</span> </div> </div> <!-- Resources --> <div class="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-200"> <div class="flex items-center justify-between"> <div> <p class="text-xs font-medium text-gray-400 uppercase tracking-wider">Resources</p> <p class="text-2xl sm:text-3xl font-bold text-purple-600 mt-1">${totalResources}</p> </div> <div class="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path> </svg> </div> </div> <div class="mt-3 flex items-center gap-1 text-xs text-gray-400"> <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span> <span>Across products</span> </div> </div> <!-- Templates --> <div class="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-200"> <div class="flex items-center justify-between"> <div> <p class="text-xs font-medium text-gray-400 uppercase tracking-wider">Templates</p> <p class="text-2xl sm:text-3xl font-bold text-indigo-600 mt-1">${totalTemplates}</p> </div> <div class="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path> </svg> </div> </div> <div class="mt-3 flex items-center gap-1 text-xs text-gray-400"> <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> <span>${activeTemplates} active</span> </div> </div> </div>  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"> <a href="/admin/new" class="group bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100 hover:shadow-md transition-all duration-200"> <div class="flex items-center gap-4"> <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path> </svg> </div> <div> <h3 class="font-semibold text-gray-900">Create New Post</h3> <p class="text-sm text-gray-500">Write and publish a new article</p> </div> </div> </a> <a href="/admin/products/new" class="group bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100 hover:shadow-md transition-all duration-200"> <div class="flex items-center gap-4"> <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path> </svg> </div> <div> <h3 class="font-semibold text-gray-900">Add Product</h3> <p class="text-sm text-gray-500">Create a new product listing</p> </div> </div> </a> <a href="/admin/media" class="group bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100 hover:shadow-md transition-all duration-200"> <div class="flex items-center gap-4"> <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path> </svg> </div> <div> <h3 class="font-semibold text-gray-900">Media Library</h3> <p class="text-sm text-gray-500">Manage images and videos</p> </div> </div> </a> <a href="/admin/templates" class="group bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-5 border border-indigo-100 hover:shadow-md transition-all duration-200"> <div class="flex items-center gap-4"> <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path> </svg> </div> <div> <h3 class="font-semibold text-gray-900">Manage Templates</h3> <p class="text-sm text-gray-500">Add and edit content templates</p> </div> </div> </a> </div>  <div> <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4"> <div> <h2 class="text-lg font-semibold text-gray-900">All Posts</h2> <p class="text-sm text-gray-500">Manage your articles</p> </div> <div class="flex items-center gap-3"> <div class="relative"> <input type="text" id="searchInput" placeholder="Search posts..." class="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-40 sm:w-48"> <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path> </svg> </div> <a href="/admin/new" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-200 flex items-center gap-1.5"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path> </svg>
New
</a> </div> </div> <div class="bg-white rounded-2xl overflow-hidden border border-gray-100"> ${posts.length > 0 ? renderTemplate`<div class="overflow-x-auto"> <table class="w-full"> <thead> <tr class="bg-gray-50"> <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th> <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Status</th> <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Published</th> <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Views</th> <th class="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th> </tr> </thead> <tbody class="divide-y divide-gray-100" id="postsTableBody"> ${posts.map((post) => renderTemplate`<tr${addAttribute(post.id, "key")} class="hover:bg-gray-50 transition-colors duration-150"${addAttribute(post.id, "data-post-id")}> <td class="px-5 py-4"> <div class="font-medium text-gray-900 text-sm line-clamp-1">${post.title}</div> <div class="text-xs text-gray-400 sm:hidden mt-0.5">${post.is_draft ? "Draft" : "Published"}</div> </td> <td class="px-5 py-4 hidden sm:table-cell"> <span${addAttribute(`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${post.is_draft ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700"}`, "class")}> <span${addAttribute(`w-1.5 h-1.5 rounded-full ${post.is_draft ? "bg-yellow-500" : "bg-green-500"}`, "class")}></span> ${post.is_draft ? "Draft" : "Published"} </span> </td> <td class="px-5 py-4 text-sm text-gray-500 hidden md:table-cell"> ${post.published_at ? new Date(post.published_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }) : "\u2014"} </td> <td class="px-5 py-4 text-sm text-gray-500 hidden lg:table-cell">${post.views || 0}</td> <td class="px-5 py-4 text-right"> <div class="flex items-center justify-end gap-1.5"> <a${addAttribute(`/admin/edit/${post.id}`, "href")} class="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">Edit</a> <span class="text-gray-300">|</span> <button class="delete-btn px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"${addAttribute(post.id, "data-id")}>
Delete
</button> </div> </td> </tr>`)} </tbody> </table> </div>` : renderTemplate`<div class="py-12 text-center"> <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4"> <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path> </svg> </div> <p class="text-gray-500 text-sm">No posts yet</p> <a href="/admin/new" class="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block">Create your first post →</a> </div>`} </div> ${posts.length > 0 && renderTemplate`<div class="mt-4 flex items-center justify-between text-sm text-gray-400"> <span>Showing ${posts.length} post${posts.length > 1 ? "s" : ""}</span> <div class="flex items-center gap-2"> <button class="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50" disabled>Previous</button> <button class="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50" disabled>Next</button> </div> </div>`} </div> ` })} <!-- ============================================
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
