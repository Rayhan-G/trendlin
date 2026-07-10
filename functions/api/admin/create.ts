// ============================================
// API: Admin Create - Cloudflare Functions
// Location: functions/api/admin/create.ts
// ============================================

export async function onRequest(context: any) {
  const { request } = context;
  
  console.log('🔵 Create API hit:', request.method);

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({
      success: false,
      error: 'Method not allowed'
    }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Get form data
    const formData = await request.formData();
    const data = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    console.log('📝 Creating post:', data);
    
    // Validate
    if (!data.title || !data.html_content) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Title and content are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create post
    const post = {
      id: Date.now(),
      title: data.title,
      slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      excerpt: data.excerpt || '',
      html_content: data.html_content,
      category: data.category || 'Uncategorized',
      tags: data.tags || '',
      is_draft: data.is_draft === '1' ? 1 : 0,
      is_published: data.is_published === '1' ? 1 : 0,
      created_at: new Date().toISOString()
    };
    
    return new Response(JSON.stringify({
      success: true,
      post: post,
      redirect: '/admin/dashboard?success=post-created'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to create post'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}