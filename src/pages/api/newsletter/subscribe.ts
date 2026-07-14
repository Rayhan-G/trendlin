// src/pages/api/newsletter/subscribe.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, firstName, categories } = body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid email address' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate categories
    if (!categories || categories.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'Please select at least one category' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate verification token
    const token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);

    // Check if subscriber exists
    const existing = await global.DB.prepare(
      'SELECT * FROM subscribers WHERE email = ?'
    ).bind(email).first();

    if (existing) {
      if (existing.verified === 1 && existing.subscribed === 1) {
        return new Response(
          JSON.stringify({ success: false, message: 'Email already subscribed' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // If not verified, resend verification
      if (existing.verified === 0) {
        // Update token
        await global.DB.prepare(`
          UPDATE subscribers 
          SET verification_token = ?,
              categories = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE email = ?
        `).bind(token, categories.join(','), email).run();

        // Update preferences
        await global.DB.prepare(`
          DELETE FROM newsletter_preferences WHERE subscriber_id = ?
        `).bind(existing.id).run();

        const placeholders = categories.map(() => '(?, ?, 1)').join(', ');
        const values = categories.flatMap(cat => [existing.id, cat]);
        
        await global.DB.prepare(`
          INSERT INTO newsletter_preferences (subscriber_id, category, subscribed)
          VALUES ${placeholders}
        `).bind(...values).run();

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Verification email resent. Please check your inbox.' 
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create new subscriber
    const result = await global.DB.prepare(`
      INSERT INTO subscribers (
        email, 
        first_name, 
        categories, 
        verification_token, 
        verified, 
        subscribed
      )
      VALUES (?, ?, ?, ?, 0, 1)
      RETURNING id
    `).bind(
      email, 
      firstName || '', 
      categories.join(','), 
      token
    ).first();

    // Create preferences
    if (result && categories.length > 0) {
      const placeholders = categories.map(() => '(?, ?, 1)').join(', ');
      const values = categories.flatMap(cat => [result.id, cat]);
      
      await global.DB.prepare(`
        INSERT INTO newsletter_preferences (subscriber_id, category, subscribed)
        VALUES ${placeholders}
      `).bind(...values).run();
    }

    // TODO: Send verification email
    // For now, return success

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Please check your email to verify your subscription.' 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Subscribe error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};