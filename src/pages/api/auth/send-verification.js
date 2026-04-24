// pages/api/auth/send-verification.js
import { Resend } from 'resend'

// Initialize Resend only if API key exists
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// In-memory store for verification codes
// In production, use Redis or database
const verificationStore = new Map()

// Clean up expired codes periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of verificationStore.entries()) {
    if (value.expiresAt < now) {
      verificationStore.delete(key)
    }
  }
}, 60 * 60 * 1000) // Clean every hour

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Valid email address required' })
  }

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const verificationId = Math.random().toString(36).substring(2, 15) + Date.now().toString()

  // Store code with 10-minute expiry
  verificationStore.set(verificationId, {
    email: email.toLowerCase(),
    code,
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
  })

  // Development mode - log code and return success
  const isDev = process.env.NODE_ENV === 'development'
  
  if (isDev || !resend) {
    console.log(`\n=========================================`)
    console.log(`🔐 VERIFICATION CODE FOR ${email}`)
    console.log(`📱 CODE: ${code}`)
    console.log(`⏰ Expires in 10 minutes`)
    console.log(`=========================================\n`)
    
    return res.status(200).json({ 
      success: true, 
      verificationId,
      message: 'Verification code sent (development mode)',
      devCode: isDev ? code : undefined // Only send in dev
    })
  }

  // Production mode - send via Resend
  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com'
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Verify your email address',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { font-size: 48px; }
            .code { background: #f0f0f0; padding: 20px; text-align: center; font-size: 36px; font-weight: bold; letter-spacing: 8px; border-radius: 12px; margin: 20px 0; font-family: monospace; }
            .button { background: #06b6d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; border-top: 1px solid #eee; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">📬</div>
              <h2>Verify Your Email Address</h2>
            </div>
            
            <p>Hello,</p>
            <p>Thank you for signing up! Please use the verification code below to complete your registration:</p>
            
            <div class="code">${code}</div>
            
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <p>If you didn't request this, please ignore this email.</p>
            
            <div class="footer">
              <p>Stay informed, stay ahead.</p>
              <p>&copy; ${new Date().getFullYear()} Your App Name. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      throw new Error('Failed to send email')
    }

    return res.status(200).json({ 
      success: true, 
      verificationId,
      message: 'Verification code sent successfully' 
    })
    
  } catch (error) {
    console.error('Error sending email:', error)
    // Clean up the stored code if email failed
    verificationStore.delete(verificationId)
    
    return res.status(500).json({ 
      error: 'Unable to send verification email. Please try again.' 
    })
  }
}