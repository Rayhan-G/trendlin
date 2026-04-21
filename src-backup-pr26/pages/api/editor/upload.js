import { supabase } from '@/lib/supabaseClient'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

const uploadToSupabase = async (file, fileName) => {
  const fileBuffer = fs.readFileSync(file.filepath)
  const timestamp = Date.now()
  const uniqueFileName = `${timestamp}-${fileName}`
  
  const { data, error } = await supabase.storage
    .from('post-images')
    .upload(uniqueFileName, fileBuffer, {
      contentType: file.mimetype,
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) {
    throw new Error(error.message)
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('post-images')
    .getPublicUrl(uniqueFileName)
  
  return { publicUrl, path: uniqueFileName }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const form = formidable({
      multiples: false,
      maxFileSize: MAX_FILE_SIZE,
      filter: (part) => {
        return ALLOWED_FILE_TYPES.includes(part.mimetype)
      }
    })

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        resolve([fields, files])
      })
    })

    const file = files.image || files.file
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      return res.status(400).json({ 
        error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' 
      })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({ 
        error: `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB` 
      })
    }

    // Upload to Supabase Storage
    const { publicUrl, path: filePath } = await uploadToSupabase(file, file.originalFilename)

    // Save reference to database if post_id is provided
    if (fields.post_id) {
      const { error: dbError } = await supabase
        .from('post_images')
        .insert({
          post_id: fields.post_id,
          url: publicUrl,
          name: file.originalFilename,
          size: file.size,
          type: file.mimetype,
          created_at: new Date().toISOString()
        })

      if (dbError) {
        console.error('Error saving image reference:', dbError)
      }
    }

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
    return res.status(500).json({ 
      error: error.message || 'Failed to upload file' 
    })
  }
}