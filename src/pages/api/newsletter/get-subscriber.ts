// ============================================
// API: GET SUBSCRIBER BY EMAIL OR TOKEN
// PRODUCTION READY - Cloudflare Pages Compatible
// ============================================

export async function GET({ locals, url }) {
  try {
    console.log('🔍 Get subscriber API called');
    
    // ✅ USE THE SAME WORKING PATTERN AS YOUR POSTS API
    const { DB } = locals.runtime.env;
    
    if (!DB) {
      console.error('❌ Database not available!');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Database not available' 
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    const email = url.searchParams.get('email');
    const token = url.searchParams.get('token');

    if (!email && !token) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email or token required' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    let subscriber = null;

    if (token) {
      subscriber = await DB
        .prepare('SELECT * FROM newsletter_subscribers WHERE unsubscribe_token = ?')
        .bind(token)
        .first();
    } else if (email) {
      subscriber = await DB
        .prepare('SELECT * FROM newsletter_subscribers WHERE email = ?')
        .bind(email.toLowerCase().trim())
        .first();
    }

    if (!subscriber) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Subscriber not found' 
        }),
        { 
          status: 404, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse preferences
    let preferences = {};
    let categories: string[] = [];
    try {
      preferences = subscriber.preferences ? JSON.parse(subscriber.preferences) : {};
      categories = preferences.categories || [];
    } catch (e) {
      // Use defaults
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: subscriber.id,
          email: subscriber.email,
          firstName: subscriber.first_name,
          lastName: subscriber.last_name,
          status: subscriber.status,
          token: subscriber.unsubscribe_token,
          categories: categories,
          createdAt: subscriber.created_at,
          verifiedAt: subscriber.verified_at
        }
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Get subscriber error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to get subscriber' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}