export async function GET({ params, locals }) {
  try {
    const { R2 } = locals.runtime.env;
    const path = params.path || '';
    
    console.log('📸 Getting:', path);
    
    const object = await R2.get(path);
    
    if (!object) {
      console.log('❌ Not found:', path);
      return new Response('Not found', { status: 404 });
    }
    
    const headers = new Headers();
    headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
    headers.set('Cache-Control', 'public, max-age=31536000');
    headers.set('Access-Control-Allow-Origin', '*');
    
    return new Response(object.body, { headers });
    
  } catch (error) {
    console.error('❌ Image error:', error);
    return new Response('Error: ' + error.message, { status: 500 });
  }
}