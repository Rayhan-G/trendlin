globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                 */
import { c as createAstro, a as createComponent, r as renderHead, f as renderComponent, e as addAttribute, d as renderTemplate } from '../chunks/astro/server_C5D88m4V.mjs';
import { $ as $$Navbar, a as $$Footer } from '../chunks/Footer_DeSLTJSq.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://b484b1fd.my-content-site.pages.dev");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  let posts = [];
  try {
    const response = await fetch(`${Astro2.url.origin}/api/posts?published=true`);
    if (response.ok) {
      posts = await response.json();
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
  return renderTemplate`<html lang="en" data-astro-cid-j7pv25f6> <head><!-- ============================================
    SECTION: Head / Meta Tags
    ============================================ --><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Trendlin - Los Angeles' Trusted Source</title><meta name="description" content="Your trusted source for the latest trends, product reviews, and local insights in Los Angeles, California."><!-- ============================================
    SECTION: Google Fonts
    ============================================ --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&display=swap" rel="stylesheet"><!-- ============================================
    SECTION: All CSS Styles
    ============================================ -->${renderHead()}</head> <body data-astro-cid-j7pv25f6> <!-- ============================================
    SECTION: Navbar
    ============================================ --> ${renderComponent($$result, "Navbar", $$Navbar, { "data-astro-cid-j7pv25f6": true })} <!-- ============================================
    SECTION: Location Banner
    ============================================ --> <div class="location-banner" data-astro-cid-j7pv25f6> <span data-astro-cid-j7pv25f6>📍</span> Serving Los Angeles, California — Your Trusted Local Source for Trends, Reviews &amp; Insights
</div> <!-- ============================================
SECTION: Compact Hero - FIXED
============================================ --> <section class="hero-compact" style="
  position: relative;
  min-height: calc(100vh - 64px - 40px);
  display: flex;
  align-items: center;
  overflow: hidden;
  background: #0a0a0a;
  padding: 2rem 0;
" data-astro-cid-j7pv25f6> <!-- Background Image --> <div class="hero-bg" style="position: absolute; inset: 0; width: 100%; height: 100%;" data-astro-cid-j7pv25f6> <img src="https://pub-bf1013d046c946448ed23cbf79e38b92.r2.dev/Webstructmedia/webo.jpg" alt="Trendlin - Los Angeles" style="width: 100%; height: 100%; object-fit: cover; object-position: center;" loading="eager" fetchpriority="high" decoding="async" data-astro-cid-j7pv25f6> <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.4), rgba(0,0,0,0.7));" data-astro-cid-j7pv25f6></div> <div style="position: absolute; inset: 0; background: linear-gradient(to right, rgba(0,0,0,0.3), transparent, rgba(0,0,0,0.3));" data-astro-cid-j7pv25f6></div> </div> <!-- Hero Content --> <div style="position: relative; width: 100%; z-index: 10; padding: 1.5rem 1rem;" data-astro-cid-j7pv25f6> <div style="max-width: 800px; margin: 0 auto; text-align: center;" data-astro-cid-j7pv25f6> <!-- Badge --> <div style="
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(255,255,255,0.1);
        backdrop-filter: blur(4px);
        color: rgba(255,255,255,0.9);
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.7rem;
        font-weight: 600;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        margin-bottom: 0.5rem;
        border: 1px solid rgba(255,255,255,0.1);
      " data-astro-cid-j7pv25f6> <span style="position: relative; display: flex; height: 0.5rem; width: 0.5rem;" data-astro-cid-j7pv25f6> <span style="position: absolute; display: inline-flex; height: 100%; width: 100%; border-radius: 50%; background: rgba(96, 165, 250, 0.75); animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;" data-astro-cid-j7pv25f6></span> <span style="position: relative; display: inline-flex; border-radius: 50%; height: 0.5rem; width: 0.5rem; background: #3b82f6;" data-astro-cid-j7pv25f6></span> </span> <span data-astro-cid-j7pv25f6>🚀 Trendlin — Los Angeles</span> </div> <!-- Heading --> <h1 style="
        font-size: clamp(1.5rem, 5vw, 3rem);
        font-weight: 800;
        color: #ffffff;
        line-height: 1.15;
        margin-bottom: 0.5rem;
        letter-spacing: -0.02em;
      " data-astro-cid-j7pv25f6> <span style="display: block;" data-astro-cid-j7pv25f6>Discover What's</span> <span style="
          display: block;
          background: linear-gradient(to right, #60a5fa, #a78bfa, #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        " data-astro-cid-j7pv25f6>Trending in LA</span> </h1> <!-- Subtitle --> <p style="
        font-size: clamp(0.8rem, 1.5vw, 1.1rem);
        color: rgba(255,255,255,0.9);
        max-width: 600px;
        margin: 0 auto 0.75rem;
        padding: 0 1rem;
        line-height: 1.5;
        font-weight: 400;
      " data-astro-cid-j7pv25f6>
Your trusted source for honest product reviews, buying guides, and local insights — made for Los Angeles.
</p> <!-- CTA Buttons --> <div style="
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        justify-content: center;
        align-items: center;
        padding: 0 1rem;
      " data-astro-cid-j7pv25f6> <a href="/blog" style="
          width: 100%;
          max-width: 200px;
          background: #2563eb;
          color: #ffffff;
          padding: 0.5rem 1.25rem;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 0.8rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          border: none;
          cursor: pointer;
          letter-spacing: 0.02em;
        " data-astro-cid-j7pv25f6> <span data-astro-cid-j7pv25f6>Read the Blog</span> <svg style="width: 0.9rem; height: 0.9rem; transition: transform 0.3s ease;" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" data-astro-cid-j7pv25f6></path> </svg> </a> <a href="/categories" style="
          width: 100%;
          max-width: 200px;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(4px);
          color: #ffffff;
          padding: 0.5rem 1.25rem;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 0.8rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          border: 1px solid rgba(255,255,255,0.2);
          cursor: pointer;
          letter-spacing: 0.02em;
        " data-astro-cid-j7pv25f6> <svg style="width: 0.9rem; height: 0.9rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" data-astro-cid-j7pv25f6></path> </svg> <span data-astro-cid-j7pv25f6>Explore Categories</span> </a> </div> <!-- Stats --> <div style="
        margin-top: 1rem;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
        max-width: 300px;
        margin-left: auto;
        margin-right: auto;
      " data-astro-cid-j7pv25f6> <div style="
          text-align: center;
          padding: 0.35rem 0.5rem;
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(4px);
          border-radius: 0.5rem;
          border: 1px solid rgba(255,255,255,0.1);
        " data-astro-cid-j7pv25f6> <div style="font-size: clamp(1rem, 2vw, 1.25rem); font-weight: 700; color: #ffffff;" data-astro-cid-j7pv25f6>${posts.length}</div> <div style="font-size: 0.6rem; color: #d1d5db;" data-astro-cid-j7pv25f6>Articles Published</div> </div> <div style="
          text-align: center;
          padding: 0.35rem 0.5rem;
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(4px);
          border-radius: 0.5rem;
          border: 1px solid rgba(255,255,255,0.1);
        " data-astro-cid-j7pv25f6> <div style="font-size: clamp(1rem, 2vw, 1.25rem); font-weight: 700; color: #ffffff;" data-astro-cid-j7pv25f6>50+</div> <div style="font-size: 0.6rem; color: #d1d5db;" data-astro-cid-j7pv25f6>Topics Covered</div> </div> <div style="
          text-align: center;
          padding: 0.35rem 0.5rem;
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(4px);
          border-radius: 0.5rem;
          border: 1px solid rgba(255,255,255,0.1);
        " data-astro-cid-j7pv25f6> <div style="font-size: clamp(1rem, 2vw, 1.25rem); font-weight: 700; color: #ffffff;" data-astro-cid-j7pv25f6>100%</div> <div style="font-size: 0.6rem; color: #d1d5db;" data-astro-cid-j7pv25f6>Honest Reviews</div> </div> </div> </div> </div> </section> <!-- ============================================
    SECTION: About Trendlin
    ============================================ --> <section class="about-section" data-astro-cid-j7pv25f6> <div class="container" data-astro-cid-j7pv25f6> <div class="about-grid" data-astro-cid-j7pv25f6> <!-- SUBSECTION: About Left - Content --> <div class="about-content" data-astro-cid-j7pv25f6> <h2 data-astro-cid-j7pv25f6>Your Trusted Guide for <span style="color: #2563eb;" data-astro-cid-j7pv25f6>Everyday Life</span> in LA</h2> <p data-astro-cid-j7pv25f6>
Trendlin is your go-to resource for discovering what matters most in your daily life. 
              Whether you're looking for honest product reviews, local recommendations, or ways to 
              save money while shopping — we've got you covered.
</p> <p data-astro-cid-j7pv25f6>
We test, research, and curate the best products and services available in Los Angeles, 
              so you don't have to. Our mission is to help you make smarter, more informed decisions 
              for your home, lifestyle, and family.
</p> <!-- ---- About Highlights (Bullet Points) ---- --> <ul class="about-highlights" data-astro-cid-j7pv25f6> <li data-astro-cid-j7pv25f6> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" data-astro-cid-j7pv25f6></path> </svg> <span data-astro-cid-j7pv25f6>Get information that actually matters for your everyday life</span> </li> <li data-astro-cid-j7pv25f6> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" data-astro-cid-j7pv25f6></path> </svg> <span data-astro-cid-j7pv25f6>Save money while shopping with our curated deals and recommendations</span> </li> <li data-astro-cid-j7pv25f6> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" data-astro-cid-j7pv25f6></path> </svg> <span data-astro-cid-j7pv25f6>Honest reviews from real experiences — no fluff, just facts</span> </li> </ul> </div> <!-- SUBSECTION: About Right - Image --> <div class="about-image" data-astro-cid-j7pv25f6> <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80" alt="Los Angeles lifestyle - Trendlin" loading="lazy" data-astro-cid-j7pv25f6> </div> </div> </div> </section> <!-- ============================================
    SECTION: Features Cards
    ============================================ --> <section class="container features" data-astro-cid-j7pv25f6> <div class="text-center" data-astro-cid-j7pv25f6> <h2 class="section-title" data-astro-cid-j7pv25f6>What Matters to Los Angeles</h2> <p class="section-subtitle" data-astro-cid-j7pv25f6>Honest content, local insights, and actionable recommendations for LA residents</p> </div> <div class="features-grid" data-astro-cid-j7pv25f6> <!-- ---- Feature Card 1 ---- --> <div class="feature-card" data-astro-cid-j7pv25f6> <div class="feature-icon feature-icon-blue" data-astro-cid-j7pv25f6> <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" data-astro-cid-j7pv25f6></path> </svg> </div> <h3 class="feature-title" data-astro-cid-j7pv25f6>Local Product Reviews</h3> <p class="feature-desc" data-astro-cid-j7pv25f6>Honest, in-depth reviews of products available in Los Angeles stores and online.</p> </div> <!-- ---- Feature Card 2 ---- --> <div class="feature-card" data-astro-cid-j7pv25f6> <div class="feature-icon feature-icon-purple" data-astro-cid-j7pv25f6> <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" data-astro-cid-j7pv25f6></path> </svg> </div> <h3 class="feature-title" data-astro-cid-j7pv25f6>LA Lifestyle &amp; Culture</h3> <p class="feature-desc" data-astro-cid-j7pv25f6>Insightful articles on Los Angeles lifestyle, events, and what's trending in the city.</p> </div> <!-- ---- Feature Card 3 ---- --> <div class="feature-card" data-astro-cid-j7pv25f6> <div class="feature-icon feature-icon-green" data-astro-cid-j7pv25f6> <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" data-astro-cid-j7pv25f6></path> </svg> </div> <h3 class="feature-title" data-astro-cid-j7pv25f6>Local Affiliate Deals</h3> <p class="feature-desc" data-astro-cid-j7pv25f6>Find the best deals on products and services available in the Los Angeles area.</p> </div> </div> </section> <!-- ============================================
    SECTION: Latest Posts
    ============================================ --> <section class="container posts-section" data-astro-cid-j7pv25f6> <!-- SUBSECTION: Posts Header --> <div class="posts-header" data-astro-cid-j7pv25f6> <h2 class="section-title" data-astro-cid-j7pv25f6>Latest in LA</h2> <a href="/search" data-astro-cid-j7pv25f6>
View All
<svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" data-astro-cid-j7pv25f6></path> </svg> </a> </div> <!-- SUBSECTION: Posts Grid --> ${posts.length > 0 ? renderTemplate`<div class="posts-grid" data-astro-cid-j7pv25f6> ${posts.slice(0, 6).map((post) => renderTemplate`<div class="post-card" data-astro-cid-j7pv25f6> <article class="post-card-inner" data-astro-cid-j7pv25f6> <!-- ---- Post Image ---- --> ${post.cover_image && renderTemplate`<div class="post-image" data-astro-cid-j7pv25f6> <img${addAttribute(post.cover_image, "src")}${addAttribute(post.title, "alt")} loading="lazy" data-astro-cid-j7pv25f6> ${post.category_name && renderTemplate`<span class="post-category" data-astro-cid-j7pv25f6>${post.category_name}</span>`} </div>`} <!-- ---- Post Body ---- --> <div class="post-body" data-astro-cid-j7pv25f6> <h3 data-astro-cid-j7pv25f6> <a${addAttribute(`/article/${post.slug}`, "href")} data-astro-cid-j7pv25f6>${post.title}</a> </h3> ${post.excerpt && renderTemplate`<p data-astro-cid-j7pv25f6>${post.excerpt}</p>`} <div class="post-meta" data-astro-cid-j7pv25f6> <span data-astro-cid-j7pv25f6>${new Date(post.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span> <span data-astro-cid-j7pv25f6>5 min read</span> </div> </div> </article> </div>`)} </div>` : renderTemplate`<!-- ---- Empty State ---- -->
        <div class="post-empty" data-astro-cid-j7pv25f6> <p data-astro-cid-j7pv25f6>No posts yet. Check back soon for the latest from Los Angeles!</p> <a href="/admin/posts/new" data-astro-cid-j7pv25f6>Create your first post →</a> </div>`} </section> <!-- ============================================
    SECTION: Footer
    ============================================ --> ${renderComponent($$result, "Footer", $$Footer, { "data-astro-cid-j7pv25f6": true })} </body></html>`;
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
