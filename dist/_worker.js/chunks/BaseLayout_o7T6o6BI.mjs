globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createAstro, a as createComponent, e as addAttribute, r as renderHead, f as renderComponent, b as renderSlot, d as renderTemplate } from './astro/server_C5D88m4V.mjs';
import { $ as $$Navbar, a as $$Footer } from './Footer_DeSLTJSq.mjs';
/* empty css                         */

const $$Astro = createAstro("https://b484b1fd.my-content-site.pages.dev");
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const { title, description = "Trendlin - Modern Content Platform" } = Astro2.props;
  return renderTemplate`<!-- ============================================
SECTION 1: HTML Document
============================================ --><html lang="en"> <!-- ============================================
  SECTION 2: Head
  ============================================ --> <head><!-- Meta Tags --><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title><meta name="description"${addAttribute(description, "content")}><!-- Open Graph --><meta property="og:title"${addAttribute(title, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta property="og:type" content="website"><!-- Favicon --><link rel="icon" type="image/svg+xml" href="/favicon.svg"><!-- Google Fonts: Inter --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800;14..32,900&display=swap" rel="stylesheet"><!-- ============================================
    SECTION 3: Global Styles
    ============================================ -->${renderHead()}</head> <!-- ============================================
  SECTION 4: Body
  ============================================ --> <body> <!-- ---- Navbar ---- --> ${renderComponent($$result, "Navbar", $$Navbar, {})} <!-- ---- Main Content with padding for fixed navbar ---- --> <main class="page-wrapper"> ${renderSlot($$result, $$slots["default"])} </main> <!-- ---- Footer ---- --> ${renderComponent($$result, "Footer", $$Footer, {})} </body></html>`;
}, "P:/Projects/trendlin/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $ };
