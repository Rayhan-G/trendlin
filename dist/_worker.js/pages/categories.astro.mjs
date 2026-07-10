globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                 */
import { c as createAstro, a as createComponent, f as renderComponent, d as renderTemplate, m as maybeRenderHead, e as addAttribute } from '../chunks/astro/server_C5D88m4V.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_o7T6o6BI.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://b484b1fd.my-content-site.pages.dev");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const categories = [
    { name: "Lifestyle", icon: "\u{1F334}", slug: "lifestyle" },
    { name: "Technology", icon: "\u{1F4BB}", slug: "technology" },
    { name: "Health & Wellness", icon: "\u{1F9D8}", slug: "health-wellness" },
    { name: "Food & Dining", icon: "\u{1F37D}\uFE0F", slug: "food-dining" },
    { name: "Entertainment", icon: "\u{1F3AC}", slug: "entertainment" },
    { name: "Shopping", icon: "\u{1F6CD}\uFE0F", slug: "shopping" },
    { name: "Real Estate", icon: "\u{1F3E0}", slug: "real-estate" },
    { name: "Finance", icon: "\u{1F4B0}", slug: "finance" },
    { name: "Fashion", icon: "\u{1F457}", slug: "fashion" },
    { name: "Automotive", icon: "\u{1F697}", slug: "automotive" },
    { name: "Home & Garden", icon: "\u{1F3E1}", slug: "home-garden" },
    { name: "Travel", icon: "\u2708\uFE0F", slug: "travel" }
  ];
  let postCounts = {};
  let totalPosts = 0;
  try {
    const { DB } = Astro2.locals.runtime.env;
    const result = await DB.prepare(`
    SELECT category, COUNT(*) as count 
    FROM posts 
    WHERE is_draft = 0 AND category IS NOT NULL
    GROUP BY category
  `).all();
    const counts = result.results || [];
    counts.forEach((row) => {
      postCounts[row.category] = row.count;
      totalPosts += row.count;
    });
    console.log("\u{1F4CA} Category counts:", postCounts);
  } catch (error) {
    console.error("Database error:", error);
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Categories - Trendlin" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="content-width py-12 sm:py-16"> <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Categories</h1> <p class="text-gray-600 text-lg mb-6"> ${totalPosts} published article${totalPosts > 1 ? "s" : ""} across all categories
</p> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"> ${categories.map((category) => {
    const count = postCounts[category.name] || 0;
    return renderTemplate`<a${addAttribute(`/categories/${category.slug}`, "href")} class="group block p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"> <div class="flex items-center justify-between"> <div class="flex items-center gap-3"> <span class="text-3xl group-hover:scale-110 transition-transform duration-300"> ${category.icon} </span> <h3 class="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors"> ${category.name} </h3> </div> <span class="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full"> ${count} ${count === 1 ? "post" : "posts"} </span> </div> </a>`;
  })} </div> </div> ` })}`;
}, "P:/Projects/trendlin/src/pages/categories/index.astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/categories/index.astro";
const $$url = "/categories";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
