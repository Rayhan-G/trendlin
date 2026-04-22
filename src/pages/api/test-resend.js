// pages/api/test-resend.js
import { Resend } from 'resend'

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  
  const resend = new Resend(process.env.RESEND_API_KEY)
  
  try {
    // Test the API key and domain
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: 'your-test-email@gmail.com', // Change to your email
      subject: 'Test Email',
      html: '<p>Test from Trendlin</p>',
    })
    
    if (error) {
      return res.status(500).json({ error: error.message })
    }
    
    return res.status(200).json({ success: true, data })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}