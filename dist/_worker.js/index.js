globalThis.process ??= {}; globalThis.process.env ??= {};
import { renderers } from './renderers.mjs';
import { createExports } from './_@astrojs-ssr-adapter.mjs';
import { manifest } from './manifest_DrlmMFf7.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/about.astro.mjs');
const _page2 = () => import('./pages/admin/dashboard.astro.mjs');
const _page3 = () => import('./pages/admin/edit/_id_.astro.mjs');
const _page4 = () => import('./pages/admin/login.astro.mjs');
const _page5 = () => import('./pages/admin/logout.astro.mjs');
const _page6 = () => import('./pages/admin/media.astro.mjs');
const _page7 = () => import('./pages/admin/new.astro.mjs');
const _page8 = () => import('./pages/admin/posts.astro.mjs');
const _page9 = () => import('./pages/admin/products/new.astro.mjs');
const _page10 = () => import('./pages/admin/products/_id_/resources.astro.mjs');
const _page11 = () => import('./pages/admin/products.astro.mjs');
const _page12 = () => import('./pages/admin/sources.astro.mjs');
const _page13 = () => import('./pages/admin/templates.astro.mjs');
const _page14 = () => import('./pages/admin.astro.mjs');
const _page15 = () => import('./pages/api/admin/delete/_id_.astro.mjs');
const _page16 = () => import('./pages/api/admin/media/folders.astro.mjs');
const _page17 = () => import('./pages/api/admin/media.astro.mjs');
const _page18 = () => import('./pages/api/admin/posts/_id_.astro.mjs');
const _page19 = () => import('./pages/api/admin/posts.astro.mjs');
const _page20 = () => import('./pages/api/admin/products/_id_/resources.astro.mjs');
const _page21 = () => import('./pages/api/admin/products/_id_/resources2.astro.mjs');
const _page22 = () => import('./pages/api/admin/products/_id_.astro.mjs');
const _page23 = () => import('./pages/api/admin/products.astro.mjs');
const _page24 = () => import('./pages/api/admin/sources/categories.astro.mjs');
const _page25 = () => import('./pages/api/admin/sources/states.astro.mjs');
const _page26 = () => import('./pages/api/admin/sources/_id_.astro.mjs');
const _page27 = () => import('./pages/api/admin/sources.astro.mjs');
const _page28 = () => import('./pages/api/admin/templates/categories.astro.mjs');
const _page29 = () => import('./pages/api/admin/templates/_id_/usage.astro.mjs');
const _page30 = () => import('./pages/api/admin/templates/_id_.astro.mjs');
const _page31 = () => import('./pages/api/admin/templates.astro.mjs');
const _page32 = () => import('./pages/api/auth/login.astro.mjs');
const _page33 = () => import('./pages/api/auth/logout.astro.mjs');
const _page34 = () => import('./pages/api/contact.astro.mjs');
const _page35 = () => import('./pages/api/images/_---path_.astro.mjs');
const _page36 = () => import('./pages/api/posts.astro.mjs');
const _page37 = () => import('./pages/api/products/_id_/resources.json.astro.mjs');
const _page38 = () => import('./pages/api/upload.astro.mjs');
const _page39 = () => import('./pages/categories.astro.mjs');
const _page40 = () => import('./pages/contact.astro.mjs');
const _page41 = () => import('./pages/cookies.astro.mjs');
const _page42 = () => import('./pages/disclosure.astro.mjs');
const _page43 = () => import('./pages/posts/_slug_.astro.mjs');
const _page44 = () => import('./pages/privacy.astro.mjs');
const _page45 = () => import('./pages/terms.astro.mjs');
const _page46 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js", _page0],
    ["src/pages/about.astro", _page1],
    ["src/pages/admin/dashboard.astro", _page2],
    ["src/pages/admin/edit/[id].astro", _page3],
    ["src/pages/admin/login.astro", _page4],
    ["src/pages/admin/logout.astro", _page5],
    ["src/pages/admin/media.astro", _page6],
    ["src/pages/admin/new.astro", _page7],
    ["src/pages/admin/posts.astro", _page8],
    ["src/pages/admin/products/new.astro", _page9],
    ["src/pages/admin/products/[id]/resources.astro", _page10],
    ["src/pages/admin/products/index.astro", _page11],
    ["src/pages/admin/sources.astro", _page12],
    ["src/pages/admin/templates.astro", _page13],
    ["src/pages/admin/index.astro", _page14],
    ["src/pages/api/admin/delete/[id].ts", _page15],
    ["src/pages/api/admin/media/folders.js", _page16],
    ["src/pages/api/admin/media/index.js", _page17],
    ["src/pages/api/admin/posts/[id].ts", _page18],
    ["src/pages/api/admin/posts.ts", _page19],
    ["src/pages/api/admin/products/[id]/resources/index.js", _page20],
    ["src/pages/api/admin/products/[id]/resources.js", _page21],
    ["src/pages/api/admin/products/[id].js", _page22],
    ["src/pages/api/admin/products/index.js", _page23],
    ["src/pages/api/admin/sources/categories.js", _page24],
    ["src/pages/api/admin/sources/states.js", _page25],
    ["src/pages/api/admin/sources/[id].js", _page26],
    ["src/pages/api/admin/sources/index.js", _page27],
    ["src/pages/api/admin/templates/categories.js", _page28],
    ["src/pages/api/admin/templates/[id]/usage.js", _page29],
    ["src/pages/api/admin/templates/[id].js", _page30],
    ["src/pages/api/admin/templates/index.js", _page31],
    ["src/pages/api/auth/login.js", _page32],
    ["src/pages/api/auth/logout.js", _page33],
    ["src/pages/api/contact/index.js", _page34],
    ["src/pages/api/images/[...path].js", _page35],
    ["src/pages/api/posts.ts", _page36],
    ["src/pages/api/products/[id]/resources.json.ts", _page37],
    ["src/pages/api/upload/index.js", _page38],
    ["src/pages/categories/index.astro", _page39],
    ["src/pages/contact.astro", _page40],
    ["src/pages/cookies.astro", _page41],
    ["src/pages/disclosure.astro", _page42],
    ["src/pages/posts/[slug].astro", _page43],
    ["src/pages/privacy.astro", _page44],
    ["src/pages/terms.astro", _page45],
    ["src/pages/index.astro", _page46]
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
