globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                 */
import { c as createAstro, a as createComponent, g as renderComponent, f as renderScript, d as renderTemplate, m as maybeRenderHead, b as addAttribute } from '../chunks/astro/server_DVHrQl8d.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_CGfDT0zE.mjs';
import { $ as $$PostCard } from '../chunks/PostCard_vvNbTLxS.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://b484b1fd.my-content-site.pages.dev");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const categories = [
    {
      name: "Health & Wellness",
      icon: "\u{1F9D8}",
      slug: "health-wellness",
      description: "Your guide to holistic living. Discover expert advice on fitness, mental health, nutrition, and self-care practices for a balanced life.",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop",
      gradient: "from-emerald-500 to-teal-600",
      color: "#10b981",
      ringClass: "ring-emerald-500/30"
    },
    {
      name: "Food & Dining",
      icon: "\u{1F37D}\uFE0F",
      slug: "food-dining",
      description: "Explore LA's vibrant food scene. From hidden gems to fine dining, we bring you honest reviews and culinary adventures.",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=600&fit=crop",
      gradient: "from-rose-500 to-red-600",
      color: "#ef4444",
      ringClass: "ring-rose-500/30"
    },
    {
      name: "Entertainment",
      icon: "\u{1F3AC}",
      slug: "entertainment",
      description: "Stay in the know with LA's entertainment scene. Movies, concerts, events, and the latest cultural happenings in the City of Angels.",
      image: "https://images.unsplash.com/photo-1603199506016-b9a594b9a5a8?w=600&h=600&fit=crop",
      gradient: "from-purple-500 to-violet-700",
      color: "#8b5cf6",
      ringClass: "ring-purple-500/30"
    },
    {
      name: "Lifestyle",
      icon: "\u{1F334}",
      slug: "lifestyle",
      description: "Embrace the LA lifestyle. Discover wellness, home decor, local events, and everything that makes living in Los Angeles special.",
      image: "https://images.unsplash.com/photo-1486728297118-82a07bc48a0a?w=600&h=600&fit=crop",
      gradient: "from-green-500 to-emerald-600",
      color: "#22c55e",
      ringClass: "ring-green-500/30"
    },
    {
      name: "Technology",
      icon: "\u{1F4BB}",
      slug: "technology",
      description: "Stay ahead with the latest tech trends. Reviews, innovations, and digital insights shaping the future in LA and beyond.",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=600&fit=crop",
      gradient: "from-cyan-500 to-blue-600",
      color: "#06b6d4",
      ringClass: "ring-cyan-500/30"
    },
    {
      name: "Shopping",
      icon: "\u{1F6CD}\uFE0F",
      slug: "shopping",
      description: "Find the best deals and shopping guides. From luxury boutiques to thrift stores, we help you shop smarter in LA.",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop",
      gradient: "from-blue-500 to-indigo-600",
      color: "#3b82f6",
      ringClass: "ring-blue-500/30"
    },
    {
      name: "Real Estate",
      icon: "\u{1F3E0}",
      slug: "real-estate",
      description: "Navigate LA's real estate market. Neighborhood guides, market trends, and tips for buyers, sellers, and renters.",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=600&fit=crop",
      gradient: "from-pink-500 to-rose-600",
      color: "#ec4899",
      ringClass: "ring-pink-500/30"
    },
    {
      name: "Finance",
      icon: "\u{1F4B0}",
      slug: "finance",
      description: "Smart money moves for LA residents. Investing, budgeting, and financial advice tailored to your life in Los Angeles.",
      image: "https://images.unsplash.com/photo-1543286386-2e659306cd6c?w=600&h=600&fit=crop",
      gradient: "from-teal-500 to-cyan-600",
      color: "#14b8a6",
      ringClass: "ring-teal-500/30"
    }
  ];
  let allPosts = [];
  let postCounts = {};
  let totalPosts = 0;
  try {
    const { DB } = Astro2.locals.runtime.env;
    const result = await DB.prepare(`
    SELECT * FROM posts WHERE is_draft = 0 ORDER BY created_at DESC
  `).all();
    allPosts = result.results || [];
    allPosts.forEach((post) => {
      if (post.category) {
        postCounts[post.category] = (postCounts[post.category] || 0) + 1;
        totalPosts++;
      }
    });
  } catch (error) {
    console.error("Database error:", error);
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Categories - Trendlin" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-6xl mx-auto px-6 py-16 sm:py-24 selection:bg-black selection:text-white"> <!-- Header --> <div class="mb-20 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 border-b border-gray-100 pb-8"> <div> <h1 class="text-4xl sm:text-6xl font-bold text-gray-900 tracking-tight" style="font-family: 'Space Grotesk', sans-serif;">
Categories
</h1> <p class="text-gray-500 text-base sm:text-lg mt-3 font-light tracking-wide">
Discover <span class="font-medium text-gray-800">${totalPosts} articles</span> curated across our lifestyle matrix.
</p> </div> <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-400" style="font-family: 'Space Grotesk', sans-serif;"> <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
Matrix Engine v2
</div> </div> <!-- Main Categories Stack --> <div class="space-y-16" id="matrixContainer"> ${categories.map((category, index) => {
    const count = postCounts[category.name] || 0;
    const posts = allPosts.filter((p) => p.category === category.name);
    const isImageRight = index % 2 === 0;
    const targetGradient = category.gradient;
    return renderTemplate`<div class="category-section"${addAttribute(category.slug, "data-category")}${addAttribute(category.ringClass, "data-ring")}${addAttribute(category.slug, "key")}> <div class="view-wrapper relative bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md transition-all duration-500 hover:shadow-xl hover:border-gray-200/80"> <!-- STATE 1: Split View --> <div class="state-split grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[380px]"> <!-- Image Side --> <div${addAttribute(`lg:col-span-5 relative p-6 sm:p-8 flex items-center justify-center bg-gray-50/50 ${isImageRight ? "lg:order-2 border-l border-gray-100" : "lg:order-1 border-r border-gray-100"}`, "class")}> <div class="relative w-full aspect-[4/3] lg:aspect-square max-w-sm rounded-2xl overflow-hidden shadow-inner group"> <img${addAttribute(category.image, "src")}${addAttribute(category.name, "alt")} class="w-full h-full object-cover transition-transform duration-700 ease-out scale-102 group-hover:scale-105 filter grayscale-[10%] group-hover:grayscale-0"> <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div> <div class="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md rounded-xl py-2 px-3 shadow-lg border border-white/40 flex items-center gap-2"> <span class="text-xl">${category.icon}</span> <span class="text-xs font-bold uppercase tracking-wider text-gray-800" style="font-family: 'Space Grotesk', sans-serif;">${category.slug.replace("-", " ")}</span> </div> </div> </div> <!-- Content Side --> <div${addAttribute(`lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between ${isImageRight ? "lg:order-1" : "lg:order-2"} relative overflow-hidden bg-white`, "class")}> <div${addAttribute(`absolute -right-24 -top-24 w-48 h-48 rounded-full bg-gradient-to-br ${targetGradient} opacity-[0.03] blur-3xl pointer-events-none`, "class")}></div> <div class="relative z-10 my-auto"> <div class="flex items-center gap-4 mb-4"> <div${addAttribute(`w-2 h-8 rounded-full bg-gradient-to-b ${targetGradient}`, "class")}></div> <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight" style="font-family: 'Space Grotesk', sans-serif;"> ${category.name} </h2> </div> <div class="flex items-center gap-3 mb-6"> <span class="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-md tracking-wide"> ${count} ${count === 1 ? "Article" : "Articles"} </span> </div> <p class="text-gray-500 text-base leading-relaxed max-w-xl font-normal"> ${category.description} </p> </div> <div class="pt-8 border-t border-gray-50 mt-8 flex items-center justify-between"> <button class="explore-matrix-btn inline-flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg w-fit bg-gray-900 hover:bg-black group/btn"${addAttribute(category.slug, "data-category")}> <span>View Articles</span> <svg class="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"></path> </svg> </button> </div> </div> </div> <!-- STATE 2: Expanded Posts with Floating PostCard --> <div class="state-slider hidden flex-col transition-all duration-500"> <div class="bg-gray-900 px-6 py-4 flex items-center justify-between border-b border-gray-800"> <div class="flex items-center gap-3 text-white"> <span class="text-lg">${category.icon}</span> <h3 class="font-bold tracking-tight text-sm sm:text-base" style="font-family: 'Space Grotesk', sans-serif;"> ${category.name} Archive
</h3> <span class="text-xs text-gray-400 font-normal">/ ${count} entries</span> </div> <button class="close-matrix-btn text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors duration-200 px-2.5 py-1 rounded-md border border-gray-800 hover:border-gray-700"${addAttribute(category.slug, "data-category")}> <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path> </svg>
Esc
</button> </div> <!-- HORIZONTAL SCROLL - NO VISIBLE SCROLLBAR --> <div class="flex overflow-x-auto gap-5 p-6 sm:p-8 bg-gray-50/70 dark:bg-gray-900/30 scroll-smooth" style="scrollbar-width: none; -ms-overflow-style: none; overflow-x: auto;"> <style>
                    .flex.overflow-x-auto::-webkit-scrollbar {
                      display: none;
                    }
                  </style> ${posts.length > 0 ? posts.map((post) => renderTemplate`${renderComponent($$result2, "PostCard", $$PostCard, { "post": post })}`) : renderTemplate`<div class="w-full text-center py-12 text-gray-400 font-light text-sm">
No publications found in this category.
</div>`} </div> <!-- Scroll Hint --> <div class="flex justify-center items-center gap-1 py-3 text-[10px] font-medium text-gray-400 dark:text-gray-500 tracking-widest uppercase bg-gray-50/70 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-800"> <svg class="w-3.5 h-3.5 animate-bounce-x" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"></path> </svg> <span>Scroll to explore</span> <svg class="w-3.5 h-3.5 animate-bounce-x" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"></path> </svg> </div> </div> </div> </div>`;
  })} </div> </div> ` })}  ${renderScript($$result, "P:/Projects/trendlin/src/pages/categories/index.astro?astro&type=script&index=0&lang.ts")}`;
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
