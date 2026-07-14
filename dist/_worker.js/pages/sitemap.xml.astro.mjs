globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../renderers.mjs';

const GET = async ({ locals }) => {
  const { DB } = locals.runtime.env;
  const { results } = await DB.prepare(`
    SELECT slug, updated_at
    FROM posts
    WHERE is_published = 1
    ORDER BY updated_at DESC
  `).all();
  const baseUrl = "https://trendlin.com";
  const postUrls = results.map((post) => `
    <url>
      <loc>${baseUrl}/posts/${post.slug}</loc>
      <lastmod>${post.updated_at}</lastmod>
    </url>
  `).join("");
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <url>
    <loc>${baseUrl}</loc>
  </url>

  ${postUrls}

</urlset>`;
  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml"
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
