// ============================================
// API: Admin Posts - Get, Update, Delete
// Cloudflare Functions
// ============================================

export async function onRequest(context) {
  const { request, env, params } = context;
  const { id } = params;
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS (CORS preflight)
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  // Handle GET - Fetch single post
  if (request.method === 'GET') {
    try {
      if (!env || !env.DB) {
        return new Response(JSON.stringify({
          success: true,
          post: {
            id: parseInt(id),
            title: 'Sample Post',
            slug: 'sample-post',
            content: '<h1>Sample Content</h1><p>This is a sample post.</p>',
            category: 'Technology',
            tags: 'sample, test',
            is_draft: false,
            views: 100,
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          }
        }), { headers });
      }

      const post = await env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first();
      
      if (!post) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Post not found'
        }), { 
          status: 404, 
          headers 
        });
      }

      return new Response(JSON.stringify({
        success: true,
        post: post
      }), { headers });

    } catch (error) {
      console.error('Error fetching post:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to fetch post'
      }), { 
        status: 500, 
        headers 
      });
    }
  }

  // Handle PUT - Update post
  if (request.method === 'PUT') {
    try {
      const data = await request.json();
      console.log(`📝 Updating post ${id}:`, data);

      if (!env || !env.DB) {
        return new Response(JSON.stringify({
          success: true,
          message: 'Post updated (database not available)',
          redirect: '/admin/dashboard?success=post-updated'
        }), { headers });
      }

      await env.DB.prepare(`
        UPDATE posts 
        SET title = ?, slug = ?, content = ?, category = ?, tags = ?, 
            is_draft = ?, is_published = ?, updated_at = datetime('now')
        WHERE id = ?
      `).bind(
        data.title,
        data.slug,
        data.content,
        data.category || 'Uncategorized',
        data.tags || '',
        data.is_draft === '1' ? 1 : 0,
        data.is_published === '1' ? 1 : 0,
        id
      ).run();

      return new Response(JSON.stringify({
        success: true,
        redirect: '/admin/dashboard?success=post-updated'
      }), { 
        status: 200, 
        headers 
      });

    } catch (error) {
      console.error('❌ Error updating post:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message || 'Failed to update post'
      }), { 
        status: 500, 
        headers 
      });
    }
  }

  // Handle DELETE - Delete post
  if (request.method === 'DELETE') {
    try {
      console.log(`🗑️ Deleting post ${id}`);

      if (!env || !env.DB) {
        return new Response(JSON.stringify({
          success: true,
          message: `Post ${id} deleted (database not available)`
        }), { headers });
      }

      // Check if post exists
      const existing = await env.DB.prepare('SELECT id FROM posts WHERE id = ?').bind(id).first();
      
      if (!existing) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Post not found'
        }), { 
          status: 404, 
          headers 
        });
      }
      
      // Delete from database
      await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
      
      return new Response(JSON.stringify({
        success: true,
        message: `Post ${id} deleted successfully`
      }), { 
        status: 200, 
        headers 
      });

    } catch (error) {
      console.error('❌ Error deleting post:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message || 'Failed to delete post'
      }), { 
        status: 500, 
        headers 
      });
    }
  }

  // Method not allowed
  return new Response(JSON.stringify({
    success: false,
    error: `Method ${request.method} not allowed`
  }), { 
    status: 405, 
    headers 
  });
}