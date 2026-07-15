globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                    */
import { c as createAstro, a as createComponent, g as renderComponent, e as renderScript, f as renderTemplate, m as maybeRenderHead, b as addAttribute, u as unescapeHTML } from '../../chunks/astro/server_DJuXqbzQ.mjs';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_DQkzEtM1.mjs';
/* empty css                                     */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://trendlin.com");
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  const currentUrl = Astro2.url.href;
  let post = null;
  let relatedPosts = [];
  try {
    const { DB } = Astro2.locals.runtime.env;
    const result = await DB.prepare(`
    SELECT * FROM posts 
    WHERE slug = ? AND is_draft = 0
  `).bind(slug).first();
    post = result;
    if (post) {
      const relatedResult = await DB.prepare(`
      SELECT 
        id, title, slug, excerpt, category, cover_image, 
        published_at, created_at
      FROM posts 
      WHERE is_draft = 0 
        AND is_published = 1
        AND category = ?
        AND slug != ?
      ORDER BY created_at DESC
      LIMIT 4
    `).bind(post.category, slug).all();
      relatedPosts = relatedResult.results || [];
    }
  } catch (error) {
    console.error("Database error:", error);
  }
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(post?.title || "Trendlin Hub");
  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=Check%20this%20out%3A%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    threads: `https://www.threads.net/intent/post?text=${encodedTitle}%20${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
  };
  function processContent(html) {
    if (!html) return { content: "", headings: [] };
    const headings2 = [];
    let processed = html;
    processed = processed.replace(/<h([2-3])([^>]*)>(.*?)<\/h\1>/gs, (match, level, attrs, text) => {
      const cleanText = text.replace(/<[^>]*>/g, "").trim();
      const id = cleanText.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      headings2.push({
        level: parseInt(level),
        id,
        text: cleanText
      });
      return `<h${level} id="${id}" class="scroll-mt-24">${text}</h${level}>`;
    });
    return { content: processed, headings: headings2 };
  }
  const { content: processedContent, headings } = processContent(post?.content || "");
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": post?.title || "Post Not Found" }, { "default": async ($$result2) => renderTemplate`${post ? renderTemplate`${maybeRenderHead()}<article class="max-w-5xl mx-auto px-6 py-12 sm:py-20"> <!-- Back Navigation --> <a href="/" class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-black transition-colors mb-10 group" style="font-family: 'Space Grotesk', sans-serif;"> <svg class="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"></path> </svg>
Back to Home
</a> <!-- Article Header --> <header class="mb-10 space-y-4"> <div class="flex flex-wrap items-center gap-3 text-xs tracking-wider" style="font-family: 'Space Grotesk', sans-serif;"> ${post.category && renderTemplate`<span class="font-bold uppercase bg-gray-900 text-white px-3 py-1 rounded-md text-[10px]"> ${post.category} </span>`} ${post.published_at && renderTemplate`<time class="text-gray-400 font-light"> ${new Date(post.published_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })} </time>`} <span class="text-gray-300">•</span> <span class="text-gray-400 font-light">${post.views || 0} views</span> </div> <h1 class="text-3xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight max-w-3xl" style="font-family: 'Space Grotesk', sans-serif;"> ${post.title} </h1> ${post.excerpt && renderTemplate`<p class="text-lg text-gray-500 max-w-2xl font-light leading-relaxed"> ${post.excerpt} </p>`} </header> <!-- Hero Image --> ${post.cover_image && renderTemplate`<div class="w-full aspect-[16/9] rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-14 bg-gray-50"> <img${addAttribute(post.cover_image, "src")}${addAttribute(post.title, "alt")} class="w-full h-full object-cover"> </div>`} <!-- Two Column Layout --> <div class="grid grid-cols-1 lg:grid-cols-12 gap-8"> <!-- Sidebar - Left (4 columns) --> <aside class="lg:col-span-4 order-1 lg:sticky lg:top-28"> <div class="space-y-6"> <!-- Table of Contents --> ${headings.length > 0 && renderTemplate`<div class="bg-gray-50 dark:bg-gray-800/30 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50"> <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-4" style="font-family: 'Space Grotesk', sans-serif;">
On this page
</span> <ul class="space-y-2 text-sm"> ${headings.map((heading) => renderTemplate`<li${addAttribute(heading.id, "key")}> <a${addAttribute(`#${heading.id}`, "href")}${addAttribute(`block text-gray-500 hover:text-black transition-colors py-1 ${heading.level === 2 ? "font-medium" : "pl-4 text-gray-400"}`, "class")} style="font-family: 'Space Grotesk', sans-serif;"> ${heading.text} </a> </li>`)} </ul> </div>`} <!-- Share --> <div class="bg-gray-50 dark:bg-gray-800/30 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50"> <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-4" style="font-family: 'Space Grotesk', sans-serif;">
Share this article
</span> <div class="grid grid-cols-4 gap-2"> <!-- WhatsApp --> <a${addAttribute(shareLinks.whatsapp, "href")} target="_blank" rel="noopener noreferrer" class="share-btn" aria-label="Share on WhatsApp" style="background: #25D366; color: white; border-color: #25D366;"> <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"> <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path> </svg> </a> <!-- Facebook --> <a${addAttribute(shareLinks.facebook, "href")} target="_blank" rel="noopener noreferrer" class="share-btn" aria-label="Share on Facebook" style="background: #1877F2; color: white; border-color: #1877F2;"> <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"> <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path> </svg> </a> <!-- X (Twitter) --> <a${addAttribute(shareLinks.twitter, "href")} target="_blank" rel="noopener noreferrer" class="share-btn" aria-label="Share on X" style="background: #000000; color: white; border-color: #000000;"> <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"> <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path> </svg> </a> <!-- LinkedIn --> <a${addAttribute(shareLinks.linkedin, "href")} target="_blank" rel="noopener noreferrer" class="share-btn" aria-label="Share on LinkedIn" style="background: #0A66C2; color: white; border-color: #0A66C2;"> <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"> <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path> </svg> </a> <!-- Reddit --> <a${addAttribute(shareLinks.reddit, "href")} target="_blank" rel="noopener noreferrer" class="share-btn" aria-label="Share on Reddit" style="background: #FF4500; color: white; border-color: #FF4500;"> <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"> <path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.85-1.64-6.29-1.72l1.3-4.07 4.25.92c.02.94.8 1.7 1.76 1.7 1.02 0 1.84-.83 1.84-1.84s-.83-1.84-1.84-1.84c-.82 0-1.5.53-1.73 1.27l-4.73-1.02c-.17-.04-.36.04-.42.21l-1.51 4.73c-2.54.04-4.83.69-6.52 1.71-.55-.74-1.44-1.21-2.43-1.21-1.65 0-3 1.35-3 3 0 1.09.59 2.04 1.47 2.57-.05.31-.08.62-.08.93 0 4.14 4.7 7.5 10.5 7.5s10.5-3.36 10.5-7.5c0-.31-.03-.62-.08-.93.88-.53 1.47-1.48 1.47-2.57z"></path> </svg> </a> <!-- Telegram --> <a${addAttribute(shareLinks.telegram, "href")} target="_blank" rel="noopener noreferrer" class="share-btn" aria-label="Share on Telegram" style="background: #26A5E4; color: white; border-color: #26A5E4;"> <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"> <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1 .22-1.62.15-.15 2.7-2.46 2.75-2.67.01-.03.01-.14-.06-.2-.07-.06-.17-.04-.24-.02-.1.02-1.7 1.08-4.81 3.17-.46.32-.87.47-1.24.46-.4-.01-1.17-.23-1.74-.41-.7-.23-1.26-.35-1.21-.74.03-.2.3-.41.83-.62 3.24-1.41 5.41-2.35 6.51-2.81 3.1-.1.97.77.94 2.26z"></path> </svg> </a> <!-- Threads --> <a${addAttribute(shareLinks.threads, "href")} target="_blank" rel="noopener noreferrer" class="share-btn" aria-label="Share on Threads" style="background: #000000; color: white; border-color: #000000;"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"> <path d="M12.22 2c5.44 0 9.78 4.34 9.78 9.78a9.42 9.42 0 0 1-5.18 8.44c-1.15.58-2 .78-3.32.78-4.14 0-7.5-3.36-7.5-7.5s3.36-7.5 7.5-7.5c1.47 0 2.8.4 3.84 1.15a.75.75 0 0 1-.84 1.24 6 6 0 1 0-3 11.11c.94 0 1.55-.15 2.37-.56a7.93 7.93 0 0 0 4.38-7.16 8.28 8.28 0 0 0-8.28-8.28 8.16 8.16 0 0 0-8.16 8.35 8.24 8.24 0 0 0 5.4 7.76.75.75 0 1 1-.52 1.4A9.74 9.74 0 0 1 2.44 12 9.66 9.66 0 0 1 12.22 2z"></path> </svg> </a> <!-- Email --> <a${addAttribute(shareLinks.email, "href")} class="share-btn" aria-label="Share via Email" style="background: #EA4335; color: white; border-color: #EA4335;"> <svg class="w-4 h-4 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"></path> </svg> </a> <!-- Copy Link --> <button id="nativeShareTrigger" class="share-btn relative" aria-label="Copy Link" style="background: #64748b; color: white; border-color: #64748b;"> <svg id="shareStatusIcon" class="w-4 h-4 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"></path> </svg> <span id="copiedTooltip" class="absolute left-1/2 -translate-x-1/2 -top-9 bg-black text-white text-[9px] font-bold tracking-wider px-3 py-1 rounded opacity-0 pointer-events-none transition-all duration-200 whitespace-nowrap" style="font-family: 'Space Grotesk', sans-serif;">
Copied!
</span> </button> </div> </div> </div> </aside> <!-- Main Content - Right (8 columns) --> <div class="lg:col-span-8 order-2"> <div class="prose prose-neutral max-w-none text-gray-800 text-base sm:text-lg leading-relaxed font-light"> ${processedContent ? renderTemplate`<div class="article-body">${unescapeHTML(processedContent)}</div>` : renderTemplate`<p class="text-gray-400 italic">No content available.</p>`} </div> </div> </div> <!-- ============================================
           RELATED ARTICLES - MATCHING ARTICLE CARD DESIGN
           ============================================ --> ${relatedPosts.length > 0 && renderTemplate`<section class="mt-20 pt-12 border-t border-gray-200 dark:border-gray-700"> <div class="flex items-center justify-between mb-8"> <h2 class="text-2xl font-bold text-gray-900" style="font-family: 'Space Grotesk', sans-serif;">
Related Articles
</h2> <span class="text-sm text-gray-400">
More from ${post.category} </span> </div> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"> ${relatedPosts.map((related) => renderTemplate`<a${addAttribute(`/posts/${related.slug}`, "href")} class="group block flex-shrink-0"> <div class="post-card relative w-full aspect-[4/3] overflow-hidden rounded-[8px] bg-gray-900 cursor-pointer border-2 border-white shadow-[0_20px_60px_rgba(0,0,0,0.25),0_8px_20px_rgba(0,0,0,0.10)] transition-all duration-400 hover:-translate-y-4 hover:shadow-[0_40px_100px_rgba(0,0,0,0.30),0_12px_30px_rgba(0,0,0,0.15)]"> <!-- Image --> <div class="relative w-full h-full overflow-hidden"> ${related.cover_image ? renderTemplate`<img${addAttribute(related.cover_image, "src")}${addAttribute(related.title, "alt")} class="w-full h-full object-cover transition-transform duration-600 ease-out group-hover:scale-105" loading="lazy">` : renderTemplate`<div class="w-full h-full flex items-center justify-center text-5xl text-gray-600 bg-gray-800">
📸
</div>`} <!-- Dark Gradient Overlay (Bottom only) --> <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none z-0"></div>  ${related.category && renderTemplate`<span class="absolute top-3.5 left-3.5 z-10 text-[9px] font-bold uppercase tracking-widest text-white bg-black/60 px-3 py-1 rounded-[4px] border border-white/15"> ${related.category} </span>`}  ${related.published_at && renderTemplate`<span class="absolute bottom-[52px] left-3.5 z-10 text-[9px] font-medium text-white/50 bg-black/30 px-2.5 py-0.5 rounded-[4px]"> ${new Date(related.published_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  })} </span>`}  <div class="absolute bottom-3 left-3.5 right-3.5 z-10"> <h3 class="text-[17px] font-bold text-white leading-tight tracking-tight font-['Space_Grotesk',sans-serif] line-clamp-2"> ${related.title} </h3> </div>  <div class="absolute bottom-3 right-3.5 z-10 flex items-center gap-1.5 text-[10px] font-medium text-white/50 bg-black/40 px-3.5 py-1.5 rounded-[4px] border border-white/10 opacity-0 translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-400"> <span>Read</span> <svg class="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"></path> </svg> </div> </div> </div> </a>`)} </div> </section>`} </article>` : renderTemplate`<div class="text-center py-24 max-w-md mx-auto px-6"> <div class="text-6xl mb-4">📄</div> <h1 class="text-2xl font-bold text-gray-900 mb-2" style="font-family: 'Space Grotesk', sans-serif;">Post Not Found</h1> <p class="text-gray-500 mb-6">The article you're looking for doesn't exist.</p> <a href="/" class="inline-flex items-center px-6 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-all">
Return Home
</a> </div>`}` })}  ${renderScript($$result, "P:/Projects/trendlin/src/pages/posts/[slug].astro?astro&type=script&index=0&lang.ts")}`;
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
