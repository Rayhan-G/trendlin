// ============================================
// Email Templates
// ============================================

// ============================================
// 1. CONTACT EMAIL TEMPLATE (Admin Notification)
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

// ============================================
// 2. AUTO-REPLY TEMPLATE (General)
// ============================================

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

// ============================================
// 3. NOTIFICATION TEMPLATE
// ============================================

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

// ============================================
// 4. PRIVACY TEAM AUTO-REPLY
// ============================================

export function privacyAutoReplyTemplate(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Privacy Request Received</title>
      <style>
        body { font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; }
        .container { background: white; border-radius: 16px; padding: 48px 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border-top: 4px solid #8b5cf6; }
        .header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 32px; }
        .header .icon { font-size: 48px; margin-bottom: 8px; }
        .header h1 { margin: 0; color: #0f172a; font-size: 28px; font-weight: 700; font-family: 'Space Grotesk', sans-serif; }
        .badge { display: inline-block; background: #8b5cf6; color: white; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .content { margin: 32px 0; }
        .content p { color: #334155; }
        .footer { margin-top: 32px; padding-top: 24px; border-top: 2px solid #f1f5f9; font-size: 14px; color: #94a3b8; text-align: center; }
        .shield { color: #8b5cf6; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="icon">🔒</div>
          <h1>Privacy Request Received</h1>
          <p><span class="badge">Privacy Team</span></p>
        </div>
        <div class="content">
          <p style="font-size: 18px; font-weight: 500; color: #0f172a;">Hi ${data.name || 'there'},</p>
          <p>Thank you for contacting Trendlin's Privacy Team.</p>
          <p>We have received your privacy-related inquiry and will respond within <strong>48 hours</strong>.</p>
          <div style="background: #f5f3ff; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
            <p style="margin: 0; color: #5b21b6; font-size: 14px;">
              <span class="shield">🛡️</span> Your privacy matters to us. Your request has been logged and will be handled with care.
            </p>
          </div>
          <p style="color: #64748b;">You can review our <a href="/privacy" style="color: #8b5cf6; text-decoration: none; font-weight: 500;">Privacy Policy</a> for more information.</p>
        </div>
        <div class="footer">
          <p>— The Trendlin Privacy Team</p>
          <p style="font-size: 12px;">This is an automated reply. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ============================================
// 5. LEGAL TEAM AUTO-REPLY
// ============================================

export function legalAutoReplyTemplate(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Legal Inquiry Received</title>
      <style>
        body { font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; }
        .container { background: white; border-radius: 16px; padding: 48px 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border-top: 4px solid #ef4444; }
        .header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 32px; }
        .header .icon { font-size: 48px; margin-bottom: 8px; }
        .header h1 { margin: 0; color: #0f172a; font-size: 28px; font-weight: 700; font-family: 'Space Grotesk', sans-serif; }
        .badge { display: inline-block; background: #ef4444; color: white; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .content { margin: 32px 0; }
        .content p { color: #334155; }
        .footer { margin-top: 32px; padding-top: 24px; border-top: 2px solid #f1f5f9; font-size: 14px; color: #94a3b8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="icon">⚖️</div>
          <h1>Legal Inquiry Received</h1>
          <p><span class="badge">Legal Team</span></p>
        </div>
        <div class="content">
          <p style="font-size: 18px; font-weight: 500; color: #0f172a;">Hi ${data.name || 'there'},</p>
          <p>Thank you for contacting Trendlin's Legal Team.</p>
          <p>We have received your legal inquiry and will respond within <strong>48 hours</strong>.</p>
          <div style="background: #fef2f2; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <p style="margin: 0; color: #991b1b; font-size: 14px;">
              ⚖️ Your message has been forwarded to our legal department for review.
            </p>
          </div>
          <p style="color: #64748b;">You can review our <a href="/terms" style="color: #ef4444; text-decoration: none; font-weight: 500;">Terms of Service</a> for more information.</p>
        </div>
        <div class="footer">
          <p>— The Trendlin Legal Team</p>
          <p style="font-size: 12px;">This is an automated reply. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ============================================
// 6. COOKIE POLICY AUTO-REPLY
// ============================================

export function cookieAutoReplyTemplate(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cookie Policy Question</title>
      <style>
        body { font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; }
        .container { background: white; border-radius: 16px; padding: 48px 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border-top: 4px solid #f59e0b; }
        .header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 32px; }
        .header .icon { font-size: 48px; margin-bottom: 8px; }
        .header h1 { margin: 0; color: #0f172a; font-size: 28px; font-weight: 700; font-family: 'Space Grotesk', sans-serif; }
        .badge { display: inline-block; background: #f59e0b; color: white; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .content { margin: 32px 0; }
        .content p { color: #334155; }
        .footer { margin-top: 32px; padding-top: 24px; border-top: 2px solid #f1f5f9; font-size: 14px; color: #94a3b8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="icon">🍪</div>
          <h1>Cookie Policy Question</h1>
          <p><span class="badge">Support Team</span></p>
        </div>
        <div class="content">
          <p style="font-size: 18px; font-weight: 500; color: #0f172a;">Hi ${data.name || 'there'},</p>
          <p>Thank you for your question about our Cookie Policy.</p>
          <p>We have received your inquiry and will provide a detailed response within <strong>24-48 hours</strong>.</p>
          <div style="background: #fffbeb; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              🍪 You can manage cookie preferences in your browser settings at any time.
            </p>
          </div>
          <p style="color: #64748b;">In the meantime, you can review our <a href="/cookies" style="color: #f59e0b; text-decoration: none; font-weight: 500;">Cookie Policy</a>.</p>
        </div>
        <div class="footer">
          <p>— The Trendlin Support Team</p>
          <p style="font-size: 12px;">This is an automated reply. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ============================================
// 7. TERMS OF SERVICE AUTO-REPLY
// ============================================

export function termsAutoReplyTemplate(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Terms of Service Question</title>
      <style>
        body { font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; }
        .container { background: white; border-radius: 16px; padding: 48px 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border-top: 4px solid #6366f1; }
        .header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 32px; }
        .header .icon { font-size: 48px; margin-bottom: 8px; }
        .header h1 { margin: 0; color: #0f172a; font-size: 28px; font-weight: 700; font-family: 'Space Grotesk', sans-serif; }
        .badge { display: inline-block; background: #6366f1; color: white; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .content { margin: 32px 0; }
        .content p { color: #334155; }
        .footer { margin-top: 32px; padding-top: 24px; border-top: 2px solid #f1f5f9; font-size: 14px; color: #94a3b8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="icon">📜</div>
          <h1>Terms of Service Question</h1>
          <p><span class="badge">Legal Team</span></p>
        </div>
        <div class="content">
          <p style="font-size: 18px; font-weight: 500; color: #0f172a;">Hi ${data.name || 'there'},</p>
          <p>Thank you for your question about our Terms of Service.</p>
          <p>We have received your inquiry and will respond within <strong>24-48 hours</strong>.</p>
          <div style="background: #eef2ff; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #6366f1;">
            <p style="margin: 0; color: #3730a3; font-size: 14px;">
              📋 Our Terms of Service outline the rules for using our platform.
            </p>
          </div>
          <p style="color: #64748b;">You can review our <a href="/terms" style="color: #6366f1; text-decoration: none; font-weight: 500;">Terms of Service</a> in the meantime.</p>
        </div>
        <div class="footer">
          <p>— The Trendlin Legal Team</p>
          <p style="font-size: 12px;">This is an automated reply. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ============================================
// 8. PARTNERSHIP AUTO-REPLY
// ============================================

export function partnershipAutoReplyTemplate(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Partnership Opportunity</title>
      <style>
        body { font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; }
        .container { background: white; border-radius: 16px; padding: 48px 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border-top: 4px solid #10b981; }
        .header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 32px; }
        .header .icon { font-size: 48px; margin-bottom: 8px; }
        .header h1 { margin: 0; color: #0f172a; font-size: 28px; font-weight: 700; font-family: 'Space Grotesk', sans-serif; }
        .badge { display: inline-block; background: #10b981; color: white; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .content { margin: 32px 0; }
        .content p { color: #334155; }
        .footer { margin-top: 32px; padding-top: 24px; border-top: 2px solid #f1f5f9; font-size: 14px; color: #94a3b8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="icon">🤝</div>
          <h1>Partnership Opportunity</h1>
          <p><span class="badge">Partnership Team</span></p>
        </div>
        <div class="content">
          <p style="font-size: 18px; font-weight: 500; color: #0f172a;">Hi ${data.name || 'there'},</p>
          <p>Thank you for your interest in partnering with Trendlin!</p>
          <p>We have received your partnership inquiry and will review it within <strong>24-48 hours</strong>.</p>
          <div style="background: #ecfdf5; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p style="margin: 0; color: #065f46; font-size: 14px;">
              ✨ Our partnerships team will reach out to you shortly to discuss potential collaboration.
            </p>
          </div>
          <p style="color: #64748b;">We look forward to exploring how we can work together!</p>
        </div>
        <div class="footer">
          <p>— The Trendlin Partnerships Team</p>
          <p style="font-size: 12px;">This is an automated reply. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ============================================
// 9. FEEDBACK AUTO-REPLY
// ============================================

export function feedbackAutoReplyTemplate(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Feedback Received</title>
      <style>
        body { font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; }
        .container { background: white; border-radius: 16px; padding: 48px 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border-top: 4px solid #6366f1; }
        .header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 32px; }
        .header .icon { font-size: 48px; margin-bottom: 8px; }
        .header h1 { margin: 0; color: #0f172a; font-size: 28px; font-weight: 700; font-family: 'Space Grotesk', sans-serif; }
        .badge { display: inline-block; background: #6366f1; color: white; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .content { margin: 32px 0; }
        .content p { color: #334155; }
        .footer { margin-top: 32px; padding-top: 24px; border-top: 2px solid #f1f5f9; font-size: 14px; color: #94a3b8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="icon">💬</div>
          <h1>Feedback Received</h1>
          <p><span class="badge">Feedback Team</span></p>
        </div>
        <div class="content">
          <p style="font-size: 18px; font-weight: 500; color: #0f172a;">Hi ${data.name || 'there'},</p>
          <p>Thank you for taking the time to share your feedback with us!</p>
          <p>We value your input and will review your feedback carefully.</p>
          <div style="background: #eef2ff; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #6366f1;">
            <p style="margin: 0; color: #3730a3; font-size: 14px;">
              💡 Your feedback helps us improve Trendlin for everyone.
            </p>
          </div>
          <p style="color: #64748b;">We may reach out to you if we need more details.</p>
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

// ============================================
// 10. TECHNICAL ISSUE AUTO-REPLY
// ============================================

export function technicalAutoReplyTemplate(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Technical Issue Received</title>
      <style>
        body { font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; }
        .container { background: white; border-radius: 16px; padding: 48px 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border-top: 4px solid #06b6d4; }
        .header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 32px; }
        .header .icon { font-size: 48px; margin-bottom: 8px; }
        .header h1 { margin: 0; color: #0f172a; font-size: 28px; font-weight: 700; font-family: 'Space Grotesk', sans-serif; }
        .badge { display: inline-block; background: #06b6d4; color: white; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .content { margin: 32px 0; }
        .content p { color: #334155; }
        .footer { margin-top: 32px; padding-top: 24px; border-top: 2px solid #f1f5f9; font-size: 14px; color: #94a3b8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="icon">🔧</div>
          <h1>Technical Issue Received</h1>
          <p><span class="badge">Tech Support</span></p>
        </div>
        <div class="content">
          <p style="font-size: 18px; font-weight: 500; color: #0f172a;">Hi ${data.name || 'there'},</p>
          <p>Thank you for reporting this technical issue.</p>
          <p>Our team will investigate and get back to you within <strong>24-48 hours</strong>.</p>
          <div style="background: #ecfeff; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #06b6d4;">
            <p style="margin: 0; color: #0e7490; font-size: 14px;">
              🛠️ We take technical issues seriously and will prioritize your report.
            </p>
          </div>
          <p style="color: #64748b;">We appreciate your patience while we resolve this.</p>
        </div>
        <div class="footer">
          <p>— The Trendlin Tech Support Team</p>
          <p style="font-size: 12px;">This is an automated reply. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}