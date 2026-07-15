// /src/pages/api/newsletter/verify.ts
import type { APIRoute } from 'astro';
import { verifySubscriber, getSubscriberById } from '../../../lib/newsletter';
import { EmailService } from '../../../lib/email-service';

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const token = url.searchParams.get('token');
    const env = locals.env;

    if (!token) {
      return new Response('Invalid verification token', { status: 400 });
    }

    const result = await verifySubscriber(env, token);

    if (!result.success) {
      // Redirect to failed page
      return new Response(null, {
        status: 302,
        headers: { Location: '/verify-failed' }
      });
    }

    // Send welcome email after successful verification
    try {
      const apiKey = process.env.RESEND_API_KEY || locals.env?.RESEND_API_KEY;
      if (apiKey && result.subscriber) {
        const emailService = new EmailService(apiKey);
        
        // Parse preferences to get categories
        let categories: string[] = [];
        try {
          const prefs = result.subscriber.preferences ? JSON.parse(result.subscriber.preferences) : {};
          categories = prefs.categories || [];
        } catch (e) {
          // Use empty array
        }
        
        // Send welcome email
        await emailService.sendNewsletterWelcome(
          result.subscriber.email,
          result.subscriber.first_name || undefined,
          categories
        );
        
        console.log(`✅ Welcome email sent to ${result.subscriber.email}`);
      }
    } catch (emailError) {
      // Don't fail verification if welcome email fails
      console.error('❌ Failed to send welcome email:', emailError);
    }

    // Redirect to success page
    return new Response(null, {
      status: 302,
      headers: { Location: '/verify-success' }
    });

  } catch (error) {
    console.error('❌ Verification error:', error);
    return new Response('Verification failed', { status: 500 });
  }
};