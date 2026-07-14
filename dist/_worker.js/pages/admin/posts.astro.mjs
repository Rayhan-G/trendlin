globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                    */
import { c as createAstro, a as createComponent, g as renderComponent, e as renderScript, f as renderTemplate, m as maybeRenderHead, b as addAttribute } from '../../chunks/astro/server_DJuXqbzQ.mjs';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_BrpW5vUZ.mjs';
/* empty css                                    */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://trendlin.com");
const $$Posts = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Posts;
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
  } catch (error2) {
    console.error("Error fetching posts:", error2);
    error2 = error2.message;
  }
  const totalPosts = posts.length;
  const publishedPosts = posts.filter((p) => !p.is_draft).length;
  const draftPosts = posts.filter((p) => p.is_draft).length;
  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Posts - Trendlin", "description": "Manage your articles" }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="mb-8"> <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"> <div> <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
📄 Posts
</h1> <p class="text-sm text-gray-500 mt-1">
Manage your articles and content
</p> </div> <a href="/admin/new" class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path> </svg>
New Post
</a> </div> </div>  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"> <div class="bg-white rounded-xl p-4 border border-gray-100"> <p class="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Posts</p> <p class="text-2xl font-bold text-gray-900 mt-1">${totalPosts}</p> </div> <div class="bg-white rounded-xl p-4 border border-gray-100"> <p class="text-xs font-medium text-gray-400 uppercase tracking-wider">Published</p> <p class="text-2xl font-bold text-green-600 mt-1">${publishedPosts}</p> </div> <div class="bg-white rounded-xl p-4 border border-gray-100"> <p class="text-xs font-medium text-gray-400 uppercase tracking-wider">Drafts</p> <p class="text-2xl font-bold text-yellow-600 mt-1">${draftPosts}</p> </div> <div class="bg-white rounded-xl p-4 border border-gray-100"> <p class="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Views</p> <p class="text-2xl font-bold text-purple-600 mt-1">${totalViews}</p> </div> </div>  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4"> <div class="flex items-center gap-3"> <div class="relative"> <input type="text" id="searchInput" placeholder="Search posts..." class="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 sm:w-64" oninput="filterPosts()"> <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path> </svg> </div> <select id="statusFilter" class="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" onchange="filterPosts()"> <option value="">All Status</option> <option value="published">Published</option> <option value="draft">Draft</option> </select> </div> <div class="text-sm text-gray-400"> <span id="visibleCount">${totalPosts}</span> posts
</div> </div>  <div class="bg-white rounded-2xl overflow-hidden border border-gray-100"> ${posts.length > 0 ? renderTemplate`<div class="overflow-x-auto"> <table class="w-full"> <thead> <tr class="bg-gray-50"> <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th> <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Status</th> <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th> <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Published</th> <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Views</th> <th class="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th> </tr> </thead> <tbody class="divide-y divide-gray-100" id="postsTableBody"> ${posts.map((post) => renderTemplate`<tr${addAttribute(post.id, "key")} class="hover:bg-gray-50 transition-colors duration-150 post-row"${addAttribute(post.title.toLowerCase(), "data-title")}${addAttribute(post.is_draft ? "draft" : "published", "data-status")}> <td class="px-5 py-4"> <div class="font-medium text-gray-900 text-sm line-clamp-1">${post.title}</div> <div class="text-xs text-gray-400 sm:hidden mt-0.5">${post.is_draft ? "Draft" : "Published"}</div> </td> <td class="px-5 py-4 hidden sm:table-cell"> <span${addAttribute(`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${post.is_draft ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700"}`, "class")}> <span${addAttribute(`w-1.5 h-1.5 rounded-full ${post.is_draft ? "bg-yellow-500" : "bg-green-500"}`, "class")}></span> ${post.is_draft ? "Draft" : "Published"} </span> </td> <td class="px-5 py-4 text-sm text-gray-500 hidden md:table-cell"> ${post.category || "\u2014"} </td> <td class="px-5 py-4 text-sm text-gray-500 hidden md:table-cell"> ${post.published_at ? new Date(post.published_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }) : "\u2014"} </td> <td class="px-5 py-4 text-sm text-gray-500 hidden lg:table-cell">${post.views || 0}</td> <td class="px-5 py-4 text-right"> <div class="flex items-center justify-end gap-1.5"> <a${addAttribute(`/admin/edit/${post.id}`, "href")} class="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">Edit</a> <span class="text-gray-300">|</span> <button class="delete-btn px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"${addAttribute(post.id, "data-id")}>
Delete
</button> </div> </td> </tr>`)} </tbody> </table> </div>` : renderTemplate`<div class="py-12 text-center"> <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4"> <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path> </svg> </div> <p class="text-gray-500 text-sm">No posts yet</p> <a href="/admin/new" class="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block">Create your first post →</a> </div>`} </div> ` })} <!-- ============================================
JAVASCRIPT
============================================ --> ${renderScript($$result, "P:/Projects/trendlin/src/pages/admin/posts.astro?astro&type=script&index=0&lang.ts")} `;
}, "P:/Projects/trendlin/src/pages/admin/posts.astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/admin/posts.astro";
const $$url = "/admin/posts";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Posts,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
