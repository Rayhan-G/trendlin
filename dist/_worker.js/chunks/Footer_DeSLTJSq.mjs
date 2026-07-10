globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createAstro, a as createComponent, m as maybeRenderHead, e as addAttribute, f as renderComponent, F as Fragment, d as renderTemplate, g as renderScript } from './astro/server_C5D88m4V.mjs';
/* empty css                         */

const $$Astro = createAstro("https://b484b1fd.my-content-site.pages.dev");
const $$Navbar = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Navbar;
  const currentPath = Astro2.url.pathname;
  const cookie = Astro2.request.headers.get("cookie");
  const isLoggedIn = cookie && cookie.includes("session=");
  return renderTemplate`<!-- ============================================
NAVBAR: Main Container
============================================ -->${maybeRenderHead()}<header class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all duration-300"> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> <div class="flex items-center justify-between h-16 lg:h-20"> <!-- ============================================
      SECTION 1: Logo
      ============================================ --> <a href="/" class="flex items-center gap-2.5 group shrink-0"> <div class="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm lg:text-base shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105">
T
</div> <span class="text-xl lg:text-2xl font-bold text-gray-900">
Trendlin
</span> </a> <!-- ============================================
      SECTION 2: Desktop Navigation (3 links only)
      ============================================ --> <nav class="hidden md:flex items-center gap-1 lg:gap-2"> <!-- Nav Link: Home --> <a href="/"${addAttribute(`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentPath === "/" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`, "class")}>
Home
</a> <!-- Nav Link: Categories --> <a href="/categories"${addAttribute(`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentPath.startsWith("/categories") ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`, "class")}>
Categories
</a> <!-- Nav Link: About --> <a href="/about"${addAttribute(`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentPath.startsWith("/about") ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`, "class")}>
About
</a> </nav> <!-- ============================================
      SECTION 3: Desktop Right Actions (Admin Only)
      ============================================ --> <div class="hidden md:flex items-center gap-3"> ${isLoggedIn ? renderTemplate`<!-- Admin Links (Logged In) -->
          ${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate` <a href="/admin/dashboard" class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
Dashboard
</a> <a href="/admin/new" class="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40">
New Post
</a> <a href="/admin/logout" class="px-4 py-2 text-sm font-medium text-red-500 hover:text-red-700 transition-all duration-200">
Logout
</a> ` })}` : renderTemplate`<!-- Empty: No Sign In button -->
          <div></div>`} </div> <!-- ============================================
      SECTION 4: Mobile Menu Button
      ============================================ --> <button id="mobileMenuButton" class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-200" aria-label="Toggle menu"> <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path> </svg> </button> </div> <!-- ============================================
    SECTION 5: Mobile Navigation Menu (3 links only)
    ============================================ --> <div id="mobileMenu" class="hidden md:hidden py-4 border-t border-gray-100"> <div class="flex flex-col space-y-1"> <!-- Mobile Nav: Home --> <a href="/"${addAttribute(`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${currentPath === "/" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`, "class")}>
Home
</a> <!-- Mobile Nav: Categories --> <a href="/categories"${addAttribute(`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${currentPath.startsWith("/categories") ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`, "class")}>
Categories
</a> <!-- Mobile Nav: About --> <a href="/about"${addAttribute(`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${currentPath.startsWith("/about") ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`, "class")}>
About
</a> <!-- Mobile Divider --> <div class="pt-4 mt-2 border-t border-gray-100 flex flex-col space-y-2"> ${isLoggedIn ? renderTemplate`<!-- Mobile Admin Links (Logged In) -->
            ${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate` <a href="/admin/dashboard" class="px-4 py-3 text-center text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
Dashboard
</a> <a href="/admin/new" class="px-4 py-3 text-center text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all duration-200">
New Post
</a> <a href="/admin/logout" class="px-4 py-3 text-center text-sm font-medium text-red-500 hover:text-red-700 rounded-lg transition-all duration-200">
Logout
</a> ` })}` : renderTemplate`<!-- Empty: No Sign In link -->
            <div></div>`} </div> </div> </div> </div> </header> <!-- ============================================
SECTION 6: Mobile Menu JavaScript
============================================ --> ${renderScript($$result, "P:/Projects/trendlin/src/components/Navbar.astro?astro&type=script&index=0&lang.ts")} <!-- ============================================
SECTION 7: Styles
============================================ --> `;
}, "P:/Projects/trendlin/src/components/Navbar.astro", void 0);

const $$Footer = createComponent(($$result, $$props, $$slots) => {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  return renderTemplate`${maybeRenderHead()}<footer class="bg-white dark:bg-gray-900 border-t border-gray-200/50 dark:border-gray-800/50"> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> <!-- Main Footer --> <div class="py-12 sm:py-16"> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12"> <!-- Brand Column --> <div> <a href="/" class="flex items-center gap-2.5 mb-4 group"> <div class="w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm lg:text-base shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105">
T
</div> <span class="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
Trendlin
</span> </a> <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm">
A modern content platform for sharing insightful articles, stories, and perspectives on technology, design, and the future.
</p> <!-- Social Links - Facebook, Instagram, X only --> <div class="flex gap-2.5 mt-4"> <a href="#" target="_blank" rel="noopener noreferrer" class="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-[#1877f2] hover:text-white dark:hover:bg-[#1877f2] transition-all duration-200" aria-label="Follow us on Facebook"> <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"> <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path> </svg> </a> <a href="#" target="_blank" rel="noopener noreferrer" class="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-[#e4405f] hover:text-white dark:hover:bg-[#e4405f] transition-all duration-200" aria-label="Follow us on Instagram"> <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"> <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"></path> </svg> </a> <a href="#" target="_blank" rel="noopener noreferrer" class="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-200" aria-label="Follow us on X"> <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"> <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path> </svg> </a> </div> </div> <!-- Platform Links --> <div> <h3 class="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
Explore
</h3> <ul class="space-y-2.5"> <li> <a href="/" class="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
Home
</a> </li> <li> <a href="/posts" class="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
All Articles
</a> </li> <li> <a href="/categories" class="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
Categories
</a> </li> <li> <a href="/admin/new" class="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
Write a Post
</a> </li> </ul> </div> <!-- Support Links --> <div> <h3 class="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
Company
</h3> <ul class="space-y-2.5"> <li> <a href="/about" class="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
About Us
</a> </li> <li> <a href="/contact" class="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
Contact
</a> </li> <li> <a href="/privacy" class="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
Privacy Policy
</a> </li> <li> <a href="/terms" class="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
Terms of Service
</a> </li> <li> <a href="/cookies" class="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
Cookie Policy
</a> </li> </ul> </div> </div> </div> <!-- Footer Bottom --> <div class="py-6 border-t border-gray-200/50 dark:border-gray-800/50 flex flex-col sm:flex-row justify-between items-center gap-4"> <p class="text-sm text-gray-500 dark:text-gray-400">
© ${currentYear} <a href="/" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium">Trendlin</a>. All rights reserved.
</p> <div class="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400"> <a href="/privacy" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Privacy</a> <a href="/terms" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Terms</a> <a href="/cookies" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Cookies</a> </div> </div> </div> </footer>`;
}, "P:/Projects/trendlin/src/components/Footer.astro", void 0);

export { $$Navbar as $, $$Footer as a };
