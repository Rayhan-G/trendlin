// ============================================
// API: SAVE SUBSCRIBER PREFERENCES
// PRODUCTION READY - Cloudflare Pages Compatible
// ============================================

export async function POST({ request, locals }) {
  try {
    console.log('📝 Save preferences API called');
    
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

    const { email, token, categories } = await request.json();

    // Validate required fields
    if (!email || !token || !categories) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email, token, and categories are required' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate categories is an array
    if (!Array.isArray(categories) || categories.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Categories must be a non-empty array' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('📝 Save preferences for:', email);

    // Find subscriber by token and email
    const subscriber = await DB
      .prepare('SELECT * FROM newsletter_subscribers WHERE unsubscribe_token = ? AND email = ?')
      .bind(token, email.toLowerCase().trim())
      .first();

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

    // Prepare preferences object
    const preferences = {
      categories: categories,
      updatedAt: new Date().toISOString()
    };

    // Update preferences
    await DB
      .prepare(`
        UPDATE newsletter_subscribers 
        SET preferences = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(JSON.stringify(preferences), subscriber.id)
      .run();

    console.log('✅ Preferences saved for:', email);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Preferences updated successfully',
        data: {
          email: subscriber.email,
          categories: categories
        }
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Save preferences error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to save preferences' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}