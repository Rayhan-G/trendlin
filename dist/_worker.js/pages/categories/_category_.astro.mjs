globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                    */
import { c as createAstro, a as createComponent, f as renderComponent, d as renderTemplate, m as maybeRenderHead, e as addAttribute } from '../../chunks/astro/server_C5D88m4V.mjs';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_o7T6o6BI.mjs';
/* empty css                                         */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://b484b1fd.my-content-site.pages.dev");
const $$category = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$category;
  const { category } = Astro2.params;
  const categoryName = category.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  let posts = [];
  try {
    const { DB } = Astro2.locals.runtime.env;
    const result = await DB.prepare(`
    SELECT * FROM posts 
    WHERE category = ? AND is_draft = 0
    ORDER BY created_at DESC
  `).bind(categoryName).all();
    posts = result.results || [];
    console.log(`\u{1F50D} Found ${posts.length} posts in category "${categoryName}"`);
  } catch (error) {
    console.error("Database error:", error);
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `${categoryName} - Trendlin` }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="content-width py-12"> <!-- Header --> <div class="mb-8"> <a href="/categories" class="text-blue-600 hover:text-blue-700 text-sm inline-block mb-4">
← Back to Categories
</a> <h1 class="text-4xl font-bold mb-2">${categoryName}</h1> <p class="text-gray-600"> ${posts.length} article${posts.length > 1 ? "s" : ""} in this category
</p> </div> <!-- Posts Grid --> ${posts.length > 0 ? renderTemplate`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> ${posts.map((post) => renderTemplate`<div class="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"> ${post.cover_image && renderTemplate`<div class="h-48 overflow-hidden"> <img${addAttribute(post.cover_image, "src")}${addAttribute(post.title, "alt")} class="w-full h-full object-cover"> </div>`} <div class="p-5"> <div class="flex items-center gap-2 mb-2"> <span class="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full"> ${post.category || "Uncategorized"} </span> </div> <h3 class="text-xl font-semibold mb-2"> <a${addAttribute(`/posts/${post.slug}`, "href")} class="hover:text-blue-600 transition-colors"> ${post.title} </a> </h3> <p class="text-gray-500 text-sm mb-3 line-clamp-2"> ${post.excerpt || post.content?.replace(/<[^>]*>/g, "").substring(0, 100) || "No excerpt"} </p> <div class="flex items-center justify-between pt-3 border-t border-gray-100"> <span class="text-xs text-gray-400"> ${post.published_at ? new Date(post.published_at).toLocaleDateString() : "Not published"} </span> <a${addAttribute(`/posts/${post.slug}`, "href")} class="text-blue-600 text-sm font-medium hover:underline">
Read More →
</a> </div> </div> </div>`)} </div>` : renderTemplate`<div class="text-center py-16 bg-gray-50 rounded-xl"> <p class="text-gray-500">No published posts found in "${categoryName}" yet.</p> <a href="/" class="text-blue-600 hover:underline mt-2 inline-block">Browse all posts →</a> </div>`} </div> ` })} `;
}, "P:/Projects/trendlin/src/pages/categories/[category].astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/categories/[category].astro";
const $$url = "/categories/[category]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$category,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
