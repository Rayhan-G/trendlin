// ============================================
// API: Upload Image to R2 with Folder Support
// ============================================

export async function POST({ request, locals }) {
  try {
    const { R2_BUCKET, R2, DB } = locals.runtime.env;
    
    // Try both binding names (R2_BUCKET is what worked before)
    const R2_BINDING = R2_BUCKET || R2;
    
    if (!R2_BINDING) {
      console.error('❌ R2 binding not found. Available:', Object.keys(locals.runtime.env));
      return new Response(JSON.stringify({
        success: false,
        error: 'Storage not configured. R2 binding not found.'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const formData = await request.formData();
    const file = formData.get('image');
    const folder = formData.get('folder') || '';
    
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
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid file type. Please upload JPEG, PNG, WebP, GIF, or SVG.'
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

    // Generate unique filename with folder prefix
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop();
    const filename = folder 
      ? `${folder}/${timestamp}-${random}.${extension}`
      : `${timestamp}-${random}.${extension}`;

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to R2
    await R2_BINDING.put(filename, uint8Array, {
      httpMetadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000'
      }
    });

    // Generate public URL
    const url = `https://pub-efd12abaa5114844a7a358cc14a217de.r2.dev/${filename}`;

    console.log('✅ Image uploaded:', filename);
    console.log('📁 Folder:', folder || 'Root');

    // Save to database with folder info
    const result = await DB.prepare(`
      INSERT INTO media (filename, original_name, url, file_size, mime_type, folder, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      filename,
      file.name,
      url,
      file.size,
      file.type,
      folder || ''
    ).run();

    const mediaId = result.meta.last_row_id;

    return new Response(JSON.stringify({
      success: true,
      url: url,
      filename: filename,
      folder: folder || '',
      mediaId: mediaId
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to upload image'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}