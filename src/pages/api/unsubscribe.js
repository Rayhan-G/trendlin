// pages/api/unsubscribe.js
import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  const { token } = req.query

  if (!token) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Unsubscribe</title></head>
      <body style="font-family: system-ui; text-align: center; padding: 50px;">
        <h1>Invalid Link</h1>
        <p>Missing unsubscribe token.</p>
        <a href="/">Return to Home</a>
      </body>
      </html>
    `)
  }

  try {
    // Find subscriber by unsubscribe_token
    const { data: subscriber, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('unsubscribe_token', token)
      .single()

    if (error || !subscriber) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Not Found</title></head>
        <body style="font-family: system-ui; text-align: center; padding: 50px;">
          <h1>Not Found</h1>
          <p>No subscription found with this token.</p>
          <a href="/">Return to Home</a>
        </body>
        </html>
      `)
    }

    // Update status to unsubscribed
    await supabase
      .from('newsletter_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('id', subscriber.id)

    // Return success page
    res.setHeader('Content-Type', 'text/html')
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribed</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: system-ui;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 20px;
          }
          .card {
            background: white;
            border-radius: 24px;
            padding: 48px 40px;
            max-width: 500px;
            text-align: center;
          }
          .icon { font-size: 64px; margin-bottom: 24px; }
          h1 { font-size: 28px; margin-bottom: 12px; color: #1e293b; }
          p { color: #64748b; margin-bottom: 32px; }
          .btn {
            display: inline-block;
            padding: 12px 28px;
            background: #06b6d4;
            color: white;
            text-decoration: none;
            border-radius: 40px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">🗑️</div>
          <h1>Successfully Unsubscribed</h1>
          <p>You have been removed from our newsletter. You won't receive any more emails from us.</p>
          <a href="/" class="btn">← Back to Home</a>
        </div>
      </body>
      </html>
    `)
  } catch (error) {
    console.error('Unsubscribe error:', error)
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Error</title></head>
      <body style="font-family: system-ui; text-align: center; padding: 50px;">
        <h1>Error</h1>
        <p>Something went wrong. Please try again.</p>
        <a href="/">Return to Home</a>
      </body>
      </html>
    `)
  }
}