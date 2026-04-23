// pages/api/newsletter/subscribe.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const sessionToken = req.cookies.session_token
  if (!sessionToken) return res.status(401).json({ error: 'Not authenticated' })

  const { data: session } = await supabase.from('user_sessions').select('user_id').eq('token', sessionToken).single()
  if (!session) return res.status(401).json({ error: 'Invalid session' })

  const { is_subscribed, categories, delivery_frequency, max_posts_per_week, post_format } = req.body
  const updateData = { updated_at: new Date().toISOString() }
  if (typeof is_subscribed !== 'undefined') {
    updateData.is_subscribed = is_subscribed
    if (is_subscribed) updateData.subscribed_at = new Date().toISOString()
    else updateData.unsubscribed_at = new Date().toISOString()
  }
  if (categories !== undefined) updateData.categories = categories
  if (delivery_frequency) updateData.delivery_frequency = delivery_frequency
  if (max_posts_per_week) updateData.max_posts_per_week = max_posts_per_week
  if (post_format) updateData.post_format = post_format

  const { error } = await supabase.from('newsletter_preferences').update(updateData).eq('user_id', session.user_id)
  if (error) return res.status(500).json({ error: 'Failed to update preferences' })
  return res.status(200).json({ success: true })
}