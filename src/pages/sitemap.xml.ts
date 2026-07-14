import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const { DB } = locals.runtime.env;

  const { results } = await DB.prepare(`
    SELECT slug, updated_at
    FROM posts
    WHERE is_published = 1
    ORDER BY updated_at DESC
  `).all();

  const baseUrl = 'https://trendlin.com';

  const postUrls = results.map((post: any) => `
    <url>
      <loc>${baseUrl}/posts/${post.slug}</loc>
      <lastmod>${post.updated_at}</lastmod>
    </url>
  `).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <url>
    <loc>${baseUrl}</loc>
  </url>

  ${postUrls}

</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml'
    }
  });
};