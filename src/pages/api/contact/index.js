// ============================================
// API: Contact Form with Resend
// ============================================

import { Resend } from 'resend';

export async function POST({ request, locals }) {
  try {
    const { RESEND_API_KEY, CONTACT_EMAIL } = locals.runtime.env;
    
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
    const { name, email, message, subject } = data;

    // Validate
    if (!name || !email || !message) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Name, email, and message are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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

    const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'Unknown';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Initialize Resend
    const resend = new Resend(RESEND_API_KEY);

    // Send email
    const result = await resend.emails.send({
      from: `Trendlin <${CONTACT_EMAIL || 'contact@trendlin.com'}>`,
      to: [CONTACT_EMAIL || 'contact@trendlin.com'],
      replyTo: email,
      subject: subject || `New contact from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Message</title>
          <style>
            body {
              font-family: 'Inter', -apple-system, sans-serif;
              line-height: 1.6;
              color: #1a1a1a;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background: #f8fafc;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .header {
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0;
              color: #0f172a;
              font-size: 24px;
            }
            .badge {
              display: inline-block;
              background: #3b82f6;
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 500;
            }
            .field {
              margin-bottom: 20px;
            }
            .field-label {
              font-weight: 600;
              color: #475569;
              font-size: 14px;
              margin-bottom: 5px;
            }
            .field-value {
              background: #f8fafc;
              padding: 12px 16px;
              border-radius: 8px;
              color: #0f172a;
            }
            .message {
              white-space: pre-wrap;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #e2e8f0;
              font-size: 14px;
              color: #64748b;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📬 New Contact Message</h1>
              <span class="badge">New</span>
            </div>
            
            <div class="field">
              <div class="field-label">Name</div>
              <div class="field-value">${name}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Email</div>
              <div class="field-value"><a href="mailto:${email}">${email}</a></div>
            </div>
            
            <div class="field">
              <div class="field-label">Message</div>
              <div class="field-value message">${message}</div>
            </div>
            
            <div class="footer">
              <p>Message sent from Trendlin Contact Form</p>
              <p style="font-size: 12px; color: #94a3b8;">IP: ${ip} • User Agent: ${userAgent}</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    console.log('✅ Contact email sent:', { name, email });

    return new Response(JSON.stringify({
      success: true,
      message: 'Email sent successfully'
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