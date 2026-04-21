// src/pages/api/track-view.js (COMPLETE FIXED FILE)

import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  // Add cache control to prevent caching of tracking requests
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    const { postId, sessionId: clientSessionId, referrer, userAgent } = req.body
    
    if (!postId) {
      return res.status(400).json({ error: 'postId is required' })
    }
    
    // ✅ FIXED: Use client-provided session ID or generate one
    let sessionId = clientSessionId
    if (!sessionId) {
      // Generate a session ID from request data (more reliable than IP)
      const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown'
      const ua = userAgent || req.headers['user-agent'] || 'unknown'
      const timestamp = Math.floor(Date.now() / (24 * 60 * 60 * 1000)) // Day-based
      sessionId = Buffer.from(`${ip}|${ua}|${timestamp}`).toString('base64').substring(0, 50)
    }
    
    const today = new Date().toISOString().split('T')[0]
    
    // ✅ FIXED: Check if this session viewed this post today
    const { data: existingView, error: checkError } = await supabase
      .from('post_views')
      .select('id, view_count')
      .eq('post_id', postId)
      .eq('session_id', sessionId)
      .eq('view_date', today)
      .maybeSingle()
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing view:', checkError)
    }
    
    // ✅ FIXED: Update or insert view record
    if (existingView) {
      // Increment view count for existing record
      const { error: updateError } = await supabase
        .from('post_views')
        .update({ 
          view_count: (existingView.view_count || 1) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingView.id)
      
      if (updateError) {
        console.error('Error updating view count:', updateError)
      }
    } else {
      // Insert new view record
      const { error: insertError } = await supabase
        .from('post_views')
        .insert({
          post_id: postId,
          session_id: sessionId,
          view_date: today,
          view_count: 1,
          referrer: referrer || req.headers.referer || null,
          user_agent: userAgent || req.headers['user-agent'] || null,
          country: req.headers['cf-ipcountry'] || null,
          device_type: getDeviceType(req.headers['user-agent']),
          created_at: new Date().toISOString()
        })
      
      if (insertError) {
        console.error('Error inserting view:', insertError)
        return res.status(500).json({ error: 'Failed to track view' })
      }
    }
    
    // ✅ FIXED: Increment total views counter on posts table
    const { error: rpcError } = await supabase.rpc('increment_post_views', {
      post_id: postId,
      increment_by: 1
    })
    
    if (rpcError) {
      console.error('Error incrementing post views:', rpcError)
      // Don't fail the request, just log
    }
    
    // ✅ FIXED: Get updated view count for this post
    const { count: totalViews, error: countError } = await supabase
      .from('post_views')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
    
    if (countError) {
      console.error('Error getting view count:', countError)
    }
    
    // ✅ FIXED: Also get unique views (distinct sessions)
    const { count: uniqueViews, error: uniqueError } = await supabase
      .from('post_views')
      .select('session_id', { count: 'exact', head: true })
      .eq('post_id', postId)
    
    if (uniqueError) {
      console.error('Error getting unique views:', uniqueError)
    }
    
    return res.status(200).json({ 
      success: true, 
      views: totalViews || 0,
      unique_views: uniqueViews || 0,
      session_id: sessionId
    })
    
  } catch (error) {
    console.error('Track view error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// Helper function to detect device type from user agent
function getDeviceType(userAgent) {
  if (!userAgent) return 'unknown'
  
  const ua = userAgent.toLowerCase()
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile'
  }
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet'
  }
  if (ua.includes('bot') || ua.includes('crawler') || ua.includes('spider')) {
    return 'bot'
  }
  return 'desktop'
}