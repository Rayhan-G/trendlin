// ============================================
// EMAIL TEMPLATES - Trendlin (Professional)
// ============================================

function baseTemplate(content, label, tag) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Trendlin</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;width:100%;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center" style="font-size:0;line-height:0;">
        <!--[if (gte mso 9)|(IE)]>
        <table width="560" align="center" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
        <![endif]-->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e0e0e0;border-radius:8px;margin:0 auto;">
          <!-- HEADER -->
          <tr>
            <td style="padding:16px 24px;border-bottom:1px solid #e0e0e0;background:#fafafa;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:13px;font-weight:600;color:#1a1a1a;letter-spacing:0.02em;">${label}</td>
                  <td align="right" style="font-size:11px;font-weight:500;padding:3px 14px;background:#e8e8e8;border-radius:20px;color:#1a1a1a;">${tag}</td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- BODY -->
          <tr>
            <td style="padding:40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:0;">${content}</td></tr>
              </table>
            </td>
          </tr>
        </table>
        <!--[if (gte mso 9)|(IE)]>
            </td>
          </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ----- 1. ADMIN NOTIFICATION -----
export function contactEmailTemplate(data) {
  return baseTemplate(`
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="width:40px;height:3px;background:#1a1a1a;border-radius:2px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="height:24px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="font-size:22px;font-weight:600;color:#1a1a1a;padding-bottom:4px;">New Contact Message</td></tr>
      <tr><td style="font-size:14px;color:#666666;padding-bottom:24px;">${data.timestamp || 'New inquiry received'}</td></tr>
      
      <tr><td style="font-size:12px;font-weight:600;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.04em;padding-bottom:6px;">Name</td></tr>
      <tr><td style="background:#f7f7f7;padding:12px 16px;border:1px solid #e0e0e0;border-radius:6px;font-size:15px;color:#1a1a1a;display:block;">${data.name}</td></tr>
      <tr><td style="height:16px;font-size:0;line-height:0;">&nbsp;</td></tr>
      
      <tr><td style="font-size:12px;font-weight:600;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.04em;padding-bottom:6px;">Email</td></tr>
      <tr><td style="background:#f7f7f7;padding:12px 16px;border:1px solid #e0e0e0;border-radius:6px;font-size:15px;color:#1a1a1a;display:block;"><a href="mailto:${data.email}" style="color:#1a1a1a;text-decoration:underline;">${data.email}</a></td></tr>
      <tr><td style="height:16px;font-size:0;line-height:0;">&nbsp;</td></tr>
      
      ${data.phone ? `
      <tr><td style="font-size:12px;font-weight:600;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.04em;padding-bottom:6px;">Phone</td></tr>
      <tr><td style="background:#f7f7f7;padding:12px 16px;border:1px solid #e0e0e0;border-radius:6px;font-size:15px;color:#1a1a1a;display:block;">${data.phone}</td></tr>
      <tr><td style="height:16px;font-size:0;line-height:0;">&nbsp;</td></tr>
      ` : ''}
      
      <tr><td style="font-size:12px;font-weight:600;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.04em;padding-bottom:6px;">Subject</td></tr>
      <tr><td style="background:#f7f7f7;padding:12px 16px;border:1px solid #e0e0e0;border-radius:6px;font-size:15px;color:#1a1a1a;display:block;">${data.subject}</td></tr>
      <tr><td style="height:16px;font-size:0;line-height:0;">&nbsp;</td></tr>
      
      <tr><td style="font-size:12px;font-weight:600;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.04em;padding-bottom:6px;">Message</td></tr>
      <tr><td style="background:#f7f7f7;padding:16px;border:1px solid #e0e0e0;border-radius:6px;font-size:15px;color:#1a1a1a;white-space:pre-wrap;display:block;">${data.message}</td></tr>
      
      <tr><td style="height:32px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="border-top:1px solid #e0e0e0;padding-top:20px;text-align:center;font-size:13px;color:#999999;">
        <span style="font-weight:500;color:#1a1a1a;">Trendlin</span><br>
        <span style="font-size:11px;color:#bbbbbb;">This is an automated message. Please do not reply to this email.</span>
      </td></tr>
    </table>
  `, 'New Contact', 'Admin');
}

// ----- 2. GENERAL AUTO-REPLY -----
export function autoReplyTemplate(data) {
  return baseTemplate(`
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="width:40px;height:3px;background:#1a1a1a;border-radius:2px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="height:24px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="text-align:center;padding-bottom:24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="font-size:24px;font-weight:600;color:#1a1a1a;padding-bottom:4px;">We've received your message</td></tr>
          <tr><td style="font-size:15px;color:#666666;">We'll respond within 24 hours</td></tr>
        </table>
      </td></tr>
      
      <tr><td style="font-size:16px;font-weight:500;color:#1a1a1a;padding-bottom:8px;">Dear ${data.name},</td></tr>
      <tr><td style="font-size:15px;color:#333333;line-height:1.7;padding-bottom:16px;">Thank you for contacting Trendlin. We have received your inquiry and will respond as soon as possible.</td></tr>
      
      <tr><td style="background:#f7f7f7;padding:16px;border:1px solid #e0e0e0;border-radius:6px;display:block;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="font-size:14px;color:#333333;"><strong style="color:#1a1a1a;">Subject:</strong> ${data.subject}</td></tr>
          <tr><td style="font-size:14px;color:#333333;padding-top:4px;"><strong style="color:#1a1a1a;">Message:</strong> ${data.message.substring(0, 160)}${data.message.length > 160 ? '...' : ''}</td></tr>
        </table>
      </td></tr>
      <tr><td style="height:16px;font-size:0;line-height:0;">&nbsp;</td></tr>
      
      <tr><td style="font-size:14px;color:#666666;">In the meantime, explore our latest content at <a href="#" style="color:#1a1a1a;text-decoration:underline;">Trendlin</a>.</td></tr>
      
      <tr><td style="height:32px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="border-top:1px solid #e0e0e0;padding-top:20px;text-align:center;font-size:13px;color:#999999;">
        <span style="font-weight:500;color:#1a1a1a;">Trendlin</span><br>
        <span style="font-size:11px;color:#bbbbbb;">This is an automated message. Please do not reply to this email.</span>
      </td></tr>
    </table>
  `, 'General Inquiry', 'Auto-reply');
}

// ----- 3. PRIVACY AUTO-REPLY -----
export function privacyAutoReplyTemplate(data) {
  return baseTemplate(`
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="width:40px;height:3px;background:#1a1a1a;border-radius:2px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="height:24px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="text-align:center;padding-bottom:24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="font-size:24px;font-weight:600;color:#1a1a1a;padding-bottom:4px;">Privacy Request Received</td></tr>
          <tr><td style="font-size:15px;color:#666666;">We take your privacy seriously</td></tr>
        </table>
      </td></tr>
      
      <tr><td style="font-size:16px;font-weight:500;color:#1a1a1a;padding-bottom:8px;">Dear ${data.name || 'there'},</td></tr>
      <tr><td style="font-size:15px;color:#333333;line-height:1.7;padding-bottom:16px;">Thank you for contacting our Privacy Team. We have received your privacy-related inquiry and will respond within 48 hours.</td></tr>
      
      <tr><td style="background:#f7f7f7;padding:16px;border:1px solid #e0e0e0;border-radius:6px;border-left:3px solid #1a1a1a;display:block;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="font-size:14px;color:#333333;">Your privacy is important to us. Your request has been logged and will be handled with care.</td></tr>
        </table>
      </td></tr>
      <tr><td style="height:16px;font-size:0;line-height:0;">&nbsp;</td></tr>
      
      <tr><td style="font-size:14px;color:#666666;">For more information, please review our <a href="#" style="color:#1a1a1a;text-decoration:underline;">Privacy Policy</a>.</td></tr>
      
      <tr><td style="height:32px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="border-top:1px solid #e0e0e0;padding-top:20px;text-align:center;font-size:13px;color:#999999;">
        <span style="font-weight:500;color:#1a1a1a;">Trendlin</span><br>
        <span style="font-size:11px;color:#bbbbbb;">This is an automated message. Please do not reply to this email.</span>
      </td></tr>
    </table>
  `, 'Privacy Inquiry', 'Privacy Team');
}

// ----- 4. LEGAL AUTO-REPLY -----
export function legalAutoReplyTemplate(data) {
  return baseTemplate(`
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="width:40px;height:3px;background:#1a1a1a;border-radius:2px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="height:24px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="text-align:center;padding-bottom:24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="font-size:24px;font-weight:600;color:#1a1a1a;padding-bottom:4px;">Legal Inquiry Received</td></tr>
          <tr><td style="font-size:15px;color:#666666;">Forwarded to our legal department</td></tr>
        </table>
      </td></tr>
      
      <tr><td style="font-size:16px;font-weight:500;color:#1a1a1a;padding-bottom:8px;">Dear ${data.name || 'there'},</td></tr>
      <tr><td style="font-size:15px;color:#333333;line-height:1.7;padding-bottom:16px;">Thank you for contacting our Legal Team. We have received your legal inquiry and will respond within 48 hours.</td></tr>
      
      <tr><td style="background:#f7f7f7;padding:16px;border:1px solid #e0e0e0;border-radius:6px;border-left:3px solid #1a1a1a;display:block;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="font-size:14px;color:#333333;">Your message has been forwarded to our legal department for review.</td></tr>
        </table>
      </td></tr>
      <tr><td style="height:16px;font-size:0;line-height:0;">&nbsp;</td></tr>
      
      <tr><td style="font-size:14px;color:#666666;">For reference, please review our <a href="#" style="color:#1a1a1a;text-decoration:underline;">Terms of Service</a>.</td></tr>
      
      <tr><td style="height:32px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="border-top:1px solid #e0e0e0;padding-top:20px;text-align:center;font-size:13px;color:#999999;">
        <span style="font-weight:500;color:#1a1a1a;">Trendlin</span><br>
        <span style="font-size:11px;color:#bbbbbb;">This is an automated message. Please do not reply to this email.</span>
      </td></tr>
    </table>
  `, 'Legal Inquiry', 'Legal Team');
}

// ----- 5. COOKIE AUTO-REPLY -----
export function cookieAutoReplyTemplate(data) {
  return baseTemplate(`
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="width:40px;height:3px;background:#1a1a1a;border-radius:2px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="height:24px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="text-align:center;padding-bottom:24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="font-size:24px;font-weight:600;color:#1a1a1a;padding-bottom:4px;">Cookie Policy Question</td></tr>
          <tr><td style="font-size:15px;color:#666666;">We'll help you understand</td></tr>
        </table>
      </td></tr>
      
      <tr><td style="font-size:16px;font-weight:500;color:#1a1a1a;padding-bottom:8px;">Dear ${data.name || 'there'},</td></tr>
      <tr><td style="font-size:15px;color:#333333;line-height:1.7;padding-bottom:16px;">Thank you for your question about our Cookie Policy. We will provide a detailed response within 24-48 hours.</td></tr>
      
      <tr><td style="background:#f7f7f7;padding:16px;border:1px solid #e0e0e0;border-radius:6px;border-left:3px solid #1a1a1a;display:block;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="font-size:14px;color:#333333;">You can manage cookie preferences in your browser settings at any time.</td></tr>
        </table>
      </td></tr>
      <tr><td style="height:16px;font-size:0;line-height:0;">&nbsp;</td></tr>
      
      <tr><td style="font-size:14px;color:#666666;">For more information, please review our <a href="#" style="color:#1a1a1a;text-decoration:underline;">Cookie Policy</a>.</td></tr>
      
      <tr><td style="height:32px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="border-top:1px solid #e0e0e0;padding-top:20px;text-align:center;font-size:13px;color:#999999;">
        <span style="font-weight:500;color:#1a1a1a;">Trendlin</span><br>
        <span style="font-size:11px;color:#bbbbbb;">This is an automated message. Please do not reply to this email.</span>
      </td></tr>
    </table>
  `, 'Cookie Policy', 'Support Team');
}

// ----- 6. TERMS AUTO-REPLY -----
export function termsAutoReplyTemplate(data) {
  return baseTemplate(`
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="width:40px;height:3px;background:#1a1a1a;border-radius:2px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="height:24px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="text-align:center;padding-bottom:24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="font-size:24px;font-weight:600;color:#1a1a1a;padding-bottom:4px;">Terms of Service Question</td></tr>
          <tr><td style="font-size:15px;color:#666666;">We'll clarify our terms</td></tr>
        </table>
      </td></tr>
      
      <tr><td style="font-size:16px;font-weight:500;color:#1a1a1a;padding-bottom:8px;">Dear ${data.name || 'there'},</td></tr>
      <tr><td style="font-size:15px;color:#333333;line-height:1.7;padding-bottom:16px;">Thank you for your question about our Terms of Service. We will respond within 24-48 hours.</td></tr>
      
      <tr><td style="background:#f7f7f7;padding:16px;border:1px solid #e0e0e0;border-radius:6px;border-left:3px solid #1a1a1a;display:block;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="font-size:14px;color:#333333;">Our Terms of Service outline the rules for using our platform.</td></tr>
        </table>
      </td></tr>
      <tr><td style="height:16px;font-size:0;line-height:0;">&nbsp;</td></tr>
      
      <tr><td style="font-size:14px;color:#666666;">Please review our <a href="#" style="color:#1a1a1a;text-decoration:underline;">Terms of Service</a> for reference.</td></tr>
      
      <tr><td style="height:32px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="border-top:1px solid #e0e0e0;padding-top:20px;text-align:center;font-size:13px;color:#999999;">
        <span style="font-weight:500;color:#1a1a1a;">Trendlin</span><br>
        <span style="font-size:11px;color:#bbbbbb;">This is an automated message. Please do not reply to this email.</span>
      </td></tr>
    </table>
  `, 'Terms of Service', 'Legal Team');
}

// ----- 7. PARTNERSHIP AUTO-REPLY -----
export function partnershipAutoReplyTemplate(data) {
  return baseTemplate(`
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="width:40px;height:3px;background:#1a1a1a;border-radius:2px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="height:24px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="text-align:center;padding-bottom:24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="font-size:24px;font-weight:600;color:#1a1a1a;padding-bottom:4px;">Partnership Opportunity</td></tr>
          <tr><td style="font-size:15px;color:#666666;">Let's explore working together</td></tr>
        </table>
      </td></tr>
      
      <tr><td style="font-size:16px;font-weight:500;color:#1a1a1a;padding-bottom:8px;">Dear ${data.name || 'there'},</td></tr>
      <tr><td style="font-size:15px;color:#333333;line-height:1.7;padding-bottom:16px;">Thank you for your interest in partnering with Trendlin. We will review your inquiry within 24-48 hours.</td></tr>
      
      <tr><td style="background:#f7f7f7;padding:16px;border:1px solid #e0e0e0;border-radius:6px;border-left:3px solid #1a1a1a;display:block;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="font-size:14px;color:#333333;">Our partnerships team will reach out to discuss potential collaboration.</td></tr>
        </table>
      </td></tr>
      <tr><td style="height:16px;font-size:0;line-height:0;">&nbsp;</td></tr>
      
      <tr><td style="font-size:14px;color:#666666;">We look forward to exploring how we might work together.</td></tr>
      
      <tr><td style="height:32px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="border-top:1px solid #e0e0e0;padding-top:20px;text-align:center;font-size:13px;color:#999999;">
        <span style="font-weight:500;color:#1a1a1a;">Trendlin</span><br>
        <span style="font-size:11px;color:#bbbbbb;">This is an automated message. Please do not reply to this email.</span>
      </td></tr>
    </table>
  `, 'Partnership', 'Partnership Team');
}

// ----- 8. FEEDBACK AUTO-REPLY -----
export function feedbackAutoReplyTemplate(data) {
  return baseTemplate(`
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="width:40px;height:3px;background:#1a1a1a;border-radius:2px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="height:24px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="text-align:center;padding-bottom:24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="font-size:24px;font-weight:600;color:#1a1a1a;padding-bottom:4px;">Feedback Received</td></tr>
          <tr><td style="font-size:15px;color:#666666;">We value your input</td></tr>
        </table>
      </td></tr>
      
      <tr><td style="font-size:16px;font-weight:500;color:#1a1a1a;padding-bottom:8px;">Dear ${data.name || 'there'},</td></tr>
      <tr><td style="font-size:15px;color:#333333;line-height:1.7;padding-bottom:16px;">Thank you for sharing your feedback with us. We value your input and will review it carefully.</td></tr>
      
      <tr><td style="background:#f7f7f7;padding:16px;border:1px solid #e0e0e0;border-radius:6px;border-left:3px solid #1a1a1a;display:block;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="font-size:14px;color:#333333;">Your feedback helps us improve Trendlin for everyone.</td></tr>
        </table>
      </td></tr>
      <tr><td style="height:16px;font-size:0;line-height:0;">&nbsp;</td></tr>
      
      <tr><td style="font-size:14px;color:#666666;">We may reach out if we need additional details.</td></tr>
      
      <tr><td style="height:32px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="border-top:1px solid #e0e0e0;padding-top:20px;text-align:center;font-size:13px;color:#999999;">
        <span style="font-weight:500;color:#1a1a1a;">Trendlin</span><br>
        <span style="font-size:11px;color:#bbbbbb;">This is an automated message. Please do not reply to this email.</span>
      </td></tr>
    </table>
  `, 'Feedback', 'Feedback Team');
}

// ----- 9. TECHNICAL AUTO-REPLY -----
export function technicalAutoReplyTemplate(data) {
  return baseTemplate(`
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="width:40px;height:3px;background:#1a1a1a;border-radius:2px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="height:24px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="text-align:center;padding-bottom:24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="font-size:24px;font-weight:600;color:#1a1a1a;padding-bottom:4px;">Technical Issue Received</td></tr>
          <tr><td style="font-size:15px;color:#666666;">We'll investigate and resolve it</td></tr>
        </table>
      </td></tr>
      
      <tr><td style="font-size:16px;font-weight:500;color:#1a1a1a;padding-bottom:8px;">Dear ${data.name || 'there'},</td></tr>
      <tr><td style="font-size:15px;color:#333333;line-height:1.7;padding-bottom:16px;">Thank you for reporting this technical issue. Our team will investigate and get back to you within 24-48 hours.</td></tr>
      
      <tr><td style="background:#f7f7f7;padding:16px;border:1px solid #e0e0e0;border-radius:6px;border-left:3px solid #1a1a1a;display:block;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="font-size:14px;color:#333333;">We take technical issues seriously and will prioritize your report.</td></tr>
        </table>
      </td></tr>
      <tr><td style="height:16px;font-size:0;line-height:0;">&nbsp;</td></tr>
      
      <tr><td style="font-size:14px;color:#666666;">We appreciate your patience while we work on a resolution.</td></tr>
      
      <tr><td style="height:32px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="border-top:1px solid #e0e0e0;padding-top:20px;text-align:center;font-size:13px;color:#999999;">
        <span style="font-weight:500;color:#1a1a1a;">Trendlin</span><br>
        <span style="font-size:11px;color:#bbbbbb;">This is an automated message. Please do not reply to this email.</span>
      </td></tr>
    </table>
  `, 'Technical Issue', 'Tech Support');
}

// ----- 10. NOTIFICATION -----
export function notificationEmailTemplate(data) {
  return baseTemplate(`
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="width:40px;height:3px;background:#1a1a1a;border-radius:2px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="height:24px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="font-size:22px;font-weight:600;color:#1a1a1a;padding-bottom:16px;">${data.title}</td></tr>
      
      <tr><td style="background:#f7f7f7;padding:16px;border:1px solid #e0e0e0;border-radius:6px;font-size:15px;color:#333333;line-height:1.7;display:block;">
        ${data.message}
      </td></tr>
      
      ${data.cta ? `
      <tr><td style="height:16px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td><a href="${data.cta.url}" style="display:inline-block;background:#1a1a1a;color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:500;">${data.cta.text}</a></td></tr>
      ` : ''}
      
      <tr><td style="height:32px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="border-top:1px solid #e0e0e0;padding-top:20px;text-align:center;font-size:13px;color:#999999;">
        <span style="font-weight:500;color:#1a1a1a;">Trendlin</span><br>
        <span style="font-size:11px;color:#bbbbbb;">This is an automated message. Please do not reply to this email.</span>
      </td></tr>
    </table>
  `, 'Notification', 'System');
}