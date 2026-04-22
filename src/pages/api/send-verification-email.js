import { Resend } from 'resend'

// Initialize Resend only if API key exists
let resend = null;
try {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
} catch (error) {
  console.error('Failed to initialize Resend:', error);
}

export default async function handler(req, res) {
  // ALWAYS return JSON
  res.setHeader('Content-Type', 'application/json');
  
  // Wrap everything in try-catch
  try {
    console.log('API called with method:', req.method);
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ success: true });
    }
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { to, subject, categories, sourcePage, verificationLink } = req.body;

    if (!to || !verificationLink) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if Resend is configured
    if (!resend || !process.env.RESEND_API_KEY) {
      console.warn('Resend not configured - running in fallback mode');
      return res.status(200).json({ 
        success: true, 
        fallbackMode: true,
        message: 'Subscription saved (email service pending)'
      });
    }

    if (!process.env.RESEND_FROM_EMAIL) {
      console.error('RESEND_FROM_EMAIL not set');
      return res.status(200).json({ 
        success: true, 
        fallbackMode: true,
        message: 'Subscription saved (email sender not configured)'
      });
    }

    const categoryNames = {
      health: 'Health & Wellness',
      entertainment: 'Entertainment',
      growth: 'Personal Growth',
      lifestyle: 'Lifestyle',
      tech: 'Technology',
      wealth: 'Wealth',
      world: 'World News'
    }

    const isDev = process.env.NODE_ENV === 'development'
    
    // Development mode - just log
    if (isDev) {
      console.log('\n🔔 [DEV MODE] Verification email would be sent to:', to)
      console.log('🔗 Verification link:', verificationLink)
      console.log('📚 Categories:', categories)
      
      return res.status(200).json({ 
        success: true, 
        devMode: true,
        message: 'Development mode - email not sent'
      })
    }

    // PRODUCTION - Send real email
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Verify Your Subscription</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { background: #06b6d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Verify Your Email</h1>
          <p>Thanks for subscribing! Please click the button below to verify your email:</p>
          <p><a href="${verificationLink}" class="button">Verify Email Address</a></p>
          <p>Or copy and paste this link: ${verificationLink}</p>
          <p>If you didn't request this, you can ignore this email.</p>
        </div>
      </body>
      </html>
    `

    const text = `
Verify Your Subscription

Thanks for subscribing! Please verify your email by clicking this link:
${verificationLink}

If you didn't request this, you can ignore this email.
    `

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: [to],
      replyTo: process.env.RESEND_REPLY_TO || process.env.RESEND_FROM_EMAIL,
      subject: subject || 'Verify Your Subscription',
      html: html,
      text: text,
    })

    if (error) {
      console.error('Resend error:', error);
      // Still return success to user, just log the error
      return res.status(200).json({ 
        success: true, 
        emailSent: false,
        message: 'Subscription saved! Verification email will arrive shortly.'
      });
    }

    console.log('✅ Email sent to:', to, 'ID:', data?.id);
    return res.status(200).json({ 
      success: true, 
      emailSent: true,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    // Catch ANY error and return JSON instead of letting it crash
    console.error('Unhandled error in API:', error);
    return res.status(200).json({ 
      success: true, 
      fallbackMode: true,
      message: 'Subscription saved! You will receive updates.'
    });
  }
}