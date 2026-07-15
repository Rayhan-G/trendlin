// ============================================
// PUBLIC API: Get Published Posts Only
// ============================================

export async function GET({ locals }) {
  try {
    const { DB } = locals.runtime.env;
    
    // ============================================
    // IMPORTANT: Only return published posts!
    // ============================================
    const result = await DB.prepare(`
      SELECT * FROM posts 
      WHERE is_draft = 0 
      ORDER BY created_at DESC
    `).all();
    
    const posts = result.results || [];
    
    return new Response(JSON.stringify({
      success: true,
      posts: posts,
      count: posts.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to fetch posts',
      posts: []
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}