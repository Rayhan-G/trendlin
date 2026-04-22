import { Resend } from 'resend';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { to, verificationLink } = req.body;
    
    // Check if email can actually be sent
    const canSendEmail = process.env.RESEND_API_KEY && 
                         process.env.RESEND_FROM_EMAIL && 
                         process.env.RESEND_API_KEY.startsWith('re_');
    
    if (!canSendEmail) {
      // Tell the truth - email not configured
      console.error('Email not configured properly');
      return res.status(500).json({ 
        success: false, 
        error: 'Email service not configured',
        message: 'System configuration error. Please try again later.'
      });
    }
    
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: [to],
      subject: 'Verify Your Newsletter Subscription',
      html: `
        <h1>Welcome to Trendlin!</h1>
        <p>Thanks for subscribing! Please click the link below to verify your email:</p>
        <a href="${verificationLink}" style="background: #06b6d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
        <p>Or copy this link: ${verificationLink}</p>
        <p>If you didn't request this, you can ignore this email.</p>
      `
    });
    
    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to send verification email',
        message: 'Unable to send email. Please try again.'
      });
    }
    
    console.log('✅ Verification email sent to:', to);
    return res.status(200).json({ 
      success: true, 
      message: 'Verification email sent! Please check your inbox.'
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: 'Something went wrong. Please try again.'
    });
  }
}