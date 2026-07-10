// ============================================
// API: Admin Posts - Cloudflare Functions
// ============================================

export async function onRequest(context) {
  const { request, env } = context;
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS (CORS preflight)
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  // Handle GET - Fetch all posts
  if (request.method === 'GET') {
    try {
      // Check if DB exists
      if (!env || !env.DB) {
        return new Response(JSON.stringify({
          success: true,
          posts: [],
          count: 0,
          message: 'No database connection - using empty data'
        }), { headers });
      }

      // Check if table exists
      try {
        const tableCheck = await env.DB.prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='posts'"
        ).first();
        
        if (!tableCheck) {
          return new Response(JSON.stringify({
            success: true,
            posts: [],
            count: 0,
            message: 'Table not found - run schema migration'
          }), { headers });
        }
      } catch (tableError) {
        // Table doesn't exist yet
        return new Response(JSON.stringify({
          success: true,
          posts: [],
          count: 0,
          message: 'Table not found - run schema migration'
        }), { headers });
      }

      // Get all posts
      const result = await env.DB.prepare(`
        SELECT * FROM posts ORDER BY created_at DESC
      `).all();

      return new Response(JSON.stringify({
        success: true,
        posts: result.results || [],
        count: result.results?.length || 0
      }), { headers });

    } catch (error) {
      console.error('Error fetching posts:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch posts',
        posts: [],
        count: 0
      }), { 
        status: 500, 
        headers 
      });
    }
  }

  // Handle POST - Create new post
  if (request.method === 'POST') {
    try {
      let data = {};
      
      // Parse request body
      try {
        data = await request.json();
      } catch {
        // If JSON fails, try form data
        const formData = await request.formData();
        for (const [key, value] of formData.entries()) {
          data[key] = value;
        }
      }

      console.log('📝 Creating post:', data);

      // Validate
      if (!data.title || !data.content) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Title and content are required'
        }), { 
          status: 400, 
          headers 
        });
      }

      // Check if DB exists
      if (!env || !env.DB) {
        // Return success without saving (for testing)
        return new Response(JSON.stringify({
          success: true,
          message: 'Post received (database not available)',
          post: {
            id: Date.now(),
            title: data.title,
            slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            content: data.content,
            category: data.category || 'Uncategorized',
            tags: data.tags || '',
            is_draft: data.is_draft === '1' ? 1 : 0,
            is_published: data.is_published === '1' ? 1 : 0,
            created_at: new Date().toISOString()
          }
        }), { headers });
      }

      // Insert into database
      const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const result = await env.DB.prepare(`
        INSERT INTO posts (title, slug, content, category, tags, is_draft, is_published, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).bind(
        data.title,
        slug,
        data.content,
        data.category || 'Uncategorized',
        data.tags || '',
        data.is_draft === '1' ? 1 : 0,
        data.is_published === '1' ? 1 : 0
      ).run();

      const newPost = {
        id: result.meta?.last_row_id || Date.now(),
        title: data.title,
        slug: slug,
        content: data.content,
        category: data.category || 'Uncategorized',
        tags: data.tags || '',
        is_draft: data.is_draft === '1' ? 1 : 0,
        is_published: data.is_published === '1' ? 1 : 0,
        created_at: new Date().toISOString()
      };

      return new Response(JSON.stringify({
        success: true,
        post: newPost,
        redirect: '/admin/dashboard?success=post-created'
      }), { 
        status: 200, 
        headers 
      });

    } catch (error) {
      console.error('❌ Error creating post:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message || 'Failed to create post'
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