// pages/api/verify-newsletter.js

import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  const { token, email } = req.query

  if (!token || !email) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invalid Verification Link</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            text-align: center;
            padding: 50px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .card {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          }
          h1 { color: #ef4444; margin-bottom: 20px; font-size: 28px; }
          p { color: #4b5563; line-height: 1.6; margin-bottom: 30px; }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #06b6d4, #0891b2);
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>❌ Invalid Link</h1>
          <p>The verification link is missing required parameters.</p>
          <a href="/" class="button">Return to Homepage</a>
        </div>
      </body>
      </html>
    `)
  }

  try {
    // Find the subscriber with matching token and email
    const { data: subscriber, error: findError } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', decodeURIComponent(email))
      .eq('verification_token', token)
      .single()

    if (findError || !subscriber) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid or Expired Link</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              text-align: center;
              padding: 50px 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              margin: 0;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .card {
              background: white;
              border-radius: 20px;
              padding: 40px;
              max-width: 500px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            }
            h1 { color: #ef4444; margin-bottom: 20px; font-size: 28px; }
            p { color: #4b5563; line-height: 1.6; margin-bottom: 30px; }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background: linear-gradient(135deg, #06b6d4, #0891b2);
              color: white;
              text-decoration: none;
              border-radius: 10px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>❌ Invalid Link</h1>
            <p>The verification link is invalid or has expired.</p>
            <a href="/" class="button">Return to Homepage</a>
          </div>
        </body>
        </html>
      `)
    }

    // Check if already verified
    if (subscriber.status === 'verified') {
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Already Verified</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              text-align: center;
              padding: 50px 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              margin: 0;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .card {
              background: white;
              border-radius: 20px;
              padding: 40px;
              max-width: 500px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            }
            h1 { color: #10b981; margin-bottom: 20px; font-size: 28px; }
            p { color: #4b5563; line-height: 1.6; margin-bottom: 30px; }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background: linear-gradient(135deg, #06b6d4, #0891b2);
              color: white;
              text-decoration: none;
              border-radius: 10px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>✅ Already Verified</h1>
            <p>This email has already been verified. Thank you for being a subscriber!</p>
            <a href="/" class="button">Continue to Website →</a>
          </div>
        </body>
        </html>
      `)
    }

    // Update subscriber status to verified
    const { error: updateError } = await supabase
      .from('newsletter_subscribers')
      .update({
        status: 'verified',
        verified_at: new Date().toISOString(),
        verification_token: null // Clear token after verification
      })
      .eq('email', decodeURIComponent(email))

    if (updateError) throw updateError

    // Get category names for success message
    const categoryNames = {
      health: 'Health & Wellness',
      entertainment: 'Entertainment',
      growth: 'Personal Growth',
      lifestyle: 'Lifestyle',
      tech: 'Technology',
      wealth: 'Wealth',
      world: 'World News'
    }

    const categoryList = subscriber.categories.map(cat => categoryNames[cat] || cat).join(', ')

    // Return success page
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Successfully Verified!</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            text-align: center;
            padding: 50px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .card {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            animation: fadeIn 0.5s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .checkmark {
            width: 80px;
            height: 80px;
            background: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            animation: scaleIn 0.3s ease-out 0.2s both;
          }
          @keyframes scaleIn {
            from { transform: scale(0); }
            to { transform: scale(1); }
          }
          .checkmark svg {
            width: 50px;
            height: 50px;
            color: white;
          }
          h1 { color: #1f2937; margin-bottom: 10px; font-size: 28px; }
          .subtitle { color: #6b7280; margin-bottom: 20px; font-size: 16px; }
          .info-box {
            background: #f3f4f6;
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
            text-align: left;
          }
          .info-label {
            font-size: 12px;
            text-transform: uppercase;
            color: #6b7280;
            margin-bottom: 5px;
          }
          .info-value {
            font-size: 16px;
            color: #1f2937;
            font-weight: 500;
            margin-bottom: 15px;
          }
          .category-badge {
            display: inline-block;
            padding: 4px 12px;
            background: #e5e7eb;
            border-radius: 20px;
            font-size: 13px;
            margin: 4px 4px 0 0;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #06b6d4, #0891b2);
            color: white;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            margin-top: 10px;
            transition: transform 0.2s ease;
          }
          .button:hover {
            transform: translateY(-2px);
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="checkmark">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1>Successfully Verified!</h1>
          <p class="subtitle">Your email has been confirmed</p>
          
          <div class="info-box">
            <div class="info-label">📧 Email</div>
            <div class="info-value">${decodeURIComponent(email)}</div>
            
            <div class="info-label">📚 Categories</div>
            <div class="info-value">
              ${subscriber.categories.map(cat => `<span class="category-badge">${categoryNames[cat] || cat}</span>`).join('')}
            </div>
          </div>
          
          <p style="color: #4b5563; margin-bottom: 20px;">
            You will now start receiving our newsletter with the categories you selected.
          </p>
          
          <a href="/" class="button">Continue to Website →</a>
        </div>
      </body>
      </html>
    `)

  } catch (error) {
    console.error('Verification error:', error)
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Verification Error</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            text-align: center;
            padding: 50px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .card {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          }
          h1 { color: #ef4444; margin-bottom: 20px; font-size: 28px; }
          p { color: #4b5563; line-height: 1.6; margin-bottom: 30px; }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #06b6d4, #0891b2);
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>❌ Verification Error</h1>
          <p>Something went wrong. Please try again or contact support.</p>
          <a href="/" class="button">Return to Homepage</a>
        </div>
      </body>
      </html>
    `)
  }
}