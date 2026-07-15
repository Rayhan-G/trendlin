import type { APIRoute } from 'astro';
import { verifySubscriber, getSubscriberByToken } from '@/lib/newsletter';
import { EmailService } from '@/lib/email-service';

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const db = (locals as any)?.runtime?.env?.DB;
    const apiKey = (locals as any)?.runtime?.env?.RESEND_API_KEY || 
                   import.meta.env.RESEND_API_KEY || 
                   process.env.RESEND_API_KEY;

    if (!db) {
      return new Response(
        JSON.stringify({ success: false, message: 'Database not available' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = url.searchParams.get('token');

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing verification token' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const subscriber = await getSubscriberByToken(token, db);

    if (!subscriber) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid verification token' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (subscriber.status === 'active') {
      return new Response(null, {
        status: 302,
        headers: { Location: '/verify-success' },
      });
    }

    const verified = await verifySubscriber(token, db);

    if (apiKey && verified) {
      try {
        const emailService = new EmailService(apiKey);
        const categories = verified.categories ? verified.categories.split(',') : [];
        await emailService.sendNewsletterWelcome(
          verified.email,
          verified.first_name || undefined,
          categories
        );
      } catch (emailError) {
        console.error('Welcome email error:', emailError);
      }
    }

    return new Response(null, {
      status: 302,
      headers: { Location: '/verify-success' },
    });
  } catch (error) {
    console.error('Verification error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Something went wrong' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};