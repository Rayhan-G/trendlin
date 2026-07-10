globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../../renderers.mjs';

async function GET({ params, locals }) {
  try {
    const { id } = params;
    const { DB } = locals.runtime.env;
    const post = await DB.prepare("SELECT * FROM posts WHERE id = ?").bind(id).first();
    if (!post) {
      return new Response(JSON.stringify({
        success: false,
        error: "Post not found"
      }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      post
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to fetch post"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
async function PUT({ params, request, locals }) {
  try {
    const { id } = params;
    const { DB } = locals.runtime.env;
    const data = await request.json();
    console.log("📝 Updating post:", { id, data });
    const existing = await DB.prepare("SELECT * FROM posts WHERE id = ?").bind(id).first();
    if (!existing) {
      return new Response(JSON.stringify({
        success: false,
        error: "Post not found"
      }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    await DB.prepare(`
      UPDATE posts 
      SET title = ?, slug = ?, content = ?, excerpt = ?, 
          category = ?, tags = ?, is_draft = ?, is_published = ?, 
          updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      data.title,
      data.slug,
      data.content,
      data.excerpt || "",
      data.category || "Uncategorized",
      data.tags || "",
      data.is_draft === "1" ? 1 : 0,
      data.is_published === "1" ? 1 : 0,
      id
    ).run();
    const updatedPost = await DB.prepare("SELECT * FROM posts WHERE id = ?").bind(id).first();
    console.log("✅ Post updated:", updatedPost);
    return new Response(JSON.stringify({
      success: true,
      post: updatedPost,
      redirect: "/admin/dashboard?success=post-updated"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("❌ Error updating post:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Failed to update post"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
async function DELETE({ params, locals }) {
  try {
    const { id } = params;
    const { DB } = locals.runtime.env;
    const existing = await DB.prepare("SELECT * FROM posts WHERE id = ?").bind(id).first();
    if (!existing) {
      return new Response(JSON.stringify({
        success: false,
        error: "Post not found"
      }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    await DB.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
    console.log(`✅ Post ${id} deleted successfully`);
    return new Response(JSON.stringify({
      success: true,
      message: `Post ${id} deleted successfully`
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("❌ Error deleting post:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Failed to delete post"
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
  DELETE,
  GET,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
