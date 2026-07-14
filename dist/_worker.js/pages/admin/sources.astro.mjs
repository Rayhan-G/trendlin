globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                    */
import { a as createComponent, e as renderScript, f as renderTemplate } from '../../chunks/astro/server_DJuXqbzQ.mjs';
export { renderers } from '../../renderers.mjs';

const $$Sources = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderScript($$result, "P:/Projects/trendlin/src/pages/admin/sources.astro?astro&type=script&index=0&lang.ts")}`;
}, "P:/Projects/trendlin/src/pages/admin/sources.astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/admin/sources.astro";
const $$url = "/admin/sources";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Sources,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
