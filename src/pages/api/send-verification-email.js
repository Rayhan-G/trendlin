// pages/api/send-verification-email.js

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { to, subject, categories, sourcePage, verificationLink } = req.body

  if (!to || !verificationLink) {
    return res.status(400).json({ error: 'Missing required fields' })
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
    console.log('📍 Source:', sourcePage)
    console.log('💡 Tip: Copy the link above and paste in browser to test verification\n')
    
    return res.status(200).json({ 
      success: true, 
      devMode: true,
      message: 'Development mode - email not sent',
      verificationLink: verificationLink
    })
  }

  // PRODUCTION - Send real email
  try {
    // Use environment variable for FROM email (must be verified in Resend)
    const fromEmail = process.env.RESEND_FROM_EMAIL
    const replyToEmail = process.env.RESEND_REPLY_TO || fromEmail

    if (!fromEmail) {
      console.error('RESEND_FROM_EMAIL not set in environment variables')
      return res.status(500).json({ error: 'Email configuration error' })
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Verify Your Subscription</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f6f9fc;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .card {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          }
          .header {
            background: linear-gradient(135deg, #06b6d4, #0891b2);
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .header p {
            color: rgba(255,255,255,0.9);
            margin: 10px 0 0;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #1f2937;
          }
          .message {
            color: #4b5563;
            margin-bottom: 25px;
            font-size: 16px;
          }
          .info-box {
            background: #f9fafb;
            padding: 20px;
            border-radius: 12px;
            margin: 25px 0;
          }
          .info-row {
            margin-bottom: 15px;
          }
          .info-row:last-child {
            margin-bottom: 0;
          }
          .info-label {
            font-weight: 600;
            color: #6b7280;
            margin-bottom: 5px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .info-value {
            color: #1f2937;
            font-size: 16px;
          }
          .category-badge {
            display: inline-block;
            padding: 4px 12px;
            background: #e5e7eb;
            border-radius: 20px;
            font-size: 13px;
            margin: 4px 4px 4px 0;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #06b6d4, #0891b2);
            color: white;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s ease;
          }
          .button:hover {
            transform: translateY(-2px);
          }
          .fallback-link {
            background: #f3f4f6;
            padding: 12px;
            border-radius: 8px;
            font-size: 12px;
            word-break: break-all;
            margin: 20px 0;
            color: #6b7280;
          }
          .footer {
            text-align: center;
            padding: 30px;
            font-size: 12px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
            background: #f9fafb;
          }
          .footer a {
            color: #06b6d4;
            text-decoration: none;
          }
          @media (max-width: 600px) {
            .header { padding: 30px 20px; }
            .content { padding: 25px 20px; }
            .button { padding: 12px 24px; font-size: 14px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header">
              <h1>✨ Verify Your Email</h1>
              <p>Confirm your subscription to start receiving updates</p>
            </div>
            <div class="content">
              <div class="greeting">Hello!</div>
              
              <p class="message">Thanks for subscribing to our newsletter! Please verify your email address to start receiving the latest updates.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <div class="info-label">📧 Email Address</div>
                  <div class="info-value">${to}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">📚 Categories</div>
                  <div class="info-value">
                    ${categories.map(cat => `<span class="category-badge">${categoryNames[cat] || cat}</span>`).join('')}
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-label">📍 Source</div>
                  <div class="info-value">${sourcePage === 'home' ? 'Home Page' : `${categoryNames[sourcePage]} Category`}</div>
                </div>
              </div>
              
              <div class="button-container">
                <a href="${verificationLink}" class="button">✓ Verify Email Address</a>
              </div>
              
              <p style="font-size: 13px; color: #6b7280; text-align: center;">If the button doesn't work, copy and paste this link:</p>
              <div class="fallback-link">
                ${verificationLink}
              </div>
              
              <p style="font-size: 13px; color: #6b7280; margin-top: 20px;">If you didn't request this subscription, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>You're receiving this because someone subscribed with this address.</p>
              <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}">Visit Website</a> | <a href="${process.env.NEXT_PUBLIC_SITE_URL}/privacy">Privacy Policy</a></p>
              <p>&copy; ${new Date().getFullYear()} Trendlin. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
Verify Your Subscription

Hello!

Thanks for subscribing to our newsletter! Please verify your email address to start receiving updates.

Email: ${to}
Categories: ${categories.map(cat => categoryNames[cat] || cat).join(', ')}
Source: ${sourcePage === 'home' ? 'Home Page' : `${categoryNames[sourcePage]} Category`}

Verify your email by clicking this link:
${verificationLink}

If you didn't request this subscription, you can safely ignore this email.

---
You're receiving this because someone subscribed with this address.
Visit our website: ${process.env.NEXT_PUBLIC_SITE_URL}
    `

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      replyTo: replyToEmail,
      subject: subject || 'Verify Your Subscription to Trendlin',
      html: html,
      text: text,
    })

    if (error) {
      console.error('Resend error:', error)
      return res.status(500).json({ error: error.message })
    }

    console.log('✅ Verification email sent to:', to, 'ID:', data?.id)

    return res.status(200).json({ 
      success: true, 
      id: data?.id,
      message: 'Verification email sent successfully'
    })

  } catch (error) {
    console.error('Error sending email:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}