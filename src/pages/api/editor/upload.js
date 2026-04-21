// src/pages/api/editor/upload.js (COMPLETE FIXED FILE)

import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

// Helper to check if user is authenticated (implement based on your auth)
const isAuthenticated = async (req) => {
  // Get session token from headers or cookies
  const authHeader = req.headers.authorization
  if (!authHeader) return false
  
  const token = authHeader.replace('Bearer ', '')
  
  // Verify token with Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  return !error && user !== null
}

// Helper to delete temporary file
const cleanupTempFile = (filepath) => {
  if (filepath && fs.existsSync(filepath)) {
    fs.unlink(filepath, (err) => {
      if (err) console.error('Failed to delete temp file:', err)
    })
  }
}

// Helper to generate unique filename
const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = path.extname(originalName).toLowerCase()
  const sanitizedName = path.basename(originalName, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .substring(0, 50)
  
  return `${timestamp}-${random}-${sanitizedName}${extension}`
}

// Helper to ensure bucket exists
const ensureBucketExists = async () => {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()
  
  if (listError) {
    console.error('Error listing buckets:', listError)
    return false
  }
  
  const bucketExists = buckets?.some(b => b.name === 'post-images')
  
  if (!bucketExists) {
    const { error: createError } = await supabase.storage.createBucket('post-images', {
      public: true,
      fileSizeLimit: MAX_FILE_SIZE,
      allowedMimeTypes: ALLOWED_FILE_TYPES
    })
    
    if (createError) {
      console.error('Error creating bucket:', createError)
      return false
    }
    
    // Set bucket policy for public access
    await supabase.storage.from('post-images').updateBucket({
      public: true
    })
  }
  
  return true
}

// Helper to upload to Supabase Storage
const uploadToSupabase = async (file, fileName) => {
  const fileBuffer = fs.readFileSync(file.filepath)
  
  const { data, error } = await supabase.storage
    .from('post-images')
    .upload(fileName, fileBuffer, {
      contentType: file.mimetype,
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) {
    throw new Error(error.message)
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('post-images')
    .getPublicUrl(fileName)
  
  return { publicUrl, path: fileName }
}

export default async function handler(req, res) {
  // ✅ FIXED: Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  // ✅ FIXED: Check authentication
  const isAuth = await isAuthenticated(req)
  if (!isAuth) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' })
  }
  
  // ✅ FIXED: Check Supabase configuration
  if (!isSupabaseConfigured()) {
    return res.status(500).json({ error: 'Supabase not configured' })
  }
  
  // ✅ FIXED: Ensure bucket exists
  const bucketReady = await ensureBucketExists()
  if (!bucketReady) {
    return res.status(500).json({ error: 'Storage bucket not available' })
  }
  
  let tempFilePath = null
  
  try {
    const form = formidable({
      multiples: false,
      maxFileSize: MAX_FILE_SIZE,
      filter: (part) => {
        return ALLOWED_FILE_TYPES.includes(part.mimetype)
      },
      keepExtensions: true
    })

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        resolve([fields, files])
      })
    })

    // Get the uploaded file (supports both 'image' and 'file' field names)
    const file = files.image || files.file
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded. Use field name "image" or "file".' })
    }
    
    tempFilePath = file.filepath

    // ✅ FIXED: Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cleanupTempFile(tempFilePath)
      return res.status(400).json({ 
        error: `Invalid file type. Allowed: ${ALLOWED_FILE_TYPES.join(', ')}` 
      })
    }

    // Validate file extension
    const ext = path.extname(file.originalFilename).toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      cleanupTempFile(tempFilePath)
      return res.status(400).json({ 
        error: `Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` 
      })
    }

    // ✅ FIXED: Validate file size
    if (file.size > MAX_FILE_SIZE) {
      cleanupTempFile(tempFilePath)
      return res.status(400).json({ 
        error: `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB` 
      })
    }

    // Generate unique filename
    const uniqueFileName = generateUniqueFilename(file.originalFilename)

    // Upload to Supabase Storage
    const { publicUrl, path: filePath } = await uploadToSupabase(file, uniqueFileName)

    // ✅ FIXED: Save reference to database if post_id is provided (with table creation check)
    if (fields.post_id && fields.post_id[0]) {
      // Check if table exists (optional: create if not)
      try {
        const { error: dbError } = await supabase
          .from('post_images')
          .insert({
            post_id: fields.post_id[0],
            url: publicUrl,
            storage_path: filePath,
            name: file.originalFilename,
            size: file.size,
            type: file.mimetype,
            created_at: new Date().toISOString()
          })

        if (dbError && dbError.code !== '42P01') { // 42P01 = table doesn't exist
          console.error('Error saving image reference:', dbError)
        }
      } catch (dbError) {
        console.error('Database error:', dbError)
        // Don't fail the upload if DB save fails
      }
    }

    // ✅ FIXED: Clean up temp file
    cleanupTempFile(tempFilePath)

    return res.status(200).json({
      success: true,
      url: publicUrl,
      path: filePath,
      name: file.originalFilename,
      size: file.size,
      type: file.mimetype
    })

  } catch (error) {
    console.error('Upload error:', error)
    
    // Clean up temp file on error
    if (tempFilePath) {
      cleanupTempFile(tempFilePath)
    }
    
    return res.status(500).json({ 
      error: error.message || 'Failed to upload file',
      success: false
    })
  }
}