// ============================================
// EMAIL TEMPLATES - Trendlin (Professional)
// ============================================

function baseTemplate(content: string, label: string, tag: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trendlin</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #f5f5f5;
      padding: 40px 20px;
    }
    .card {
      max-width: 560px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
    }
    .card-header {
      padding: 14px 24px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #fafafa;
    }
    .card-header .label { font-size: 13px; font-weight: 600; color: #000000; }
    .card-header .tag { font-size: 11px; font-weight: 500; padding: 2px 14px; border-radius: 20px; background: #e8e8e8; color: #000000; }
    .card-body { padding: 32px 28px; }
    .box { background: #ffffff; padding: 24px; border: 1px solid #e0e0e0; border-radius: 6px; }
    .line { width: 40px; height: 3px; background: #000000; margin-bottom: 20px; }
    .title { font-size: 22px; font-weight: 600; color: #000000; margin: 0; }
    .sub { font-size: 14px; color: #666666; margin: 4px 0 0; }
    .greeting { font-size: 16px; font-weight: 500; color: #000000; margin-bottom: 8px; }
    .text { font-size: 15px; color: #333333; line-height: 1.7; margin-bottom: 16px; }
    .info-box { background: #f7f7f7; padding: 16px; border-radius: 4px; border: 1px solid #e0e0e0; margin: 16px 0; }
    .info-box p { font-size: 14px; color: #333333; margin: 0; }
    .info-box p strong { color: #000000; }
    .center { text-align: center; margin-bottom: 20px; }
    .link { color: #000000; text-decoration: underline; }
    .footer { border-top: 1px solid #e0e0e0; margin-top: 24px; padding-top: 16px; text-align: center; color: #999999; font-size: 13px; }
    .footer .small { font-size: 11px; color: #bbbbbb; margin-top: 2px; }
    .label-sm { font-size: 12px; font-weight: 600; color: #000000; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }
    .value { background: #f7f7f7; padding: 12px 16px; border-radius: 4px; border: 1px solid #e0e0e0; font-size: 15px; color: #000000; }
    .btn { display: inline-block; background: #000000; color: #ffffff; padding: 12px 28px; border-radius: 4px; text-decoration: none; font-weight: 500; }
    @media (max-width: 480px) { .card-body { padding: 20px 16px; } .box { padding: 16px; } }
  </style>
</head>
<body>
  <div class="card">
    <div class="card-header">
      <span class="label">${label}</span>
      <span class="tag">${tag}</span>
    </div>
    <div class="card-body">
      <div class="box">
        ${content}
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

// ============================================
// CONTACT EMAIL TEMPLATES
// ============================================

export function contactEmailTemplate(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  ip?: string;
  userAgent?: string;
  timestamp?: string;
}): string {
  return baseTemplate(`
    <div class="line"></div>
    <div style="margin-bottom:24px;">
      <div class="title">New Contact Message</div>
      <div class="sub">${data.timestamp || 'New inquiry'}</div>
    </div>
    <div style="margin-bottom:16px;">
      <div class="label-sm">Name</div>
      <div class="value">${data.name}</div>
    </div>
    <div style="margin-bottom:16px;">
      <div class="label-sm">Email</div>
      <div class="value"><a href="mailto:${data.email}" style="color:#000000;text-decoration:underline;">${data.email}</a></div>
    </div>
    ${data.phone ? `<div style="margin-bottom:16px;"><div class="label-sm">Phone</div><div class="value">${data.phone}</div></div>` : ''}
    <div style="margin-bottom:16px;">
      <div class="label-sm">Subject</div>
      <div class="value">${data.subject}</div>
    </div>
    <div>
      <div class="label-sm">Message</div>
      <div class="value" style="white-space:pre-wrap;">${data.message}</div>
    </div>
    ${data.ip ? `<p style="color:#999999;font-size:11px;margin-top:16px;">IP: ${data.ip}</p>` : ''}
    <div class="footer">
      Trendlin
    </div>
  `, 'New Contact', 'Admin');
}

export function autoReplyTemplate(data: {
  name: string;
  subject: string;
  message: string;
}): string {
  return baseTemplate(`
    <div class="line"></div>
    <div class="center">
      <div class="title">We've received your message</div>
      <div class="sub">We'll respond within 24 hours</div>
    </div>
    <div class="greeting">Hi ${data.name},</div>
    <div class="text">Thank you for contacting Trendlin. We've received your inquiry and will get back to you as soon as possible.</div>
    <div class="info-box">
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p style="margin-top:4px;"><strong>Message:</strong> ${data.message.substring(0, 160)}${data.message.length > 160 ? '...' : ''}</p>
    </div>
    <p style="color:#666666;font-size:14px;margin:0;">Explore <a href="https://trendlin.com" class="link">Trendlin</a></p>
    <div class="footer">
      Trendlin
      <div class="small">This is an automated message. Please do not reply to this email.</div>
    </div>
  `, 'General Inquiry', 'Auto-reply');
}

export function privacyAutoReplyTemplate(data: { name?: string }): string {
  return baseTemplate(`
    <div class="line"></div>
    <div class="center">
      <div class="title">Privacy Request Received</div>
      <div class="sub">We take your privacy seriously</div>
    </div>
    <div class="greeting">Hi ${data.name || 'there'},</div>
    <div class="text">Thank you for contacting our Privacy Team. We have received your privacy-related inquiry and will respond within 48 hours.</div>
    <div class="info-box">
      <p>Your privacy matters to us. Your request has been logged and will be handled with care.</p>
    </div>
    <p style="color:#666666;font-size:14px;margin:0;">Review our <a href="https://trendlin.com/privacy" class="link">Privacy Policy</a></p>
    <div class="footer">
      Trendlin
      <div class="small">This is an automated message. Please do not reply to this email.</div>
    </div>
  `, 'Privacy Inquiry', 'Privacy Team');
}

export function legalAutoReplyTemplate(data: { name?: string }): string {
  return baseTemplate(`
    <div class="line"></div>
    <div class="center">
      <div class="title">Legal Inquiry Received</div>
      <div class="sub">Forwarded to our legal department</div>
    </div>
    <div class="greeting">Hi ${data.name || 'there'},</div>
    <div class="text">Thank you for contacting our Legal Team. We have received your legal inquiry and will respond within 48 hours.</div>
    <div class="info-box">
      <p>Your message has been forwarded to our legal department for review.</p>
    </div>
    <p style="color:#666666;font-size:14px;margin:0;">Review our <a href="https://trendlin.com/terms" class="link">Terms of Service</a></p>
    <div class="footer">
      Trendlin
      <div class="small">This is an automated message. Please do not reply to this email.</div>
    </div>
  `, 'Legal Inquiry', 'Legal Team');
}

export function cookieAutoReplyTemplate(data: { name?: string }): string {
  return baseTemplate(`
    <div class="line"></div>
    <div class="center">
      <div class="title">Cookie Policy Question</div>
      <div class="sub">We'll help you understand</div>
    </div>
    <div class="greeting">Hi ${data.name || 'there'},</div>
    <div class="text">Thank you for your question about our Cookie Policy. We will provide a detailed response within 24-48 hours.</div>
    <div class="info-box">
      <p>You can manage cookie preferences in your browser settings at any time.</p>
    </div>
    <p style="color:#666666;font-size:14px;margin:0;">Review our <a href="https://trendlin.com/cookies" class="link">Cookie Policy</a></p>
    <div class="footer">
      Trendlin
      <div class="small">This is an automated message. Please do not reply to this email.</div>
    </div>
  `, 'Cookie Policy', 'Support Team');
}

export function termsAutoReplyTemplate(data: { name?: string }): string {
  return baseTemplate(`
    <div class="line"></div>
    <div class="center">
      <div class="title">Terms of Service Question</div>
      <div class="sub">We'll clarify our terms</div>
    </div>
    <div class="greeting">Hi ${data.name || 'there'},</div>
    <div class="text">Thank you for your question about our Terms of Service. We will respond within 24-48 hours.</div>
    <div class="info-box">
      <p>Our Terms of Service outline the rules for using our platform.</p>
    </div>
    <p style="color:#666666;font-size:14px;margin:0;">Review our <a href="https://trendlin.com/terms" class="link">Terms of Service</a></p>
    <div class="footer">
      Trendlin
      <div class="small">This is an automated message. Please do not reply to this email.</div>
    </div>
  `, 'Terms of Service', 'Legal Team');
}

export function partnershipAutoReplyTemplate(data: { name?: string }): string {
  return baseTemplate(`
    <div class="line"></div>
    <div class="center">
      <div class="title">Partnership Opportunity</div>
      <div class="sub">Let's explore working together</div>
    </div>
    <div class="greeting">Hi ${data.name || 'there'},</div>
    <div class="text">Thank you for your interest in partnering with Trendlin. We will review your inquiry within 24-48 hours.</div>
    <div class="info-box">
      <p>Our partnerships team will reach out to discuss potential collaboration.</p>
    </div>
    <p style="color:#666666;font-size:14px;margin:0;">We look forward to working together</p>
    <div class="footer">
      Trendlin
      <div class="small">This is an automated message. Please do not reply to this email.</div>
    </div>
  `, 'Partnership', 'Partnership Team');
}

export function feedbackAutoReplyTemplate(data: { name?: string }): string {
  return baseTemplate(`
    <div class="line"></div>
    <div class="center">
      <div class="title">Feedback Received</div>
      <div class="sub">We value your input</div>
    </div>
    <div class="greeting">Hi ${data.name || 'there'},</div>
    <div class="text">Thank you for sharing your feedback with us. We value your input and will review it carefully.</div>
    <div class="info-box">
      <p>Your feedback helps us improve Trendlin for everyone.</p>
    </div>
    <p style="color:#666666;font-size:14px;margin:0;">We may reach out if we need more details</p>
    <div class="footer">
      Trendlin
      <div class="small">This is an automated message. Please do not reply to this email.</div>
    </div>
  `, 'Feedback', 'Feedback Team');
}

export function technicalAutoReplyTemplate(data: { name?: string }): string {
  return baseTemplate(`
    <div class="line"></div>
    <div class="center">
      <div class="title">Technical Issue Received</div>
      <div class="sub">We'll investigate and fix it</div>
    </div>
    <div class="greeting">Hi ${data.name || 'there'},</div>
    <div class="text">Thank you for reporting this technical issue. Our team will investigate and get back to you within 24-48 hours.</div>
    <div class="info-box">
      <p>We take technical issues seriously and will prioritize your report.</p>
    </div>
    <p style="color:#666666;font-size:14px;margin:0;">We appreciate your patience</p>
    <div class="footer">
      Trendlin
      <div class="small">This is an automated message. Please do not reply to this email.</div>
    </div>
  `, 'Technical Issue', 'Tech Support');
}

export function notificationEmailTemplate(data: {
  title: string;
  message: string;
  cta?: { text: string; url: string };
}): string {
  return baseTemplate(`
    <div class="line"></div>
    <div class="title" style="margin-bottom:16px;">${data.title}</div>
    <div class="info-box">
      ${data.message}
    </div>
    ${data.cta ? `<div style="height:16px;"></div><a href="${data.cta.url}" class="btn">${data.cta.text}</a>` : ''}
    <div class="footer">
      Trendlin
    </div>
  `, 'Notification', 'System');
}

// ============================================
// NEWSLETTER EMAIL TEMPLATES
// ============================================

export function newsletterVerificationTemplate(data: { firstName?: string; verificationUrl: string }): string {
  return baseTemplate(`
    <div class="line"></div>
    <div class="center">
      <div style="font-size: 48px; margin-bottom: 16px;">✉️</div>
      <div class="title">Verify Your Email</div>
      <div class="sub">Confirm your subscription to Trendlin</div>
    </div>
    <div class="greeting">Hello${data.firstName ? ` ${data.firstName}` : ''},</div>
    <div class="text">Thanks for subscribing to the Trendlin newsletter! Please confirm your email address by clicking the button below:</div>
    <div class="center" style="margin: 24px 0;">
      <a href="${data.verificationUrl}" class="btn">Confirm Email</a>
    </div>
    <div class="info-box">
      <p style="font-size: 13px; color: #666666;">Or copy and paste this link into your browser:</p>
      <p style="font-size: 13px; word-break: break-all; color: #000000; background: #f5f5f5; padding: 8px 12px; border-radius: 4px;">${data.verificationUrl}</p>
    </div>
    <p style="color: #999999; font-size: 13px;">This link will expire in 24 hours.</p>
    <div class="footer">
      Trendlin
      <div class="small">If you didn't sign up for Trendlin, you can safely ignore this email.</div>
    </div>
  `, 'Verify Email', 'Newsletter');
}

export function newsletterWelcomeTemplate(data: { firstName?: string; categories?: string[] }): string {
  const categoryList = data.categories && data.categories.length > 0 ? data.categories.join(', ') : 'all topics';
  
  return baseTemplate(`
    <div class="line"></div>
    <div class="center">
      <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
      <div class="title">Welcome to Trendlin!</div>
      <div class="sub">Your source for honest reviews & local insights</div>
    </div>
    <div class="greeting">Hello${data.firstName ? ` ${data.firstName}` : ''}!</div>
    <div class="text">Thank you for subscribing to the Trendlin newsletter. We're excited to have you on board!</div>
    <div class="info-box">
      <p><strong>📬 You'll receive updates on:</strong></p>
      <p style="margin-top: 4px; color: #555555;">${categoryList}</p>
    </div>
    <div class="text">Here's what you can expect:</div>
    <ul style="color: #333333; font-size: 15px; line-height: 1.8; padding-left: 20px;">
      <li>📝 Honest product reviews</li>
      <li>🛍️ Buying guides and recommendations</li>
      <li>🏙️ Local LA insights and events</li>
      <li>💡 Tips and trends</li>
    </ul>
    <div class="center" style="margin: 24px 0;">
      <a href="https://trendlin.com" class="btn">Start Exploring</a>
    </div>
    <div class="footer">
      Trendlin
      <div class="small">You can <a href="https://trendlin.com/preferences" style="color: #000000;">manage your preferences</a> or <a href="https://trendlin.com/unsubscribe" style="color: #000000;">unsubscribe</a> anytime.</div>
    </div>
  `, 'Welcome', 'Newsletter');
}

export function newsletterDigestTemplate(data: { 
  title?: string; 
  subtitle?: string; 
  content?: string;
  unsubscribeUrl?: string;
}): string {
  return baseTemplate(`
    <div class="line"></div>
    <div class="center">
      <div style="font-size: 36px; margin-bottom: 12px;">📰</div>
      <div class="title">${data.title || 'Trendlin Weekly Digest'}</div>
      <div class="sub">${data.subtitle || 'The latest reviews and insights'}</div>
    </div>
    ${data.content || ''}
    <div class="footer">
      Trendlin
      <div class="small">You received this email because you subscribed to our newsletter.</div>
      <div class="small"><a href="${data.unsubscribeUrl || 'https://trendlin.com/unsubscribe'}" style="color: #000000;">Unsubscribe</a> | <a href="https://trendlin.com/preferences" style="color: #000000;">Manage Preferences</a></div>
    </div>
  `, 'Newsletter', 'Weekly');
}

export function unsubscribeEmailTemplate(data: { firstName?: string; unsubscribeUrl: string }): string {
  return baseTemplate(`
    <div class="line"></div>
    <div class="center">
      <div style="font-size: 48px; margin-bottom: 16px;">📧</div>
      <div class="title">Unsubscribe from Trendlin</div>
      <div class="sub">We're sorry to see you go</div>
    </div>
    <div class="greeting">Hello${data.firstName ? ` ${data.firstName}` : ''},</div>
    <div class="text">We received a request to unsubscribe you from the Trendlin newsletter. If this was you, click the button below:</div>
    <div class="center" style="margin: 24px 0;">
      <a href="${data.unsubscribeUrl}" class="btn" style="background: linear-gradient(135deg, #dc2626, #b91c1c);">Unsubscribe</a>
    </div>
    <div class="info-box">
      <p style="font-size: 13px; color: #666666;">Or copy and paste this link into your browser:</p>
      <p style="font-size: 13px; word-break: break-all; color: #000000; background: #f5f5f5; padding: 8px 12px; border-radius: 4px;">${data.unsubscribeUrl}</p>
    </div>
    <p style="color: #999999; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
    <div class="footer">
      Trendlin
      <div class="small">This is an automated message. Please do not reply to this email.</div>
    </div>
  `, 'Unsubscribe', 'Newsletter');
}