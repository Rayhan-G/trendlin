// ============================================
// Email Templates
// ============================================

export function contactEmailTemplate(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Message</title>
      <style>
        body { font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; }
        .container { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #0f172a; font-size: 24px; }
        .field { margin-bottom: 20px; }
        .field-label { font-weight: 600; color: #475569; font-size: 14px; margin-bottom: 5px; }
        .field-value { background: #f8fafc; padding: 12px 16px; border-radius: 8px; color: #0f172a; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0; font-size: 14px; color: #64748b; text-align: center; }
        .badge { display: inline-block; background: #3b82f6; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .message { white-space: pre-wrap; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📬 New Contact Message</h1>
          <span class="badge">${data.timestamp || 'New'}</span>
        </div>
        
        <div class="field">
          <div class="field-label">Name</div>
          <div class="field-value">${data.name}</div>
        </div>
        
        <div class="field">
          <div class="field-label">Email</div>
          <div class="field-value"><a href="mailto:${data.email}">${data.email}</a></div>
        </div>
        
        ${data.phone ? `
        <div class="field">
          <div class="field-label">Phone</div>
          <div class="field-value">${data.phone}</div>
        </div>
        ` : ''}
        
        <div class="field">
          <div class="field-label">Subject</div>
          <div class="field-value">${data.subject}</div>
        </div>
        
        <div class="field">
          <div class="field-label">Message</div>
          <div class="field-value message">${data.message}</div>
        </div>
        
        <div class="footer">
          <p>Message sent from Trendlin Contact Form</p>
          <p style="font-size: 12px;">IP: ${data.ip || 'N/A'} • User Agent: ${data.userAgent || 'N/A'}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function autoReplyTemplate(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank You for Contacting Trendlin</title>
      <style>
        body { font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; }
        .container { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #0f172a; font-size: 28px; }
        .header p { color: #64748b; margin: 5px 0 0; }
        .content { margin: 30px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0; font-size: 14px; color: #64748b; text-align: center; }
        .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>👋 Thank You for Contacting Us!</h1>
          <p>We appreciate you reaching out to Trendlin</p>
        </div>
        
        <div class="content">
          <p>Hi ${data.name},</p>
          <p>Thank you for contacting Trendlin. We have received your message and will get back to you as soon as possible (usually within 24-48 hours).</p>
          
          <p>Here's a summary of your message:</p>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <strong>Subject:</strong> ${data.subject}<br>
            <strong>Message:</strong> ${data.message.substring(0, 200)}${data.message.length > 200 ? '...' : ''}
          </div>
          
          <p>In the meantime, you can:</p>
          <ul>
            <li>📚 <a href="https://trendlin.com">Read our latest articles</a></li>
            <li>📱 <a href="https://trendlin.com/categories">Explore our categories</a></li>
            <li>💬 <a href="https://trendlin.com/contact">Send us another message</a></li>
          </ul>
        </div>
        
        <div class="footer">
          <p>— The Trendlin Team</p>
          <p style="font-size: 12px;">This is an automated reply. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function notificationEmailTemplate(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Trendlin Notification</title>
      <style>
        body { font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; }
        .container { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #0f172a; font-size: 24px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0; font-size: 14px; color: #64748b; text-align: center; }
        .info { background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📨 ${data.title}</h1>
        </div>
        
        <div class="info">
          ${data.message}
        </div>
        
        ${data.cta ? `
        <a href="${data.cta.url}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0;">
          ${data.cta.text}
        </a>
        ` : ''}
        
        <div class="footer">
          <p>— Trendlin</p>
        </div>
      </div>
    </body>
    </html>
  `;
}