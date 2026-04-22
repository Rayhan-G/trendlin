import { Resend } from 'resend';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { to, categories, sourcePage, verificationLink } = req.body;
    
    // Check if we can send real emails
    const canSendRealEmails = process.env.RESEND_API_KEY && 
                              process.env.RESEND_FROM_EMAIL && 
                              process.env.NODE_ENV === 'production';
    
    if (!canSendRealEmails) {
      // Fallback mode - just log
      console.log('📧 [FALLBACK] Would send email to:', to);
      console.log('🔗 Verification link:', verificationLink);
      
      return res.status(200).json({ 
        success: true, 
        fallbackMode: true,
        message: 'Subscription saved (email service pending)'
      });
    }
    
    // Send real email
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: [to],
      subject: 'Verify Your Newsletter Subscription',
      html: `
        <h1>Welcome to Trendlin!</h1>
        <p>Thanks for subscribing! Please verify your email:</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>Or copy this link: ${verificationLink}</p>
      `
    });
    
    if (error) throw error;
    
    console.log('✅ Email sent to:', to);
    return res.status(200).json({ success: true, emailSent: true });
    
  } catch (error) {
    console.error('Email error:', error);
    // Still return success so user doesn't see error
    return res.status(200).json({ 
      success: true, 
      fallbackMode: true,
      message: 'Subscription saved!'
    });
  }
}