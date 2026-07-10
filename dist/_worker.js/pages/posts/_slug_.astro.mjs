globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                    */
import { c as createAstro, a as createComponent, f as renderComponent, d as renderTemplate, m as maybeRenderHead, e as addAttribute, u as unescapeHTML } from '../../chunks/astro/server_C5D88m4V.mjs';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_o7T6o6BI.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://b484b1fd.my-content-site.pages.dev");
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  let post = null;
  try {
    const { DB } = Astro2.locals.runtime.env;
    const result = await DB.prepare(`
    SELECT * FROM posts 
    WHERE slug = ? AND is_draft = 0
  `).bind(slug).first();
    post = result;
    console.log("\u{1F50D} Looking for post with slug:", slug);
    console.log("\u{1F4CA} Found post:", post);
  } catch (error) {
    console.error("Database error:", error);
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": post?.title || "Post Not Found" }, { "default": async ($$result2) => renderTemplate`${post ? renderTemplate`${maybeRenderHead()}<article class="max-w-3xl mx-auto px-4 py-8"> <a href="/" class="text-blue-600 hover:underline inline-block mb-6">← Back to Home</a> <h1 class="text-4xl font-bold mb-4">${post.title}</h1> ${post.cover_image && renderTemplate`<img${addAttribute(post.cover_image, "src")}${addAttribute(post.title, "alt")} class="w-full h-64 object-cover rounded-xl mb-6">`} <div class="flex gap-4 text-sm text-gray-500 mb-6"> ${post.published_at && renderTemplate`<time>${new Date(post.published_at).toLocaleDateString()}</time>`} ${post.category && renderTemplate`<span>• ${post.category}</span>`} </div> <div class="prose max-w-none"> ${post.content ? renderTemplate`<div>${unescapeHTML(post.content)}</div>` : renderTemplate`<p>No content available.</p>`} </div> </article>` : renderTemplate`<div class="text-center py-20"> <h1 class="text-4xl font-bold mb-4">Post Not Found</h1> <p class="text-gray-500">The post you're looking for doesn't exist.</p> <a href="/" class="text-blue-600 hover:underline mt-4 inline-block">Go back home</a> </div>`}` })}`;
}, "P:/Projects/trendlin/src/pages/posts/[slug].astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/posts/[slug].astro";
const $$url = "/posts/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
