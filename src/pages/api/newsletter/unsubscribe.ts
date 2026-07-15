import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = (locals as any).runtime?.env?.DB;
    
    if (!db) {
      console.error('❌ Database not available in locals');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Database not available' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { email, token, reason, feedback } = body;

    console.log('📝 Unsubscribe request received:');
    console.log('  Email:', email);
    console.log('  Reason:', reason);
    console.log('  Feedback:', feedback || '(none)');

    if (!email || !token) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ✅ Find subscriber
    const subscriber = await db.prepare(`
      SELECT * FROM subscribers WHERE email = ? AND verification_token = ?
    `).bind(email.toLowerCase().trim(), token).first();

    if (!subscriber) {
      console.log('❌ Subscriber not found');
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid unsubscribe link' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Subscriber found:', subscriber.id, subscriber.email);

    if (subscriber.subscribed === 0) {
      console.log('⚠️ Already unsubscribed');
      return new Response(
        JSON.stringify({ success: false, message: 'You are already unsubscribed' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ✅ Update subscriber - set subscribed to false
    console.log('🔄 Updating subscriber...');
    await db.prepare(`
      UPDATE subscribers 
      SET subscribed = 0, 
          unsubscribed_at = CURRENT_TIMESTAMP,
          verification_token = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(subscriber.id).run();

    // ✅ Update preferences - set all to unsubscribed
    console.log('🔄 Updating preferences...');
    await db.prepare(`
      UPDATE newsletter_preferences 
      SET subscribed = 0,
          updated_at = CURRENT_TIMESTAMP
      WHERE subscriber_id = ?
    `).bind(subscriber.id).run();

    // ✅ Store feedback in unsubscribe_feedback table
    if (reason || feedback) {
      console.log('💾 Storing feedback...');
      await db.prepare(`
        INSERT INTO unsubscribe_feedback (subscriber_id, reason, feedback, created_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(subscriber.id, reason || null, feedback || null).run();
      console.log('✅ Feedback stored successfully');
    }

    console.log('✅ Unsubscribe completed for:', email);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'You have been successfully unsubscribed. We\'ll miss you! 😢',
        data: {
          email: subscriber.email,
          unsubscribedAt: new Date().toISOString(),
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Unsubscribe error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Something went wrong' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};