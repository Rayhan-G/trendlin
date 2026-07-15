// ============================================
// API: Admin Delete Post
// ============================================

export async function GET({ params }) {
  const { id } = params;
  
  // Redirect to dashboard after deletion
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/admin/dashboard?deleted=success'
    }
  });
}

export async function DELETE({ params }) {
  const { id } = params;
  
  console.log(`🗑️ Deleting post ${id}`);

  // For now, just return success
  // Later, you can connect to your database
  return new Response(JSON.stringify({
    success: true,
    message: `Post ${id} deleted successfully`
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST({ params }) {
  const { id } = params;
  
  console.log(`🗑️ Deleting post ${id} via POST`);
  
  // For now, just return success
  return new Response(JSON.stringify({
    success: true,
    message: `Post ${id} deleted successfully`,
    redirect: '/admin/dashboard?deleted=success'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}