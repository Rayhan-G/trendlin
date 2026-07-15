// /src/pages/api/newsletter/subscribe.ts
import type { APIRoute } from 'astro';
import { 
  createSubscriber, 
  getSubscriberByEmail, 
  updateSubscriberPreferences 
} from '../../../lib/newsletter';
import { EmailService } from '../../../lib/email-service';

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

    // Initialize EmailService with Resend API key
    const apiKey = process.env.RESEND_API_KEY || locals.env?.RESEND_API_KEY;
    if (!apiKey) {
      console.error('❌ RESEND_API_KEY not set in environment variables');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500 }
      );
    }
    
    const emailService = new EmailService(apiKey);

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
        // Resend verification email using your EmailService
        if (existing.verification_token) {
          await emailService.sendNewsletterVerification(
            email, 
            existing.verification_token, 
            firstName
          );
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Verification email resent! Please check your inbox.',
            status: 'pending'
          }),
          { status: 200 }
        );
      }
      
      if (existing.status === 'unsubscribed') {
        // Reactivate
        const db = getDB(env);
        const newToken = generateToken();
        await db
          .prepare(`
            UPDATE newsletter_subscribers 
            SET status = 'pending',
                verification_token = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `)
          .bind(newToken, existing.id)
          .run();
        
        // Send verification email using your EmailService
        await emailService.sendNewsletterVerification(email, newToken, firstName);
        
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
      source: 'website',
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

    // Send verification email using your EmailService
    await emailService.sendNewsletterVerification(
      email, 
      result.verificationToken, 
      firstName
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Please check your email to verify your subscription!'
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Subscribe error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to subscribe' }),
      { status: 500 }
    );
  }
};

// Helper function
function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Import getDB
import { getDB } from '../../../lib/db';