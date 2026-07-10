// ============================================
// API: Upload Image to R2
// ============================================

export async function POST({ request, locals }) {
  try {
    const { R2_BUCKET } = locals.runtime.env;
    
    // Check if R2 is configured
    if (!R2_BUCKET) {
      console.error('R2_BUCKET not configured in environment');
      return new Response(JSON.stringify({
        success: false,
        error: 'Storage not configured. Please set up R2 bucket.'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get the uploaded file from the form data
    const formData = await request.formData();
    const file = formData.get('image');
    
    if (!file) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No image file provided'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid file type. Please upload JPEG, PNG, WebP, or GIF.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({
        success: false,
        error: 'File too large. Maximum size is 5MB.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop();
    const filename = `posts/${timestamp}-${random}.${extension}`;

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to R2
    await R2_BUCKET.put(filename, uint8Array, {
      httpMetadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000' // Cache for 1 year
      }
    });

    // Construct the URL
    // Option 1: If using R2 public bucket with custom domain
    const url = `https://cdn.yourdomain.com/${filename}`;
    
    // Option 2: If using R2 with public access
    // const url = `https://your-bucket-name.r2.cloudflarestorage.com/${filename}`;
    
    // Option 3: If using R2 with custom domain and worker
    // const url = `https://images.yourdomain.com/${filename}`;

    console.log('✅ Image uploaded:', filename);

    return new Response(JSON.stringify({
      success: true,
      url: url,
      filename: filename
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to upload image'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}