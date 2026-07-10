globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createAstro, a as createComponent, r as renderHead, b as renderSlot, d as renderTemplate } from './astro/server_C5D88m4V.mjs';
/* empty css                             */

const $$Astro = createAstro("https://b484b1fd.my-content-site.pages.dev");
const $$AdminLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$AdminLayout;
  const { title } = Astro2.props;
  return renderTemplate`<html lang="en" data-astro-cid-2kanml4j> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title} - Trendlin Admin</title><link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap" rel="stylesheet">${renderHead()}</head> <body data-astro-cid-2kanml4j> <!-- ==========================================
    NAVBAR
    ========================================== --> <header class="navbar" data-astro-cid-2kanml4j> <div class="admin-container" data-astro-cid-2kanml4j> <div class="navbar-inner" data-astro-cid-2kanml4j> <!-- Logo --> <a href="/admin/dashboard" class="navbar-logo" data-astro-cid-2kanml4j> <div class="navbar-logo-icon" data-astro-cid-2kanml4j>T</div> <span class="navbar-logo-text" data-astro-cid-2kanml4j>Admin Panel</span> </a> <!-- Navigation --> <nav class="navbar-nav" data-astro-cid-2kanml4j> <a href="/admin/dashboard" data-astro-cid-2kanml4j>Dashboard</a> <a href="/admin/new" data-astro-cid-2kanml4j>New Post</a> <a href="/" data-astro-cid-2kanml4j>View Site</a> <a href="/admin" class="logout" data-astro-cid-2kanml4j>Logout</a> </nav> </div> </div> </header> <!-- ==========================================
    MAIN CONTENT with navbar padding
    ========================================== --> <main class="admin-main" data-astro-cid-2kanml4j> <div class="admin-container py-6" data-astro-cid-2kanml4j> ${renderSlot($$result, $$slots["default"])} </div> </main> </body></html>`;
}, "P:/Projects/trendlin/src/layouts/AdminLayout.astro", void 0);

export { $$AdminLayout as $ };
