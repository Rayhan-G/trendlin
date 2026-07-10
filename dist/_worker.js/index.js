globalThis.process ??= {}; globalThis.process.env ??= {};
import { renderers } from './renderers.mjs';
import { createExports } from './_@astrojs-ssr-adapter.mjs';
import { manifest } from './manifest_BNEK4wlk.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/about.astro.mjs');
const _page2 = () => import('./pages/admin/dashboard.astro.mjs');
const _page3 = () => import('./pages/admin/edit/_id_.astro.mjs');
const _page4 = () => import('./pages/admin/logout.astro.mjs');
const _page5 = () => import('./pages/admin/new.astro.mjs');
const _page6 = () => import('./pages/admin.astro.mjs');
const _page7 = () => import('./pages/api/admin/delete/_id_.astro.mjs');
const _page8 = () => import('./pages/api/admin/posts/_id_.astro.mjs');
const _page9 = () => import('./pages/api/admin/posts.astro.mjs');
const _page10 = () => import('./pages/api/posts.astro.mjs');
const _page11 = () => import('./pages/categories/_category_.astro.mjs');
const _page12 = () => import('./pages/categories.astro.mjs');
const _page13 = () => import('./pages/contact.astro.mjs');
const _page14 = () => import('./pages/cookies.astro.mjs');
const _page15 = () => import('./pages/posts/_slug_.astro.mjs');
const _page16 = () => import('./pages/privacy.astro.mjs');
const _page17 = () => import('./pages/terms.astro.mjs');
const _page18 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js", _page0],
    ["src/pages/about.astro", _page1],
    ["src/pages/admin/dashboard.astro", _page2],
    ["src/pages/admin/edit/[id].astro", _page3],
    ["src/pages/admin/logout.astro", _page4],
    ["src/pages/admin/new.astro", _page5],
    ["src/pages/admin/index.astro", _page6],
    ["src/pages/api/admin/delete/[id].ts", _page7],
    ["src/pages/api/admin/posts/[id].ts", _page8],
    ["src/pages/api/admin/posts.ts", _page9],
    ["src/pages/api/posts.ts", _page10],
    ["src/pages/categories/[category].astro", _page11],
    ["src/pages/categories/index.astro", _page12],
    ["src/pages/contact.astro", _page13],
    ["src/pages/cookies.astro", _page14],
    ["src/pages/posts/[slug].astro", _page15],
    ["src/pages/privacy.astro", _page16],
    ["src/pages/terms.astro", _page17],
    ["src/pages/index.astro", _page18]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _exports = createExports(_manifest);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
