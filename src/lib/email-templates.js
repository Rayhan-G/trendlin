// ============================================
// EMAIL TEMPLATES - Trendlin (Pure Black & White)
// ============================================

function baseTemplate(content, label, tag) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trendlin</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #f5f7fa;
      padding: 40px 20px;
      -webkit-font-smoothing: antialiased;
    }
    .email-card {
      max-width: 560px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #eaeef2;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
      overflow: hidden;
    }
    .card-header {
      padding: 16px 24px;
      border-bottom: 1px solid #eaeef2;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #fafbfc;
    }
    .card-header .label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #6b7280;
    }
    .card-header .tag {
      font-size: 10px;
      font-weight: 500;
      padding: 2px 12px;
      border-radius: 100px;
      background: #eaeef2;
      color: #6b7280;
    }
    .card-body {
      padding: 32px 28px;
    }
    .preview-box {
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #eaeef2;
      padding: 32px 28px;
    }
    .top-line {
      width: 40px;
      height: 3px;
      background: #1a1a1a;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 500;
      color: #1a1a1a;
      margin-bottom: 8px;
    }
    .text {
      color: #4b5563;
      font-size: 15px;
      line-height: 1.7;
      margin-bottom: 16px;
    }
    .info-box {
      background: #f7f9fc;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #eaeef2;
      margin: 16px 0;
    }
    .info-box p {
      font-size: 14px;
      color: #4b5563;
      margin: 0;
    }
    .info-box p strong { color: #1a1a1a; }
    .footer-divider {
      border-top: 1px solid #eaeef2;
      margin: 24px 0 16px;
    }
    .footer-text {
      text-align: center;
      color: #9ca3af;
      font-size: 13px;
    }
    .footer-text .small {
      font-size: 11px;
      color: #d1d5db;
      margin-top: 2px;
    }
    .link {
      color: #1a1a1a;
      text-decoration: underline;
    }
    .header-center {
      text-align: center;
      margin-bottom: 20px;
    }
    .header-center h2 {
      font-size: 22px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0;
    }
    .header-center p {
      color: #6b7280;
      font-size: 14px;
      margin: 4px 0 0;
    }
    @media (max-width: 480px) {
      .card-body { padding: 20px 16px; }
      .preview-box { padding: 20px 16px; }
    }
  </style>
</head>
<body>
  <div class="email-card">
    <div class="card-header">
      <span class="label">${label}</span>
      <span class="tag">${tag}</span>
    </div>
    <div class="card-body">
      <div class="preview-box">
        ${content}
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

// ----- 1. ADMIN NOTIFICATION -----
export function contactEmailTemplate(data) {
  const content = `
    <div class="top-line"></div>
    <div style="margin-bottom:24px;">
      <h2 style="font-size:20px;font-weight:600;color:#1a1a1a;margin:0;">New Contact Message</h2>
      <p style="color:#6b7280;font-size:14px;margin:4px 0 0;">${data.timestamp || 'New inquiry'}</p>
    </div>
    
    <div style="margin-bottom:16px;">
      <div style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px;">Name</div>
      <div style="background:#f7f9fc;padding:12px 16px;border-radius:8px;border:1px solid #eaeef2;font-size:15px;color:#1a1a1a;">${data.name}</div>
    </div>
    
    <div style="margin-bottom:16px;">
      <div style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px;">Email</div>
      <div style="background:#f7f9fc;padding:12px 16px;border-radius:8px;border:1px solid #eaeef2;font-size:15px;color:#1a1a1a;">
        <a href="mailto:${data.email}" style="color:#1a1a1a;text-decoration:underline;">${data.email}</a>
      </div>
    </div>
    
    ${data.phone ? `
    <div style="margin-bottom:16px;">
      <div style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px;">Phone</div>
      <div style="background:#f7f9fc;padding:12px 16px;border-radius:8px;border:1px solid #eaeef2;font-size:15px;color:#1a1a1a;">${data.phone}</div>
    </div>
    ` : ''}
    
    <div style="margin-bottom:16px;">
      <div style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px;">Subject</div>
      <div style="background:#f7f9fc;padding:12px 16px;border-radius:8px;border:1px solid #eaeef2;font-size:15px;color:#1a1a1a;">${data.subject}</div>
    </div>
    
    <div>
      <div style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px;">Message</div>
      <div style="background:#f7f9fc;padding:16px;border-radius:8px;border:1px solid #eaeef2;font-size:15px;color:#1a1a1a;white-space:pre-wrap;">${data.message}</div>
    </div>
    
    <div class="footer-divider"></div>
    <div class="footer-text">
      Trendlin
      <div class="small">Automated message</div>
    </div>
  `;
  return baseTemplate(content, 'New Contact', 'Admin');
}

// ----- 2. GENERAL AUTO-REPLY -----
export function autoReplyTemplate(data) {
  const content = `
    <div class="top-line"></div>
    <div class="header-center">
      <h2>We've received your message</h2>
      <p>We'll respond within 24 hours</p>
    </div>
    
    <div class="greeting">Hi ${data.name},</div>
    <div class="text">Thank you for contacting Trendlin. We've received your inquiry and will get back to you as soon as possible.</div>
    
    <div class="info-box">
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p style="margin-top:4px;"><strong>Message:</strong> ${data.message.substring(0, 160)}${data.message.length > 160 ? '...' : ''}</p>
    </div>
    
    <p style="color:#6b7280;font-size:14px;margin:0;">Explore <a href="#" class="link">Trendlin</a></p>
    
    <div class="footer-divider"></div>
    <div class="footer-text">
      Trendlin
      <div class="small">Automated message</div>
    </div>
  `;
  return baseTemplate(content, 'General Inquiry', 'Auto-reply');
}

// ----- 3. PRIVACY AUTO-REPLY -----
export function privacyAutoReplyTemplate(data) {
  const content = `
    <div class="top-line"></div>
    <div class="header-center">
      <h2>Privacy Request Received</h2>
      <p>We take your privacy seriously</p>
    </div>
    
    <div class="greeting">Hi ${data.name || 'there'},</div>
    <div class="text">Thank you for contacting our Privacy Team. We have received your privacy-related inquiry and will respond within 48 hours.</div>
    
    <div class="info-box" style="border-left:3px solid #1a1a1a;">
      <p>Your privacy matters to us. Your request has been logged and will be handled with care.</p>
    </div>
    
    <p style="color:#6b7280;font-size:14px;margin:0;">Review our <a href="#" class="link">Privacy Policy</a></p>
    
    <div class="footer-divider"></div>
    <div class="footer-text">
      Trendlin
      <div class="small">Automated message</div>
    </div>
  `;
  return baseTemplate(content, 'Privacy Inquiry', 'Privacy Team');
}

// ----- 4. LEGAL AUTO-REPLY -----
export function legalAutoReplyTemplate(data) {
  const content = `
    <div class="top-line"></div>
    <div class="header-center">
      <h2>Legal Inquiry Received</h2>
      <p>Forwarded to our legal department</p>
    </div>
    
    <div class="greeting">Hi ${data.name || 'there'},</div>
    <div class="text">Thank you for contacting our Legal Team. We have received your legal inquiry and will respond within 48 hours.</div>
    
    <div class="info-box" style="border-left:3px solid #1a1a1a;">
      <p>Your message has been forwarded to our legal department for review.</p>
    </div>
    
    <p style="color:#6b7280;font-size:14px;margin:0;">Review our <a href="#" class="link">Terms of Service</a></p>
    
    <div class="footer-divider"></div>
    <div class="footer-text">
      Trendlin
      <div class="small">Automated message</div>
    </div>
  `;
  return baseTemplate(content, 'Legal Inquiry', 'Legal Team');
}

// ----- 5. COOKIE AUTO-REPLY -----
export function cookieAutoReplyTemplate(data) {
  const content = `
    <div class="top-line"></div>
    <div class="header-center">
      <h2>Cookie Policy Question</h2>
      <p>We'll help you understand</p>
    </div>
    
    <div class="greeting">Hi ${data.name || 'there'},</div>
    <div class="text">Thank you for your question about our Cookie Policy. We will provide a detailed response within 24-48 hours.</div>
    
    <div class="info-box" style="border-left:3px solid #1a1a1a;">
      <p>You can manage cookie preferences in your browser settings at any time.</p>
    </div>
    
    <p style="color:#6b7280;font-size:14px;margin:0;">Review our <a href="#" class="link">Cookie Policy</a></p>
    
    <div class="footer-divider"></div>
    <div class="footer-text">
      Trendlin
      <div class="small">Automated message</div>
    </div>
  `;
  return baseTemplate(content, 'Cookie Policy', 'Support Team');
}

// ----- 6. TERMS AUTO-REPLY -----
export function termsAutoReplyTemplate(data) {
  const content = `
    <div class="top-line"></div>
    <div class="header-center">
      <h2>Terms of Service Question</h2>
      <p>We'll clarify our terms</p>
    </div>
    
    <div class="greeting">Hi ${data.name || 'there'},</div>
    <div class="text">Thank you for your question about our Terms of Service. We will respond within 24-48 hours.</div>
    
    <div class="info-box" style="border-left:3px solid #1a1a1a;">
      <p>Our Terms of Service outline the rules for using our platform.</p>
    </div>
    
    <p style="color:#6b7280;font-size:14px;margin:0;">Review our <a href="#" class="link">Terms of Service</a></p>
    
    <div class="footer-divider"></div>
    <div class="footer-text">
      Trendlin
      <div class="small">Automated message</div>
    </div>
  `;
  return baseTemplate(content, 'Terms of Service', 'Legal Team');
}

// ----- 7. PARTNERSHIP AUTO-REPLY -----
export function partnershipAutoReplyTemplate(data) {
  const content = `
    <div class="top-line"></div>
    <div class="header-center">
      <h2>Partnership Opportunity</h2>
      <p>Let's explore working together</p>
    </div>
    
    <div class="greeting">Hi ${data.name || 'there'},</div>
    <div class="text">Thank you for your interest in partnering with Trendlin. We will review your inquiry within 24-48 hours.</div>
    
    <div class="info-box" style="border-left:3px solid #1a1a1a;">
      <p>Our partnerships team will reach out to discuss potential collaboration.</p>
    </div>
    
    <p style="color:#6b7280;font-size:14px;margin:0;">We look forward to working together</p>
    
    <div class="footer-divider"></div>
    <div class="footer-text">
      Trendlin
      <div class="small">Automated message</div>
    </div>
  `;
  return baseTemplate(content, 'Partnership', 'Partnership Team');
}

// ----- 8. FEEDBACK AUTO-REPLY -----
export function feedbackAutoReplyTemplate(data) {
  const content = `
    <div class="top-line"></div>
    <div class="header-center">
      <h2>Feedback Received</h2>
      <p>We value your input</p>
    </div>
    
    <div class="greeting">Hi ${data.name || 'there'},</div>
    <div class="text">Thank you for sharing your feedback with us. We value your input and will review it carefully.</div>
    
    <div class="info-box" style="border-left:3px solid #1a1a1a;">
      <p>Your feedback helps us improve Trendlin for everyone.</p>
    </div>
    
    <p style="color:#6b7280;font-size:14px;margin:0;">We may reach out if we need more details</p>
    
    <div class="footer-divider"></div>
    <div class="footer-text">
      Trendlin
      <div class="small">Automated message</div>
    </div>
  `;
  return baseTemplate(content, 'Feedback', 'Feedback Team');
}

// ----- 9. TECHNICAL AUTO-REPLY -----
export function technicalAutoReplyTemplate(data) {
  const content = `
    <div class="top-line"></div>
    <div class="header-center">
      <h2>Technical Issue Received</h2>
      <p>We'll investigate and fix it</p>
    </div>
    
    <div class="greeting">Hi ${data.name || 'there'},</div>
    <div class="text">Thank you for reporting this technical issue. Our team will investigate and get back to you within 24-48 hours.</div>
    
    <div class="info-box" style="border-left:3px solid #1a1a1a;">
      <p>We take technical issues seriously and will prioritize your report.</p>
    </div>
    
    <p style="color:#6b7280;font-size:14px;margin:0;">We appreciate your patience</p>
    
    <div class="footer-divider"></div>
    <div class="footer-text">
      Trendlin
      <div class="small">Automated message</div>
    </div>
  `;
  return baseTemplate(content, 'Technical Issue', 'Tech Support');
}

// ----- 10. NOTIFICATION -----
export function notificationEmailTemplate(data) {
  const content = `
    <div class="top-line"></div>
    <div style="margin-bottom:24px;">
      <h2 style="font-size:20px;font-weight:600;color:#1a1a1a;margin:0;">${data.title}</h2>
    </div>
    
    <div class="info-box" style="background:#f7f9fc;padding:16px;border-radius:8px;border:1px solid #eaeef2;color:#4b5563;font-size:15px;line-height:1.7;">
      ${data.message}
    </div>
    
    ${data.cta ? `
    <div style="height:16px;"></div>
    <a href="${data.cta.url}" style="display:inline-block;background:#1a1a1a;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:500;">${data.cta.text}</a>
    ` : ''}
    
    <div class="footer-divider"></div>
    <div class="footer-text">
      Trendlin
      <div class="small">Automated message</div>
    </div>
  `;
  return baseTemplate(content, 'Notification', 'System');
}