globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createAstro, a as createComponent, m as maybeRenderHead, b as addAttribute, d as renderTemplate } from './astro/server_DVHrQl8d.mjs';

const $$Astro = createAstro("https://b484b1fd.my-content-site.pages.dev");
const $$PostCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$PostCard;
  const { post, featured = false } = Astro2.props;
  const displayDate = post.published_at || post.created_at;
  return renderTemplate`${maybeRenderHead()}<a${addAttribute(`/posts/${post.slug}`, "href")} class="group block flex-shrink-0"> <div class="post-card relative w-[300px] sm:w-[340px] h-[210px] sm:h-[240px] overflow-hidden rounded-[8px] bg-gray-900 cursor-pointer border-2 border-white shadow-[0_20px_60px_rgba(0,0,0,0.25),0_8px_20px_rgba(0,0,0,0.10)] transition-all duration-400 hover:-translate-y-4 hover:shadow-[0_40px_100px_rgba(0,0,0,0.30),0_12px_30px_rgba(0,0,0,0.15)]"> <!-- Image --> <div class="relative w-full h-full overflow-hidden"> ${post.cover_image ? renderTemplate`<img${addAttribute(post.cover_image, "src")}${addAttribute(post.title, "alt")} class="w-full h-full object-cover transition-transform duration-600 ease-out group-hover:scale-105" loading="lazy">` : renderTemplate`<div class="w-full h-full flex items-center justify-center text-5xl text-gray-600 bg-gray-800">
📸
</div>`} <!-- Dark Gradient Overlay (Bottom only) --> <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none z-0"></div> <!-- Category Badge - Top Left --> ${post.category && renderTemplate`<span class="absolute top-3.5 left-3.5 z-10 text-[9px] font-bold uppercase tracking-widest text-white bg-black/60 px-3 py-1 rounded-[4px] border border-white/15"> ${post.category} </span>`} <!-- Featured Badge - Top Right --> ${featured && renderTemplate`<span class="absolute top-3.5 right-3.5 z-10 text-[9px] font-bold uppercase tracking-widest text-amber-400 bg-black/60 px-2.5 py-1 rounded-[4px] border border-amber-400/20 flex items-center gap-1"> <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"> <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path> </svg>
Featured
</span>`} <!-- Date - Bottom Left --> ${displayDate && renderTemplate`<span class="absolute bottom-[52px] left-3.5 z-10 text-[9px] font-medium text-white/50 bg-black/30 px-2.5 py-0.5 rounded-[4px]"> ${new Date(displayDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  })} </span>`} <!-- Title - Overlay at Bottom --> <div class="absolute bottom-3 left-3.5 right-3.5 z-10"> <h3 class="text-[17px] font-bold text-white leading-tight tracking-tight font-['Space_Grotesk',sans-serif]"> ${post.title} </h3> </div> <!-- Read Indicator - Appears on Hover --> <div class="absolute bottom-3 right-3.5 z-10 flex items-center gap-1.5 text-[10px] font-medium text-white/50 bg-black/40 px-3.5 py-1.5 rounded-[4px] border border-white/10 opacity-0 translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-400"> <span>Read</span> <svg class="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"></path> </svg> </div> </div> </div> </a>`;
}, "P:/Projects/trendlin/src/components/PostCard.astro", void 0);

export { $$PostCard as $ };
