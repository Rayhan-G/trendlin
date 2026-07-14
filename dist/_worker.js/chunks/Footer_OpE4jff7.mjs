globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createAstro, a as createComponent, m as maybeRenderHead, b as addAttribute, g as renderComponent, F as Fragment, f as renderTemplate, e as renderScript } from './astro/server_DJuXqbzQ.mjs';
/* empty css                         */

const $$Astro = createAstro("https://trendlin.com");
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

const $$Footer = createComponent(async ($$result, $$props, $$slots) => {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  return renderTemplate`${maybeRenderHead()}<footer class="bg-white dark:bg-gray-900 border-t border-gray-200/50 dark:border-gray-800/50"> <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10"> <!-- Main Footer --> <div class="py-14 sm:py-18"> <div class="grid grid-cols-1 lg:grid-cols-12 gap-8"> <!-- Brand Column --> <div class="lg:col-span-3"> <a href="/" class="flex items-center gap-2.5 mb-5 group"> <div class="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105">
T
</div> <span class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
Trendlin
</span> </a> <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm">
Your trusted source for honest product reviews, buying guides, and local insights — made for Los Angeles.
</p> <!-- Social Links --> <div class="flex gap-3 mt-6"> <a href="https://www.facebook.com/trendlinsocial/" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center hover:bg-[#1877f2] hover:text-white dark:hover:bg-[#1877f2] transition-all duration-300 hover:scale-110 hover:shadow-lg" aria-label="Follow us on Facebook"> <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"> <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path> </svg> </a> <a href="https://www.instagram.com/trendlinsocial/" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center hover:bg-[#e4405f] hover:text-white dark:hover:bg-[#e4405f] transition-all duration-300 hover:scale-110 hover:shadow-lg" aria-label="Follow us on Instagram"> <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"> <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"></path> </svg> </a> <a href="https://x.com/trendlinco" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 hover:scale-110 hover:shadow-lg" aria-label="Follow us on X"> <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"> <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path> </svg> </a> </div> </div> <!-- Explore Links --> <div class="lg:col-span-2"> <h3 class="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-2.5"> <span class="w-6 h-[2px] bg-gray-400 dark:bg-gray-500 rounded-full"></span>
Explore
</h3> <ul class="space-y-2.5"> <li><a href="/" class="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:pl-2 block">Home</a></li> <li><a href="/categories" class="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:pl-2 block">Categories</a></li> <li><a href="/about" class="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:pl-2 block">About</a></li> <li><a href="/contact" class="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:pl-2 block">Contact</a></li> </ul> </div> <!-- Company Links --> <div class="lg:col-span-2"> <h3 class="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-2.5"> <span class="w-6 h-[2px] bg-gray-400 dark:bg-gray-500 rounded-full"></span>
Company
</h3> <ul class="space-y-2.5"> <li><a href="/privacy" class="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:pl-2 block">Privacy Policy</a></li> <li><a href="/terms" class="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:pl-2 block">Terms of Service</a></li> <li><a href="/cookies" class="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:pl-2 block">Cookie Policy</a></li> <li><a href="/disclosure" class="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:pl-2 block">Affiliate Disclosure</a></li> </ul> </div> <!-- ==========================================
        NEWSLETTER SIGNUP WITH SVG ICONS
        ========================================== --> <div class="lg:col-span-5"> <div class="relative p-6 rounded-xl bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-800/30"> <div class="flex items-center gap-3 mb-4"> <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path> </svg> </div> <div> <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
Subscribe to Newsletter
</h3> <p class="text-xs text-gray-500 dark:text-gray-400">
Get the latest reviews & insights
</p> </div> </div> <!-- Subscription Form --> <form id="footer-newsletter-form" class="space-y-3"> <div class="flex flex-col sm:flex-row gap-2"> <input type="email" id="footer-newsletter-email" placeholder="Enter your email" required class="flex-1 px-4 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"> <button type="submit" class="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-300 whitespace-nowrap">
Subscribe
</button> </div> <!-- Category Preferences - REMOVED hidden class --> <div id="footer-categories-container"> <p class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
Select topics you're interested in:
</p> <div class="grid grid-cols-2 sm:grid-cols-4 gap-2"> <!-- Health & Wellness --> <label class="flex items-center gap-2 p-1.5 rounded-lg text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"> <input type="checkbox" name="footer-categories" value="health-wellness" checked class="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"> <svg class="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path> </svg>
Health
</label> <!-- Food & Dining --> <label class="flex items-center gap-2 p-1.5 rounded-lg text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"> <input type="checkbox" name="footer-categories" value="food-dining" checked class="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"> <svg class="w-4 h-4 text-orange-500 dark:text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m18-8v3a2 2 0 01-2 2H7a2 2 0 01-2-2V7m18-3a2 2 0 00-2-2H5a2 2 0 00-2 2v3m18 0V7"></path> </svg>
Food
</label> <!-- Technology --> <label class="flex items-center gap-2 p-1.5 rounded-lg text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"> <input type="checkbox" name="footer-categories" value="technology" checked class="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"> <svg class="w-4 h-4 text-purple-500 dark:text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path> </svg>
Tech
</label> <!-- Shopping --> <label class="flex items-center gap-2 p-1.5 rounded-lg text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"> <input type="checkbox" name="footer-categories" value="shopping" checked class="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"> <svg class="w-4 h-4 text-pink-500 dark:text-pink-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path> </svg>
Shopping
</label> <!-- Entertainment --> <label class="flex items-center gap-2 p-1.5 rounded-lg text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"> <input type="checkbox" name="footer-categories" value="entertainment" class="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"> <svg class="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg>
Entertainment
</label> <!-- Lifestyle --> <label class="flex items-center gap-2 p-1.5 rounded-lg text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"> <input type="checkbox" name="footer-categories" value="lifestyle" class="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"> <svg class="w-4 h-4 text-yellow-500 dark:text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path> </svg>
Lifestyle
</label> <!-- Real Estate --> <label class="flex items-center gap-2 p-1.5 rounded-lg text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"> <input type="checkbox" name="footer-categories" value="real-estate" class="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"> <svg class="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"></path> </svg>
Real Estate
</label> <!-- Finance --> <label class="flex items-center gap-2 p-1.5 rounded-lg text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"> <input type="checkbox" name="footer-categories" value="finance" class="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"> <svg class="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg>
Finance
</label> </div> <button type="button" id="footer-toggle-categories" class="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1">
− Hide preferences
</button> </div> <!-- Message --> <div id="footer-newsletter-message" class="text-xs hidden"></div> <p class="text-[10px] text-gray-400 dark:text-gray-500">
No spam. Unsubscribe anytime. By subscribing you agree to our Privacy Policy.
</p> </form> </div> </div> </div> </div> <!-- Footer Bottom --> <div class="py-6 border-t border-gray-200/50 dark:border-gray-800/50 flex flex-col sm:flex-row justify-between items-center gap-4"> <p class="text-sm text-gray-500 dark:text-gray-400">
© ${currentYear} <a href="/" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium">Trendlin</a>. All rights reserved.
</p> <div class="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400"> <a href="/privacy" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Privacy</a> <a href="/terms" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Terms</a> <a href="/cookies" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Cookies</a> </div> </div> </div> </footer> <!-- ==========================================
NEWSLETTER FORM JAVASCRIPT
========================================== --> ${renderScript($$result, "P:/Projects/trendlin/src/components/Footer.astro?astro&type=script&index=0&lang.ts")}`;
}, "P:/Projects/trendlin/src/components/Footer.astro", void 0);

export { $$Footer as $, $$Navbar as a };
