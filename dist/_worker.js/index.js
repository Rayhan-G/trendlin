globalThis.process ??= {}; globalThis.process.env ??= {};
import { renderers } from './renderers.mjs';
import { createExports } from './_@astrojs-ssr-adapter.mjs';
import { manifest } from './manifest_D4DZkadw.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/about.astro.mjs');
const _page2 = () => import('./pages/admin/content.astro.mjs');
const _page3 = () => import('./pages/admin/dashboard.astro.mjs');
const _page4 = () => import('./pages/admin/edit/_id_.astro.mjs');
const _page5 = () => import('./pages/admin/login.astro.mjs');
const _page6 = () => import('./pages/admin/logout.astro.mjs');
const _page7 = () => import('./pages/admin/media.astro.mjs');
const _page8 = () => import('./pages/admin/new.astro.mjs');
const _page9 = () => import('./pages/admin/newsletter.astro.mjs');
const _page10 = () => import('./pages/admin/posts.astro.mjs');
const _page11 = () => import('./pages/admin/products/new.astro.mjs');
const _page12 = () => import('./pages/admin/products/_id_/resources.astro.mjs');
const _page13 = () => import('./pages/admin/products.astro.mjs');
const _page14 = () => import('./pages/admin/sources.astro.mjs');
const _page15 = () => import('./pages/admin/templates.astro.mjs');
const _page16 = () => import('./pages/admin.astro.mjs');
const _page17 = () => import('./pages/api/admin/content/categories.astro.mjs');
const _page18 = () => import('./pages/api/admin/content/stats.astro.mjs');
const _page19 = () => import('./pages/api/admin/content/status.astro.mjs');
const _page20 = () => import('./pages/api/admin/content/types.astro.mjs');
const _page21 = () => import('./pages/api/admin/content/_id_.astro.mjs');
const _page22 = () => import('./pages/api/admin/content.astro.mjs');
const _page23 = () => import('./pages/api/admin/delete/_id_.astro.mjs');
const _page24 = () => import('./pages/api/admin/media/folders.astro.mjs');
const _page25 = () => import('./pages/api/admin/media.astro.mjs');
const _page26 = () => import('./pages/api/admin/posts/_id_.astro.mjs');
const _page27 = () => import('./pages/api/admin/posts.astro.mjs');
const _page28 = () => import('./pages/api/admin/products/_id_/resources.astro.mjs');
const _page29 = () => import('./pages/api/admin/products/_id_/resources2.astro.mjs');
const _page30 = () => import('./pages/api/admin/products/_id_.astro.mjs');
const _page31 = () => import('./pages/api/admin/products.astro.mjs');
const _page32 = () => import('./pages/api/admin/reliable/categories/_id_.astro.mjs');
const _page33 = () => import('./pages/api/admin/reliable/categories.astro.mjs');
const _page34 = () => import('./pages/api/admin/reliable/subcategories/_id_.astro.mjs');
const _page35 = () => import('./pages/api/admin/reliable/subcategories.astro.mjs');
const _page36 = () => import('./pages/api/admin/reliable/subcategories2.astro.mjs');
const _page37 = () => import('./pages/api/admin/reliable/subsubcategories.astro.mjs');
const _page38 = () => import('./pages/api/admin/reliable/websites/_id_/verify.astro.mjs');
const _page39 = () => import('./pages/api/admin/reliable/websites/_id_.astro.mjs');
const _page40 = () => import('./pages/api/admin/reliable/websites.astro.mjs');
const _page41 = () => import('./pages/api/admin/templates/categories.astro.mjs');
const _page42 = () => import('./pages/api/admin/templates/_id_/usage.astro.mjs');
const _page43 = () => import('./pages/api/admin/templates/_id_.astro.mjs');
const _page44 = () => import('./pages/api/admin/templates.astro.mjs');
const _page45 = () => import('./pages/api/auth/login.astro.mjs');
const _page46 = () => import('./pages/api/auth/logout.astro.mjs');
const _page47 = () => import('./pages/api/contact.astro.mjs');
const _page48 = () => import('./pages/api/images/_---path_.astro.mjs');
const _page49 = () => import('./pages/api/newsletter/campaigns.astro.mjs');
const _page50 = () => import('./pages/api/newsletter/check.astro.mjs');
const _page51 = () => import('./pages/api/newsletter/get-subscriber.astro.mjs');
const _page52 = () => import('./pages/api/newsletter/resend-verification.astro.mjs');
const _page53 = () => import('./pages/api/newsletter/save-preferences.astro.mjs');
const _page54 = () => import('./pages/api/newsletter/stats.astro.mjs');
const _page55 = () => import('./pages/api/newsletter/subscribe.astro.mjs');
const _page56 = () => import('./pages/api/newsletter/unsubscribe.astro.mjs');
const _page57 = () => import('./pages/api/newsletter/verify.astro.mjs');
const _page58 = () => import('./pages/api/posts.astro.mjs');
const _page59 = () => import('./pages/api/products/_id_/resources.json.astro.mjs');
const _page60 = () => import('./pages/api/test-db.astro.mjs');
const _page61 = () => import('./pages/api/test-email.astro.mjs');
const _page62 = () => import('./pages/api/upload.astro.mjs');
const _page63 = () => import('./pages/categories.astro.mjs');
const _page64 = () => import('./pages/contact.astro.mjs');
const _page65 = () => import('./pages/cookies.astro.mjs');
const _page66 = () => import('./pages/disclosure.astro.mjs');
const _page67 = () => import('./pages/posts/_slug_.astro.mjs');
const _page68 = () => import('./pages/privacy.astro.mjs');
const _page69 = () => import('./pages/sitemap.xml.astro.mjs');
const _page70 = () => import('./pages/terms.astro.mjs');
const _page71 = () => import('./pages/unsubscribe.astro.mjs');
const _page72 = () => import('./pages/verify-failed.astro.mjs');
const _page73 = () => import('./pages/verify-success.astro.mjs');
const _page74 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js", _page0],
    ["src/pages/about.astro", _page1],
    ["src/pages/admin/content/index.astro", _page2],
    ["src/pages/admin/dashboard.astro", _page3],
    ["src/pages/admin/edit/[id].astro", _page4],
    ["src/pages/admin/login.astro", _page5],
    ["src/pages/admin/logout.astro", _page6],
    ["src/pages/admin/media.astro", _page7],
    ["src/pages/admin/new.astro", _page8],
    ["src/pages/admin/newsletter/index.astro", _page9],
    ["src/pages/admin/posts.astro", _page10],
    ["src/pages/admin/products/new.astro", _page11],
    ["src/pages/admin/products/[id]/resources.astro", _page12],
    ["src/pages/admin/products/index.astro", _page13],
    ["src/pages/admin/sources.astro", _page14],
    ["src/pages/admin/templates.astro", _page15],
    ["src/pages/admin/index.astro", _page16],
    ["src/pages/api/admin/content/categories.ts", _page17],
    ["src/pages/api/admin/content/stats.ts", _page18],
    ["src/pages/api/admin/content/status.ts", _page19],
    ["src/pages/api/admin/content/types.ts", _page20],
    ["src/pages/api/admin/content/[id].ts", _page21],
    ["src/pages/api/admin/content/index.ts", _page22],
    ["src/pages/api/admin/delete/[id].ts", _page23],
    ["src/pages/api/admin/media/folders.js", _page24],
    ["src/pages/api/admin/media/index.js", _page25],
    ["src/pages/api/admin/posts/[id].ts", _page26],
    ["src/pages/api/admin/posts.ts", _page27],
    ["src/pages/api/admin/products/[id]/resources/index.js", _page28],
    ["src/pages/api/admin/products/[id]/resources.js", _page29],
    ["src/pages/api/admin/products/[id].js", _page30],
    ["src/pages/api/admin/products/index.js", _page31],
    ["src/pages/api/admin/reliable/categories/[id].ts", _page32],
    ["src/pages/api/admin/reliable/categories/index.ts", _page33],
    ["src/pages/api/admin/reliable/subcategories/[id].ts", _page34],
    ["src/pages/api/admin/reliable/subcategories/index.ts", _page35],
    ["src/pages/api/admin/reliable/subcategories.ts", _page36],
    ["src/pages/api/admin/reliable/subsubcategories.ts", _page37],
    ["src/pages/api/admin/reliable/websites/[id]/verify.ts", _page38],
    ["src/pages/api/admin/reliable/websites/[id].ts", _page39],
    ["src/pages/api/admin/reliable/websites.ts", _page40],
    ["src/pages/api/admin/templates/categories.js", _page41],
    ["src/pages/api/admin/templates/[id]/usage.js", _page42],
    ["src/pages/api/admin/templates/[id].js", _page43],
    ["src/pages/api/admin/templates/index.js", _page44],
    ["src/pages/api/auth/login.js", _page45],
    ["src/pages/api/auth/logout.js", _page46],
    ["src/pages/api/contact/index.js", _page47],
    ["src/pages/api/images/[...path].js", _page48],
    ["src/pages/api/newsletter/campaigns.ts", _page49],
    ["src/pages/api/newsletter/check.ts", _page50],
    ["src/pages/api/newsletter/get-subscriber.ts", _page51],
    ["src/pages/api/newsletter/resend-verification.ts", _page52],
    ["src/pages/api/newsletter/save-preferences.ts", _page53],
    ["src/pages/api/newsletter/stats.ts", _page54],
    ["src/pages/api/newsletter/subscribe.ts", _page55],
    ["src/pages/api/newsletter/unsubscribe.ts", _page56],
    ["src/pages/api/newsletter/verify.ts", _page57],
    ["src/pages/api/posts.ts", _page58],
    ["src/pages/api/products/[id]/resources.json.ts", _page59],
    ["src/pages/api/test-db.ts", _page60],
    ["src/pages/api/test-email.ts", _page61],
    ["src/pages/api/upload/index.js", _page62],
    ["src/pages/categories/index.astro", _page63],
    ["src/pages/contact.astro", _page64],
    ["src/pages/cookies.astro", _page65],
    ["src/pages/disclosure.astro", _page66],
    ["src/pages/posts/[slug].astro", _page67],
    ["src/pages/privacy.astro", _page68],
    ["src/pages/sitemap.xml.ts", _page69],
    ["src/pages/terms.astro", _page70],
    ["src/pages/unsubscribe/index.astro", _page71],
    ["src/pages/verify-failed.astro", _page72],
    ["src/pages/verify-success.astro", _page73],
    ["src/pages/index.astro", _page74]
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
