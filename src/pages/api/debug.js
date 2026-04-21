// src/pages/api/debug.js (COMPLETE FIXED FILE - SECURE VERSION)

import { supabase } from '@/lib/supabase'

// ✅ FIXED: Only enable in development environment
const isDevelopment = process.env.NODE_ENV === 'development'

// ✅ FIXED: Helper to check admin authentication
const isAdmin = async (req) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return false
  
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) return false
  
  // Check if user is admin
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
  return adminEmails.includes(user.email)
}

export default async function handler(req, res) {
  // ✅ FIXED: Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    })
  }
  
  // ✅ FIXED: Block in production unless explicitly enabled
  if (!isDevelopment && process.env.ENABLE_DEBUG_API !== 'true') {
    return res.status(404).json({ 
      success: false, 
      error: 'Endpoint not found' 
    })
  }
  
  // ✅ FIXED: Require admin authentication
  const isAdminUser = await isAdmin(req)
  if (!isAdminUser) {
    return res.status(401).json({ 
      success: false, 
      error: 'Unauthorized. Admin access required.' 
    })
  }
  
  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    return res.status(200).json({ 
      success: false,
      error: 'Supabase not configured',
      config: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        environment: process.env.NODE_ENV
      }
    })
  }
  
  try {
    // Get all posts (limited to 10 for safety)
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, slug, status, created_at, updated_at, views')
      .limit(10)
    
    if (error) throw error
    
    // Get counts for different statuses
    const { count: totalCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
    
    const { count: publishedCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
    
    const { count: draftCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'draft')
    
    // Check if posts table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('posts')
      .select('id')
      .limit(1)
    
    res.status(200).json({
      success: true,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      supabase: {
        configured: true,
        url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : null
      },
      database: {
        tableExists: !tableError,
        totalPosts: totalCount || 0,
        publishedPosts: publishedCount || 0,
        draftPosts: draftCount || 0,
        recentPosts: posts?.map(p => ({
          id: p.id,
          title: p.title,
          status: p.status,
          views: p.views,
          updated_at: p.updated_at
        })) || []
      }
    })
  } catch (error) {
    console.error('Debug API error:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      environment: process.env.NODE_ENV
    })
  }
}