globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                    */
import { c as createAstro, a as createComponent, g as renderComponent, f as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_DJuXqbzQ.mjs';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_gEKe8TRP.mjs';
import { g as getCurrentUser } from '../../chunks/auth_Db9O8NHf.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://b484b1fd.my-content-site.pages.dev");
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  const { DB } = Astro2.locals.runtime.env;
  const user = await getCurrentUser(Astro2.request, DB);
  if (user) {
    return Astro2.redirect("/admin/dashboard");
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$BaseLayout, { "title": "Admin Login" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen flex items-center justify-center bg-gray-100"> <div class="bg-white p-8 rounded-xl shadow-lg max-w-md w-full"> <div class="text-center mb-8"> <h1 class="text-2xl font-bold text-gray-800">Admin Login</h1> <p class="text-sm text-gray-500 mt-1">Sign in to manage your content</p> </div> ${Astro2.url.searchParams.get("error") && renderTemplate`<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"> ${Astro2.url.searchParams.get("error")} </div>`} <form method="POST" action="/api/auth/login"> <div class="mb-4"> <label class="block text-sm font-medium text-gray-700 mb-1">Username</label> <input type="text" name="username" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"> </div> <div class="mb-6"> <label class="block text-sm font-medium text-gray-700 mb-1">Password</label> <input type="password" name="password" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"> </div> <button type="submit" class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200">
Sign In
</button> </form> </div> </div> ` })}`;
}, "P:/Projects/trendlin/src/pages/admin/login.astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/admin/login.astro";
const $$url = "/admin/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
