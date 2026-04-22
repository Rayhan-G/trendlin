// pages/api/unsubscribe.js
import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  const { token } = req.query

  if (!token) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Unsubscribe</title><meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: system-ui; text-align: center; padding: 50px; background: linear-gradient(135deg, #0f172a, #1e1b4b); min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; }
        .card { background: white; border-radius: 24px; padding: 40px; max-width: 500px; }
        h1 { color: #ef4444; }
        .btn { display: inline-block; padding: 12px 24px; background: #06b6d4; color: white; text-decoration: none; border-radius: 40px; }
      </style>
      </head>
      <body>
        <div class="card"><h1>Invalid Link</h1><a href="/" class="btn">Home</a></div>
      </body>
      </html>
    `)
  }

  try {
    const { data: subscriber } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('unsubscribe_token', token)
      .single()

    if (!subscriber) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Not Found</title><meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: system-ui; text-align: center; padding: 50px; background: linear-gradient(135deg, #0f172a, #1e1b4b); min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; }
          .card { background: white; border-radius: 24px; padding: 40px; max-width: 500px; }
          .btn { display: inline-block; padding: 12px 24px; background: #06b6d4; color: white; text-decoration: none; border-radius: 40px; }
        </style>
        </head>
        <body>
          <div class="card"><h1>Not Found</h1><a href="/" class="btn">Home</a></div>
        </body>
        </html>
      `)
    }

    await supabase
      .from('newsletter_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('id', subscriber.id)

    res.setHeader('Content-Type', 'text/html')
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribed</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: system-ui;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .card {
            background: white;
            border-radius: 32px;
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
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">🗑️</div>
          <h1>Successfully Unsubscribed</h1>
          <p>You have been removed from our newsletter.</p>
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
      <head><title>Error</title><meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: system-ui; text-align: center; padding: 50px; background: linear-gradient(135deg, #0f172a, #1e1b4b); min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; }
        .card { background: white; border-radius: 24px; padding: 40px; max-width: 500px; }
        .btn { display: inline-block; padding: 12px 24px; background: #06b6d4; color: white; text-decoration: none; border-radius: 40px; }
      </style>
      </head>
      <body>
        <div class="card"><h1>Error</h1><a href="/" class="btn">Home</a></div>
      </body>
      </html>
    `)
  }
}