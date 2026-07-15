globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createAstro, a as createComponent, b as addAttribute, r as renderHead, d as renderSlot, e as renderScript, f as renderTemplate } from './astro/server_DJuXqbzQ.mjs';
/* empty css                         */

const $$Astro = createAstro("https://trendlin.com");
const $$AdminLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$AdminLayout;
  const { title, description = "Manage your content" } = Astro2.props;
  const user = Astro2.locals?.user;
  if (!user) {
    return Astro2.redirect("/admin/login");
  }
  return renderTemplate`<html lang="en" data-astro-cid-2kanml4j> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title} - Trendlin Admin</title><meta name="description"${addAttribute(description, "content")}><link rel="icon" type="image/svg+xml" href="/favicon.svg"><!-- Google Fonts --><link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap" rel="stylesheet">${renderHead()}</head> <body data-astro-cid-2kanml4j> <!-- ==========================================
    SIDEBAR OVERLAY (mobile)
    ========================================== --> <div id="sidebarOverlay" class="sidebar-overlay" onclick="toggleSidebar()" data-astro-cid-2kanml4j></div> <!-- ==========================================
    NAVBAR
    ========================================== --> <header class="navbar" data-astro-cid-2kanml4j> <div class="navbar-inner" data-astro-cid-2kanml4j> <div class="navbar-left" data-astro-cid-2kanml4j> <button class="sidebar-toggle" onclick="toggleSidebar()" aria-label="Toggle sidebar" data-astro-cid-2kanml4j> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-2kanml4j> <line x1="3" y1="6" x2="21" y2="6" data-astro-cid-2kanml4j></line> <line x1="3" y1="12" x2="21" y2="12" data-astro-cid-2kanml4j></line> <line x1="3" y1="18" x2="21" y2="18" data-astro-cid-2kanml4j></line> </svg> </button> <a href="/admin/dashboard" class="navbar-logo" data-astro-cid-2kanml4j> <div class="navbar-logo-icon" data-astro-cid-2kanml4j>T</div> <span class="navbar-logo-text" data-astro-cid-2kanml4j>Admin</span> </a> </div> <div class="navbar-right" data-astro-cid-2kanml4j> <div class="user-info" data-astro-cid-2kanml4j> <span data-astro-cid-2kanml4j>${user?.username || "Admin"}</span> <div class="user-avatar" data-astro-cid-2kanml4j>${user?.username?.charAt(0).toUpperCase() || "A"}</div> </div> <form method="POST" action="/api/auth/logout" style="display:inline;" data-astro-cid-2kanml4j> <button type="submit" class="logout-btn" data-astro-cid-2kanml4j>Logout</button> </form> </div> </div> </header> <!-- ==========================================
    SIDEBAR - 6 FEATURES + Newsletter + Dashboard
    ========================================== --> <aside class="sidebar" id="sidebar" data-astro-cid-2kanml4j> <nav class="sidebar-nav" data-astro-cid-2kanml4j> <!-- MAIN SECTION --> <div class="nav-label" data-astro-cid-2kanml4j>Main</div> <a href="/admin/dashboard"${addAttribute(Astro2.url.pathname === "/admin/dashboard" ? "active" : "", "class")} data-astro-cid-2kanml4j> <span class="icon" data-astro-cid-2kanml4j>📊</span> Dashboard
</a> <!-- CONTENT SECTION --> <div class="nav-label" style="margin-top: 0.5rem;" data-astro-cid-2kanml4j>Content</div> <!-- 1. POSTS --> <a href="/admin/posts"${addAttribute(Astro2.url.pathname === "/admin/posts" ? "active" : "", "class")} data-astro-cid-2kanml4j> <span class="icon" data-astro-cid-2kanml4j>📄</span> Posts
</a> <!-- 2. PRODUCTS --> <a href="/admin/products"${addAttribute(Astro2.url.pathname.startsWith("/admin/products") ? "active" : "", "class")} data-astro-cid-2kanml4j> <span class="icon" data-astro-cid-2kanml4j>📦</span> Products
</a> <!-- 3. MEDIA --> <a href="/admin/media"${addAttribute(Astro2.url.pathname.startsWith("/admin/media") ? "active" : "", "class")} data-astro-cid-2kanml4j> <span class="icon" data-astro-cid-2kanml4j>🖼️</span> Media Library
</a> <!-- 4. TEMPLATES --> <a href="/admin/templates"${addAttribute(Astro2.url.pathname === "/admin/templates" ? "active" : "", "class")} data-astro-cid-2kanml4j> <span class="icon" data-astro-cid-2kanml4j>📋</span> Templates
</a> <!-- 5. SOURCES --> <a href="/admin/sources"${addAttribute(Astro2.url.pathname === "/admin/sources" ? "active" : "", "class")} data-astro-cid-2kanml4j> <span class="icon" data-astro-cid-2kanml4j>📚</span> Sources
</a> <!-- 🆕 6. NEWSLETTER --> <a href="/admin/newsletter"${addAttribute(Astro2.url.pathname.startsWith("/admin/newsletter") ? "active" : "", "class")} data-astro-cid-2kanml4j> <span class="icon" data-astro-cid-2kanml4j>📧</span> Newsletter
</a> <!-- SYSTEM SECTION --> <div class="nav-label" style="margin-top: 0.5rem;" data-astro-cid-2kanml4j>System</div> <a href="/" target="_blank" data-astro-cid-2kanml4j> <span class="icon" data-astro-cid-2kanml4j>🌐</span> View Site
</a> <!-- LOGOUT --> <div style="border-top: 1px solid var(--border-color); margin-top: 0.75rem; padding-top: 0.75rem;" data-astro-cid-2kanml4j> <form method="POST" action="/api/auth/logout" data-astro-cid-2kanml4j> <button type="submit" style="display:flex;align-items:center;gap:0.75rem;width:100%;padding:0.625rem 0.75rem;border:none;background:transparent;border-radius:0.5rem;font-size:0.875rem;font-weight:500;color:#dc2626;cursor:pointer;transition:background 0.2s;font-family:inherit;" data-astro-cid-2kanml4j> <span class="icon" data-astro-cid-2kanml4j>🚪</span> Logout
</button> </form> </div> </nav> </aside> <!-- ==========================================
    MAIN CONTENT
    ========================================== --> <div class="admin-wrapper" data-astro-cid-2kanml4j> <div class="main-content" data-astro-cid-2kanml4j> <!-- Slot content --> ${renderSlot($$result, $$slots["default"])} </div> </div> <!-- ==========================================
    JAVASCRIPT
    ========================================== --> ${renderScript($$result, "P:/Projects/trendlin/src/layouts/AdminLayout.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "P:/Projects/trendlin/src/layouts/AdminLayout.astro", void 0);

export { $$AdminLayout as $ };
