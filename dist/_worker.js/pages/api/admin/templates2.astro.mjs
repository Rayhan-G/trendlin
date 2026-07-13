globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                       */
import { a as createComponent, d as renderTemplate } from '../../../chunks/astro/server_DVHrQl8d.mjs';
export { renderers } from '../../../renderers.mjs';

const $$Templates = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate``;
}, "P:/Projects/trendlin/src/pages/api/admin/templates.astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/api/admin/templates.astro";
const $$url = "/api/admin/templates";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Templates,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
