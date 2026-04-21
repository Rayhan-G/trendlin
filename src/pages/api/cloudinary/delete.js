// src/pages/api/cloudinary/delete.js (COMPLETE FIXED FILE)

import cloudinary from 'cloudinary'
import { supabase } from '@/lib/supabase'

// Validate Cloudinary configuration on module load
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

if (!cloudName || !apiKey || !apiSecret) {
  console.error('Cloudinary configuration missing. Please check environment variables.')
}

// Configure Cloudinary only if credentials exist
if (cloudName && apiKey && apiSecret) {
  cloudinary.v2.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  })
}

// Helper to check if user is authenticated
const isAuthenticated = async (req) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return false
  
  const token = authHeader.replace('Bearer ', '')
  
  // Verify token with Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  return !error && user !== null
}

// Helper to check if user has admin role
const isAdmin = async (req) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return false
  
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) return false
  
  // Check if user is admin (based on email or custom role)
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
  return adminEmails.includes(user.email)
}

export default async function handler(req, res) {
  // ✅ FIXED: Only allow POST and DELETE
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    res.setHeader('Allow', ['POST', 'DELETE'])
    return res.status(405).json({ 
      success: false, 
      error: `Method ${req.method} not allowed` 
    })
  }

  // ✅ FIXED: Check authentication
  const isAuth = await isAuthenticated(req)
  if (!isAuth) {
    return res.status(401).json({ 
      success: false, 
      error: 'Unauthorized. Please log in.' 
    })
  }

  // ✅ FIXED: Check admin authorization (optional - require admin for deletions)
  const isUserAdmin = await isAdmin(req)
  if (!isUserAdmin) {
    return res.status(403).json({ 
      success: false, 
      error: 'Forbidden. Admin access required.' 
    })
  }

  // ✅ FIXED: Validate Cloudinary configuration
  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({ 
      success: false, 
      error: 'Cloudinary is not configured. Please check environment variables.' 
    })
  }

  const { public_id, resource_type = 'image', delete_from_db = false, post_id = null } = req.body

  // ✅ FIXED: Validate public_id
  if (!public_id || typeof public_id !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing or invalid public_id' 
    })
  }

  // ✅ FIXED: Validate resource_type
  const validResourceTypes = ['image', 'video', 'raw', 'auto']
  if (!validResourceTypes.includes(resource_type)) {
    return res.status(400).json({ 
      success: false, 
      error: `Invalid resource_type. Must be one of: ${validResourceTypes.join(', ')}` 
    })
  }

  // ✅ FIXED: Sanitize public_id (prevent path traversal)
  const sanitizedPublicId = public_id.replace(/\.\./g, '').replace(/\/\//g, '/')
  
  try {
    // ✅ FIXED: Delete from Cloudinary
    const result = await cloudinary.v2.uploader.destroy(sanitizedPublicId, {
      resource_type: resource_type,
      invalidate: true // Invalidate CDN cache
    })

    // ✅ FIXED: Check if deletion was successful
    if (result.result !== 'ok') {
      if (result.result === 'not found') {
        return res.status(404).json({ 
          success: false, 
          error: 'File not found in Cloudinary',
          result: result
        })
      }
      return res.status(500).json({ 
        success: false, 
        error: `Cloudinary deletion failed: ${result.result}`,
        result: result
      })
    }

    // ✅ FIXED: Delete from database if requested
    if (delete_from_db && post_id) {
      try {
        // Delete from post_images table
        const { error: dbError } = await supabase
          .from('post_images')
          .delete()
          .eq('storage_path', sanitizedPublicId)
          .eq('post_id', post_id)
        
        if (dbError) {
          console.error('Database deletion error:', dbError)
          // Don't fail the response, just log
        }

        // Also remove featured_image reference from posts table
        const { error: updateError } = await supabase
          .from('posts')
          .update({ featured_image: null })
          .eq('featured_image', `https://res.cloudinary.com/${cloudName}/image/upload/v1/${sanitizedPublicId}`)
        
        if (updateError) {
          console.error('Post update error:', updateError)
        }
      } catch (dbError) {
        console.error('Database operation error:', dbError)
      }
    }

    // ✅ FIXED: Return standardized response
    return res.status(200).json({
      success: true,
      message: 'File deleted successfully',
      result: {
        public_id: sanitizedPublicId,
        resource_type: resource_type,
        deleted: true
      }
    })

  } catch (error) {
    console.error('Cloudinary delete error:', error)
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to delete file from Cloudinary'
    })
  }
}