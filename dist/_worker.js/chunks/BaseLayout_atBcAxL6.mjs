globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createAstro, a as createComponent, f as renderTemplate, g as renderComponent, d as renderSlot, r as renderHead, e as renderScript, b as addAttribute } from './astro/server_DJuXqbzQ.mjs';
import { $ as $$Footer, a as $$Navbar } from './Footer_qI9WQHMq.mjs';
/* empty css                         */

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://trendlin.com");
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const { title, description = "Trendlin - Modern Content Platform" } = Astro2.props;
  return renderTemplate(_a || (_a = __template(['<!-- ============================================\nSECTION 1: HTML Document\n============================================ --><html lang="en"> <!-- ============================================\n  SECTION 2: Head\n  ============================================ --> <head><!-- Meta Tags --><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>', '</title><meta name="description"', '><!-- Open Graph --><meta property="og:title"', '><meta property="og:description"', '><meta property="og:type" content="website"><!-- Favicon --><link rel="icon" type="image/svg+xml" href="/favicon.svg"><!-- Google Fonts: Inter --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800;14..32,900&display=swap" rel="stylesheet"><!-- Google Analytics --><script async src="https://www.googletagmanager.com/gtag/js?id=G-65N96ZRWYM"><\/script>', "<!-- ============================================\n    SECTION 3: Global Styles\n    ============================================ -->", "</head> <!-- ============================================\n  SECTION 4: Body\n  ============================================ --> <body> <!-- ---- Navbar ---- --> ", ' <!-- ---- Main Content with padding for fixed navbar ---- --> <main class="page-wrapper"> ', " </main> <!-- ---- Footer ---- --> ", " </body></html>"])), title, addAttribute(description, "content"), addAttribute(title, "content"), addAttribute(description, "content"), renderScript($$result, "P:/Projects/trendlin/src/layouts/BaseLayout.astro?astro&type=script&index=0&lang.ts"), renderHead(), renderComponent($$result, "Navbar", $$Navbar, {}), renderSlot($$result, $$slots["default"]), renderComponent($$result, "Footer", $$Footer, {}));
}, "P:/Projects/trendlin/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $ };
