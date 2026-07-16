globalThis.process ??= {}; globalThis.process.env ??= {};
import { E as EmailService } from '../../chunks/email-service_B8-8MdeA.mjs';
export { renderers } from '../../renderers.mjs';

// ============================================
// API: Contact Form with EmailService
// ============================================


async function POST({ request, locals }) {
  try {
    const { RESEND_API_KEY } = locals.runtime.env;
    
    if (!RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not configured');
      return new Response(JSON.stringify({
        success: false,
        error: 'Email service not configured'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await request.json();
    const { name, email, subject, message, phone } = data;

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Name, email, and message are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid email address'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get IP and user agent
    const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'Unknown';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Initialize EmailService
    const emailService = new EmailService(RESEND_API_KEY);

    // Send emails (notification + auto-reply)
    const result = await emailService.sendContactEmail({
      name,
      email,
      subject: subject || 'New Contact Message',
      message,
      phone: phone || '',
      ip,
      userAgent
    });

    console.log('✅ Contact email sent:', { name, email, subject });

    return new Response(JSON.stringify({
      success: true,
      message: 'Email sent successfully',
      result
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Contact API error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to send email'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
