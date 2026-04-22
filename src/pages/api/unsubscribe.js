// pages/api/unsubscribe.js
import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  const { token, email } = req.query;

  if (!token && !email) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Unsubscribe</title><meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: system-ui; text-align: center; padding: 50px 20px; background: linear-gradient(135deg, #0f172a, #1e1b4b); min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; }
        .card { background: white; border-radius: 24px; padding: 40px; max-width: 500px; }
        h1 { color: #ef4444; margin-bottom: 16px; }
        p { color: #4b5563; margin-bottom: 24px; }
        .btn { display: inline-block; padding: 12px 24px; background: #06b6d4; color: white; text-decoration: none; border-radius: 40px; }
      </style>
      </head>
      <body>
        <div class="card"><h1>❌ Invalid Link</h1><p>Missing unsubscribe token.</p><a href="/" class="btn">Home</a></div>
      </body>
      </html>
    `);
  }

  try {
    let query = supabase.from('newsletter_subscribers').select('*');
    
    if (token) {
      query = query.eq('unsubscribe_token', token);
    } else if (email) {
      query = query.eq('email', decodeURIComponent(email).toLowerCase());
    }

    const { data: subscriber, error } = await query.single();

    if (error || !subscriber) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Not Found</title><meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: system-ui; text-align: center; padding: 50px 20px; background: linear-gradient(135deg, #0f172a, #1e1b4b); min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; }
          .card { background: white; border-radius: 24px; padding: 40px; max-width: 500px; }
          h1 { color: #ef4444; }
          .btn { display: inline-block; padding: 12px 24px; background: #06b6d4; color: white; text-decoration: none; border-radius: 40px; }
        </style>
        </head>
        <body>
          <div class="card"><h1>❌ Not Found</h1><p>No subscription found for this link.</p><a href="/" class="btn">Home</a></div>
        </body>
        </html>
      `);
    }

    // Update status to unsubscribed
    await supabase
      .from('newsletter_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('id', subscriber.id);

    // Return confirmation page
    res.setHeader('Content-Type', 'text/html');
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribed</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: system-ui, -apple-system, sans-serif;
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
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          }
          .icon { font-size: 64px; margin-bottom: 24px; }
          h1 { font-size: 28px; margin-bottom: 12px; color: #1e293b; }
          p { color: #64748b; margin-bottom: 32px; line-height: 1.5; }
          .btn {
            display: inline-block;
            padding: 12px 28px;
            background: #06b6d4;
            color: white;
            text-decoration: none;
            border-radius: 40px;
            font-weight: 600;
          }
          .btn:hover { background: #0891b2; }
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
    `);
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Error</title><meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: system-ui; text-align: center; padding: 50px 20px; background: linear-gradient(135deg, #0f172a, #1e1b4b); min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; }
        .card { background: white; border-radius: 24px; padding: 40px; max-width: 500px; }
        h1 { color: #ef4444; }
        .btn { display: inline-block; padding: 12px 24px; background: #06b6d4; color: white; text-decoration: none; border-radius: 40px; }
      </style>
      </head>
      <body>
        <div class="card"><h1>❌ Error</h1><p>Something went wrong. Please try again.</p><a href="/" class="btn">Home</a></div>
      </body>
      </html>
    `);
  }
}