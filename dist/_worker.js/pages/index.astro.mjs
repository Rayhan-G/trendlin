globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                 */
import { c as createAstro, a as createComponent, m as maybeRenderHead, b as addAttribute, f as renderTemplate, e as renderScript, g as renderComponent, r as renderHead } from '../chunks/astro/server_DJuXqbzQ.mjs';
import { $ as $$Footer, a as $$Navbar } from '../chunks/Footer_EVVNfSPC.mjs';
import { $ as $$PostCard } from '../chunks/PostCard_Qbjf5sMy.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Astro$1 = createAstro("https://trendlin.com");
const $$ProductCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$ProductCard;
  const { product } = Astro2.props;
  const resources = product.social_resources || [];
  const redditResources = resources.filter((r) => r.platform === "reddit");
  const youtubeResources = resources.filter((r) => r.platform === "youtube");
  const tiktokResources = resources.filter((r) => r.platform === "tiktok");
  const shopResources = resources.filter((r) => r.platform === "shop");
  const redditJson = JSON.stringify(redditResources);
  const youtubeJson = JSON.stringify(youtubeResources);
  const tiktokJson = JSON.stringify(tiktokResources);
  const shopJson = JSON.stringify(shopResources);
  return renderTemplate`${maybeRenderHead()}<div class="product-wrapper"${addAttribute(product.id, "data-product-id")} data-astro-cid-tjdfhdqb> <div class="product-card" data-astro-cid-tjdfhdqb> <a${addAttribute(`/products/${product.slug}`, "href")} class="product-link" data-astro-cid-tjdfhdqb> <div class="product-image" data-astro-cid-tjdfhdqb> ${product.cover_image ? renderTemplate`<img${addAttribute(product.cover_image, "src")}${addAttribute(product.title, "alt")} loading="lazy" width="400" height="300" data-astro-cid-tjdfhdqb>` : renderTemplate`<img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&q=80"${addAttribute(product.title, "alt")} loading="lazy" width="400" height="300" data-astro-cid-tjdfhdqb>`} </div> <div class="product-gradient" data-astro-cid-tjdfhdqb></div> ${product.category && renderTemplate`<span class="product-badge" data-astro-cid-tjdfhdqb>${product.category}</span>`} ${product.brand && renderTemplate`<span class="product-brand" data-astro-cid-tjdfhdqb>${product.brand}</span>`} <div class="product-title" data-astro-cid-tjdfhdqb>${product.title}</div> </a> <div class="social-buttons" data-astro-cid-tjdfhdqb> <!-- Reddit --> <button class="social-btn reddit" data-platform="reddit"${addAttribute(redditJson, "data-resources")} onclick="window.openResourcePopup(event, 'reddit', this)" aria-label="View Reddit discussions" data-astro-cid-tjdfhdqb> <svg viewBox="0 0 24 24" fill="currentColor" data-astro-cid-tjdfhdqb> <path d="M14.5 15.5c-.7.7-2 .8-2.5.8s-1.8-.1-2.5-.8a.5.5 0 1 1 .7-.7c.4.4 1.3.6 1.8.6s1.4-.2 1.8-.6a.5.5 0 1 1 .7.7zM9.5 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm5 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7-1.2a2.2 2.2 0 0 0-3.7-1.6c-1.3-.9-3-1.5-4.8-1.6l.8-3 2.1.5a1.8 1.8 0 1 0 .3-1l-2.6-.6a.5.5 0 0 0-.6.4l-.9 3.5c-1.9.1-3.6.7-4.9 1.6A2.2 2.2 0 0 0 2.5 10.8c0 .9.5 1.7 1.2 2-.1.3-.2.7-.2 1 0 3.2 3.7 5.8 8.5 5.8s8.5-2.6 8.5-5.8c0-.3-.1-.7-.2-1 .7-.3 1.2-1.1 1.2-2z" data-astro-cid-tjdfhdqb></path> </svg> <span class="tooltip" data-astro-cid-tjdfhdqb>Reddit</span> </button> <!-- YouTube --> <button class="social-btn youtube" data-platform="youtube"${addAttribute(youtubeJson, "data-resources")} onclick="window.openResourcePopup(event, 'youtube', this)" aria-label="View YouTube reviews" data-astro-cid-tjdfhdqb> <svg viewBox="0 0 24 24" fill="currentColor" data-astro-cid-tjdfhdqb> <path d="M23.5 6.2c-.3-1.2-1.2-2.1-2.4-2.4C19.1 3.3 12 3.3 12 3.3s-7.1 0-9.1.5C1.7 4.1.8 5 .5 6.2 0 8.2 0 12 0 12s0 3.8.5 5.8c.3 1.2 1.2 2.1 2.4 2.4 2 .5 9.1.5 9.1.5s7.1 0 9.1-.5c1.2-.3 2.1-1.2 2.4-2.4.5-2 .5-5.8.5-5.8s0-3.8-.5-5.8zM9.5 15.5v-7l6 3.5-6 3.5z" data-astro-cid-tjdfhdqb></path> </svg> <span class="tooltip" data-astro-cid-tjdfhdqb>YouTube</span> </button> <!-- TikTok --> <button class="social-btn tiktok" data-platform="tiktok"${addAttribute(tiktokJson, "data-resources")} onclick="window.openResourcePopup(event, 'tiktok', this)" aria-label="View TikTok videos" data-astro-cid-tjdfhdqb> <svg viewBox="0 0 24 24" fill="currentColor" data-astro-cid-tjdfhdqb> <path d="M16.6 2h-3.1v13.2a2.8 2.8 0 1 1-2.8-2.8c.3 0 .6 0 .9.1V9.3a6 6 0 1 0 5.9 6V8.9c1.2.9 2.7 1.5 4.3 1.6V7.4c-2-.1-3.8-1.7-4.2-3.9V2z" data-astro-cid-tjdfhdqb></path> </svg> <span class="tooltip" data-astro-cid-tjdfhdqb>TikTok</span> </button> <!-- Shop --> <button class="social-btn shop" data-platform="shop"${addAttribute(shopJson, "data-resources")} onclick="window.openResourcePopup(event, 'shop', this)" aria-label="View shop listings" data-astro-cid-tjdfhdqb> <svg viewBox="0 0 24 24" fill="currentColor" data-astro-cid-tjdfhdqb> <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.2 14h9.9c.8 0 1.5-.5 1.8-1.2l3-6.8A1 1 0 0 0 21 4H6.2L5.3 2H2v2h2l3.6 7.6-1.3 2.4A2 2 0 0 0 8 17h12v-2H8l1.2-2z" data-astro-cid-tjdfhdqb></path> </svg> <span class="tooltip" data-astro-cid-tjdfhdqb>Shop</span> </button> </div> </div> </div> `;
}, "P:/Projects/trendlin/src/components/ProductCard.astro", void 0);

const $$ResourcePopup = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="resource-popup" class="resource-popup"> <div class="resource-popup-overlay" id="popup-overlay"></div> <div class="resource-popup-content"> <button class="resource-popup-close" id="popup-close" aria-label="Close popup"> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <line x1="18" y1="6" x2="6" y2="18"></line> <line x1="6" y1="6" x2="18" y2="18"></line> </svg> </button> <div id="popup-body"></div> </div> </div>  ${renderScript($$result, "P:/Projects/trendlin/src/components/ResourcePopup.astro?astro&type=script&index=0&lang.ts")}`;
}, "P:/Projects/trendlin/src/components/ResourcePopup.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://trendlin.com");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  let posts = [];
  let products = [];
  try {
    const { DB } = Astro2.locals.runtime.env;
    const postsResult = await DB.prepare(`
    SELECT 
      id, title, slug, excerpt, category, cover_image, 
      published_at, created_at,
      'post' as type
    FROM posts 
    WHERE is_draft = 0 
    AND is_published = 1
    ORDER BY created_at DESC
  `).all();
    posts = postsResult.results || [];
    const productsResult = await DB.prepare(`
    SELECT 
      p.id, p.name as title, p.slug, p.description as excerpt, 
      p.category, p.cover_image, p.created_at, 
      p.brand,
      'product' as type
    FROM products p
    WHERE p.in_stock = 1
    ORDER BY p.created_at DESC
  `).all();
    const resourcesResult = await DB.prepare(`
    SELECT 
      product_id,
      platform,
      id,
      url,
      title,
      description,
      author
    FROM product_resources
    WHERE is_active = 1
    ORDER BY product_id, platform, display_order
  `).all();
    const resourcesByProduct = {};
    for (const r of resourcesResult.results || []) {
      const productId = r.product_id;
      if (!resourcesByProduct[productId]) {
        resourcesByProduct[productId] = [];
      }
      resourcesByProduct[productId].push({
        id: r.id,
        platform: r.platform.toLowerCase(),
        url: r.url,
        title: r.title,
        description: r.description || "",
        author: r.author || ""
      });
    }
    products = productsResult.results.map((p) => ({
      ...p,
      social_resources: resourcesByProduct[p.id] || []
    }));
    const p1 = products.find((p) => p.id === 1);
    if (p1) {
      console.log("\u2705 Product 1 loaded:", p1.title);
      console.log("\u{1F4CA} Resources count:", p1.social_resources.length);
    }
  } catch (error) {
    console.error("Database error:", error);
  }
  const now = /* @__PURE__ */ new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1e3);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
  function isWithinWindow(dateStr, windowStart) {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return date >= windowStart && date <= now;
  }
  const todaysPosts = posts.filter((post) => {
    const date = post.published_at || post.created_at;
    return isWithinWindow(date, twentyFourHoursAgo);
  });
  const todaysProducts = products.filter((product) => {
    return product.id === 1 || isWithinWindow(product.created_at, twentyFourHoursAgo);
  });
  const recentPosts = posts.filter((post) => {
    const date = post.published_at || post.created_at;
    return isWithinWindow(date, sevenDaysAgo);
  });
  const recentProducts = products.filter((product) => {
    return product.id === 1 || isWithinWindow(product.created_at, sevenDaysAgo);
  });
  const sectionData = [
    {
      id: 0,
      title: "\u{1F4CC} Today's Picks",
      subtitle: "Fresh posts from the last 24 hours",
      align: "left",
      mainPosts: todaysPosts.slice(0, 10)
    },
    {
      id: 1,
      title: "\u2B50 Top Picks",
      subtitle: "Hot products from the last 24 hours",
      align: "right",
      mainPosts: todaysProducts.slice(0, 10)
    },
    {
      id: 2,
      title: "\u{1F195} Recently Added",
      subtitle: "Fresh posts from the last 7 days",
      align: "left",
      mainPosts: recentPosts.slice(0, 10)
    },
    {
      id: 3,
      title: "\u{1F680} Newly Released",
      subtitle: "Latest products from the last 7 days",
      align: "right",
      mainPosts: recentProducts.slice(0, 10)
    }
  ];
  return renderTemplate(_a || (_a = __template(['<html lang="en" data-astro-cid-j7pv25f6> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Trendlin - Trusted Reviews & Local Insights for Americans</title><meta name="description" content="Honest product reviews, buying guides, and local insights for Americans."><meta name="robots" content="index, follow"><link rel="canonical"', '><meta property="og:title" content="Trendlin - Trusted Reviews & Local Insights"><meta property="og:description" content="Honest product reviews and local insights for Americans."><meta property="og:type" content="website"><meta property="og:url"', '><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">', "</head> <body data-astro-cid-j7pv25f6> ", ` <section class="hero" data-astro-cid-j7pv25f6> <div class="hero-bg" data-astro-cid-j7pv25f6> <img src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1600&q=80" alt="America" loading="eager" data-astro-cid-j7pv25f6> <div class="hero-overlay" data-astro-cid-j7pv25f6></div> </div> <div class="hero-content container" data-astro-cid-j7pv25f6> <h1 data-astro-cid-j7pv25f6>Discover What's <span data-astro-cid-j7pv25f6>Trending</span> in America</h1> <p data-astro-cid-j7pv25f6>Honest product reviews, buying guides, and local insights \u2014 made for Americans.</p> <a href="/categories" class="btn-primary" data-astro-cid-j7pv25f6>
Explore Categories
<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" data-astro-cid-j7pv25f6></path> </svg> </a> </div> </section> `, " ", " <!-- ============================================\n   RESOURCE POPUP - Single Instance\n   ============================================ --> ", " <!-- ============================================\n   SCROLL BUTTON CONTROLLER\n   ============================================ --> <script>\n  (function() {\n    'use strict';\n    \n    function initScrollButtons() {\n      document.querySelectorAll('.scroll-wrapper').forEach(wrapper => {\n        const grid = wrapper.querySelector('.card-grid');\n        const leftBtn = wrapper.querySelector('.scroll-btn.left');\n        const rightBtn = wrapper.querySelector('.scroll-btn.right');\n        \n        if (!grid || !leftBtn || !rightBtn) return;\n        \n        function checkScroll() {\n          const hasScroll = grid.scrollWidth > grid.clientWidth;\n          wrapper.classList.toggle('has-scroll', hasScroll);\n        }\n        \n        leftBtn.addEventListener('click', () => {\n          grid.scrollBy({ left: -grid.clientWidth * 0.8, behavior: 'smooth' });\n        });\n        \n        rightBtn.addEventListener('click', () => {\n          grid.scrollBy({ left: grid.clientWidth * 0.8, behavior: 'smooth' });\n        });\n        \n        checkScroll();\n        window.addEventListener('resize', checkScroll);\n        \n        grid.addEventListener('scroll', () => {\n          const atLeft = grid.scrollLeft <= 10;\n          const atRight = grid.scrollLeft >= grid.scrollWidth - grid.clientWidth - 10;\n          leftBtn.style.opacity = atLeft ? '0.3' : '1';\n          rightBtn.style.opacity = atRight ? '0.3' : '1';\n        });\n      });\n    }\n    \n    if (document.readyState === 'loading') {\n      document.addEventListener('DOMContentLoaded', initScrollButtons);\n    } else {\n      initScrollButtons();\n    }\n    \n  })();\n<\/script> </body> </html>"])), addAttribute(Astro2.url.href, "href"), addAttribute(Astro2.url.href, "href"), renderHead(), renderComponent($$result, "Navbar", $$Navbar, { "data-astro-cid-j7pv25f6": true }), sectionData.map((section) => renderTemplate`<section class="section"${addAttribute(section.id, "key")} data-astro-cid-j7pv25f6> <div class="container" data-astro-cid-j7pv25f6> ${section.align === "left" ? renderTemplate`<div class="row row-left" data-astro-cid-j7pv25f6> <div class="section-title-wrapper" data-astro-cid-j7pv25f6> <h2 data-astro-cid-j7pv25f6>${section.title}</h2> <p data-astro-cid-j7pv25f6>${section.subtitle}</p> </div> <div class="col-80" data-astro-cid-j7pv25f6> <div class="scroll-wrapper"${addAttribute(section.id, "data-section")} data-astro-cid-j7pv25f6> <div class="card-grid" id="scroll-{section.id}" data-astro-cid-j7pv25f6> ${section.mainPosts.length === 0 ? renderTemplate`<div class="empty-state" data-astro-cid-j7pv25f6> <span class="emoji" data-astro-cid-j7pv25f6>👀</span> <p data-astro-cid-j7pv25f6>Nothing new yet. Check back soon!</p> </div>` : section.mainPosts.map((item) => renderTemplate`<div class="post-card-wrapper" data-astro-cid-j7pv25f6> ${item.type === "product" ? renderTemplate`${renderComponent($$result, "ProductCard", $$ProductCard, { "product": item, "data-astro-cid-j7pv25f6": true })}` : renderTemplate`${renderComponent($$result, "PostCard", $$PostCard, { "post": item, "data-astro-cid-j7pv25f6": true })}`} </div>`)} </div> <button class="scroll-btn left" data-scroll="left-{section.id}" aria-label="Scroll left" data-astro-cid-j7pv25f6> <svg viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" data-astro-cid-j7pv25f6></path> </svg> </button> <button class="scroll-btn right" data-scroll="right-{section.id}" aria-label="Scroll right" data-astro-cid-j7pv25f6> <svg viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" data-astro-cid-j7pv25f6></path> </svg> </button> </div> </div> <div class="col-20" data-astro-cid-j7pv25f6></div> </div>` : renderTemplate`<div class="row row-right" data-astro-cid-j7pv25f6> <div class="col-20" data-astro-cid-j7pv25f6></div> <div class="section-title-wrapper" data-astro-cid-j7pv25f6> <h2 data-astro-cid-j7pv25f6>${section.title}</h2> <p data-astro-cid-j7pv25f6>${section.subtitle}</p> </div> <div class="col-80" data-astro-cid-j7pv25f6> <div class="scroll-wrapper"${addAttribute(section.id, "data-section")} data-astro-cid-j7pv25f6> <div class="card-grid" id="scroll-{section.id}" data-astro-cid-j7pv25f6> ${section.mainPosts.length === 0 ? renderTemplate`<div class="empty-state" data-astro-cid-j7pv25f6> <span class="emoji" data-astro-cid-j7pv25f6>👀</span> <p data-astro-cid-j7pv25f6>Nothing new yet. Check back soon!</p> </div>` : section.mainPosts.map((item) => renderTemplate`<div class="post-card-wrapper" data-astro-cid-j7pv25f6> ${item.type === "product" ? renderTemplate`${renderComponent($$result, "ProductCard", $$ProductCard, { "product": item, "data-astro-cid-j7pv25f6": true })}` : renderTemplate`${renderComponent($$result, "PostCard", $$PostCard, { "post": item, "data-astro-cid-j7pv25f6": true })}`} </div>`)} </div> <button class="scroll-btn left" data-scroll="left-{section.id}" aria-label="Scroll left" data-astro-cid-j7pv25f6> <svg viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" data-astro-cid-j7pv25f6></path> </svg> </button> <button class="scroll-btn right" data-scroll="right-{section.id}" aria-label="Scroll right" data-astro-cid-j7pv25f6> <svg viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" data-astro-cid-j7pv25f6></path> </svg> </button> </div> </div> </div>`} </div> </section>`), renderComponent($$result, "Footer", $$Footer, { "data-astro-cid-j7pv25f6": true }), renderComponent($$result, "ResourcePopup", $$ResourcePopup, { "data-astro-cid-j7pv25f6": true }));
}, "P:/Projects/trendlin/src/pages/index.astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
