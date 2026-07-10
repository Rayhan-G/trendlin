globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../renderers.mjs';

async function GET({ locals }) {
  try {
    const { DB } = locals.runtime.env;
    const result = await DB.prepare(`
      SELECT * FROM posts ORDER BY created_at DESC
    `).all();
    const posts = result.results || [];
    return new Response(JSON.stringify({
      success: true,
      posts,
      count: posts.length
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Failed to fetch posts",
      posts: []
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
async function POST({ request, locals }) {
  try {
    const { DB } = locals.runtime.env;
    const data = await request.json();
    let slug = data.slug;
    if (!slug) {
      slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }
    const existing = await DB.prepare("SELECT id FROM posts WHERE slug = ?").bind(slug).first();
    if (existing) {
      const timestamp = Date.now();
      slug = `${slug}-${timestamp}`;
    }
    const result = await DB.prepare(`
      INSERT INTO posts (
        title, slug, content, excerpt, category, tags, cover_image,
        is_draft, is_published, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      data.title,
      slug,
      data.content,
      data.excerpt || "",
      data.category || "Uncategorized",
      data.tags || "",
      data.cover_image || "",
      data.is_draft === "1" ? 1 : 0,
      data.is_published === "1" ? 1 : 0
    ).run();
    const newPost = await DB.prepare("SELECT * FROM posts WHERE id = ?").bind(result.meta.last_row_id).first();
    return new Response(JSON.stringify({
      success: true,
      post: newPost,
      redirect: "/admin/dashboard?success=post-created"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Failed to create post"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
