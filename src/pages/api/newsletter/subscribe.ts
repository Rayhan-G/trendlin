// /src/pages/api/newsletter/subscribe.ts
import type { APIRoute } from 'astro';
import { 
  createSubscriber, 
  getSubscriberByEmail, 
  updateSubscriberPreferences 
} from '../../../lib/newsletter';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { email, firstName, categories, token } = await request.json();
    const env = locals.env;

    // Validate email
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400 }
      );
    }

    // Check if subscriber exists
    const existing = await getSubscriberByEmail(env, email);

    // If subscriber exists and has a token, update preferences
    if (existing && token) {
      const preferences = {
        categories: categories || [],
        frequency: 'weekly'
      };
      
      const result = await updateSubscriberPreferences(env, token, preferences);
      
      if (result.success) {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Preferences updated successfully!'
          }),
          { status: 200 }
        );
      }
    }

    if (existing) {
      // If active, update preferences and return success
      if (existing.status === 'active') {
        if (categories && categories.length > 0) {
          const preferences = {
            categories: categories || [],
            frequency: 'weekly'
          };
          // Use the existing unsubscribe token
          if (existing.unsubscribe_token) {
            await updateSubscriberPreferences(env, existing.unsubscribe_token, preferences);
          }
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            message: 'You are already subscribed! Preferences updated.',
            alreadySubscribed: true
          }),
          { status: 200 }
        );
      }
      
      if (existing.status === 'pending') {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Please verify your email first. Check your inbox!',
            status: 'pending'
          }),
          { status: 400 }
        );
      }
      
      if (existing.status === 'unsubscribed') {
        // Reactivate
        const db = getDB(env);
        await db
          .prepare(`
            UPDATE newsletter_subscribers 
            SET status = 'pending',
                verification_token = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `)
          .bind(generateToken(), existing.id)
          .run();
        
        // Now send verification
        const updated = await getSubscriberByEmail(env, email);
        if (updated && updated.verification_token) {
          // TODO: Send verification email
          console.log(`[NEWSLETTER] Resubscribing ${email} with token ${updated.verification_token}`);
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Please check your email to verify your subscription!'
          }),
          { status: 200 }
        );
      }
    }

    // Create new subscriber
    const result = await createSubscriber(env, {
      email,
      first_name: firstName || '',
      source: 'footer',
      ip_address: request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for'),
      user_agent: request.headers.get('user-agent')
    });

    // Save preferences if categories selected
    if (categories && categories.length > 0 && result.id) {
      const preferences = {
        categories: categories,
        frequency: 'weekly'
      };
      
      // Get the subscriber to get token
      const subscriber = await getSubscriberByEmail(env, email);
      if (subscriber && subscriber.unsubscribe_token) {
        await updateSubscriberPreferences(env, subscriber.unsubscribe_token, preferences);
      }
    }

    // TODO: Send verification email via Resend
    console.log(`[NEWSLETTER] Verification token for ${email}: ${result.verificationToken}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Please check your email to verify your subscription!'
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Subscribe error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to subscribe' }),
      { status: 500 }
    );
  }
};

// Helper function (duplicate from newsletter.ts but needed for this file)
function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Import getDB
import { getDB } from '../../../lib/db';