globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                 */
import { c as createAstro, a as createComponent, g as renderComponent, f as renderScript, d as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_DVHrQl8d.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_CGfDT0zE.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://b484b1fd.my-content-site.pages.dev");
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const cookie = Astro2.request.headers.get("cookie");
  cookie && cookie.includes("session=");
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Admin Login - Trendlin" }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-8"> <div class="w-full max-w-md"> <!-- ============================================
      SUBSECTION 1.1: Login Card
      ============================================ --> <div class="bg-white dark:bg-gray-800/90 rounded-2xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50"> <!-- Logo & Header --> <div class="text-center mb-8"> <div class="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg shadow-blue-500/25">
T
</div> <h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
Admin Access
</h1> <p class="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
Enter your credentials to manage content
</p> </div> <!-- ============================================
        SUBSECTION 1.2: Login Form
        ============================================ --> <form action="/admin/dashboard" method="GET" class="space-y-5"> <!-- Username Field --> <div> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
Username
</label> <div class="relative"> <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path> </svg> </div> <input type="text" id="username" value="admin" class="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Enter username"> </div> </div> <!-- Password Field --> <div> <div class="flex items-center justify-between mb-1.5"> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
Password
</label> <a href="#" class="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
Forgot?
</a> </div> <div class="relative"> <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path> </svg> </div> <input type="password" id="password" value="admin123" class="w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Enter password"> <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" onclick="togglePassword()"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path> </svg> </button> </div> </div> <!-- Submit Button --> <button type="submit" class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"> <span class="flex items-center justify-center gap-2">
Sign In
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path> </svg> </span> </button> </form> <!-- ============================================
        SUBSECTION 1.3: Footer
        ============================================ --> <div class="mt-6 text-center"> <div class="flex items-center justify-center gap-3 text-xs text-gray-400 dark:text-gray-500"> <span class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md font-mono">admin</span> <span>/</span> <span class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md font-mono">admin123</span> </div> <a href="/" class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors mt-4"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path> </svg>
Back to Home
</a> </div> </div> <!-- ============================================
      SUBSECTION 1.4: Security Badge
      ============================================ --> <div class="mt-4 text-center"> <div class="inline-flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500"> <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path> </svg> <span>Secure connection</span> <span class="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span> <span>SSL encrypted</span> </div> </div> </div> </div> ` })} <!-- ============================================
SECTION 2: JavaScript (Show/Hide Password)
============================================ --> ${renderScript($$result, "P:/Projects/trendlin/src/pages/admin/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "P:/Projects/trendlin/src/pages/admin/index.astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/admin/index.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
