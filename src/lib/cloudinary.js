// src/lib/cloudinary.js (COMPLETE FIXED FILE)

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'trendlin_preset'

// ✅ FIXED: Add validation helper
const validateCloudinaryConfig = () => {
  if (!CLOUD_NAME) {
    throw new Error('Cloudinary cloud name is not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.local')
  }
  return true
}

const detectResourceType = (file) => {
  const mimeType = file.type
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'video' // Cloudinary treats audio as video
  const rawExtensions = ['pdf', 'txt', 'doc', 'docx', 'xls', 'xlsx', 'zip', 'rar', '7z']
  const fileExt = file.name.split('.').pop().toLowerCase()
  if (rawExtensions.includes(fileExt)) return 'raw'
  return 'auto'
}

const getMaxFileSize = (resourceType) => {
  switch (resourceType) {
    case 'image': return 20 * 1024 * 1024
    case 'video': return 100 * 1024 * 1024
    case 'raw': return 100 * 1024 * 1024
    default: return 100 * 1024 * 1024
  }
}

const validateFileSize = (file, resourceType) => {
  const maxSize = getMaxFileSize(resourceType)
  if (file.size > maxSize) {
    throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds ${resourceType} limit (${maxSize / 1024 / 1024}MB)`)
  }
  return true
}

/**
 * Upload a file to Cloudinary
 * @param {File} file - File to upload
 * @param {Object} options - Upload options
 * @param {string} options.resource_type - 'image', 'video', 'raw', or 'auto'
 * @param {string} options.folder - Folder to upload to
 * @param {string} options.tags - Tags for the file
 * @param {string} options.public_id - Custom public ID
 * @param {Object} options.context - Context metadata
 * @param {Object} options.transformation - Video transformations
 * @param {boolean} options.extract_audio - Extract audio from video
 * @param {number} options.width - Image width
 * @param {number} options.height - Image height
 * @param {string} options.crop - Crop mode (limit, fill, scale, etc.)
 * @param {number} options.quality - Quality percentage
 * @param {boolean} options.skipThumbnail - Skip generating thumbnail URL
 * @returns {Promise<Object>} Upload result
 */
export const uploadToCloudinary = async (file, options = {}) => {
  try {
    // ✅ FIXED: Validate config before upload
    validateCloudinaryConfig()
    
    let resourceType = options.resource_type || detectResourceType(file)
    validateFileSize(file, resourceType)
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    
    if (options.folder) formData.append('folder', options.folder)
    if (options.tags) formData.append('tags', Array.isArray(options.tags) ? options.tags.join(',') : options.tags)
    if (options.public_id) formData.append('public_id', options.public_id)
    if (options.context) formData.append('context', JSON.stringify(options.context))
    
    if (resourceType === 'video') {
      if (options.transformation) formData.append('transformation', JSON.stringify(options.transformation))
      if (options.eager) formData.append('eager', JSON.stringify(options.eager))
      if (options.extract_audio) formData.append('extract_audio', 'true')
    }
    
    if (resourceType === 'image') {
      if (options.width && options.height) {
        formData.append('width', options.width)
        formData.append('height', options.height)
        formData.append('crop', options.crop || 'limit')
      }
      if (options.quality) formData.append('quality', options.quality)
      if (options.eager) formData.append('eager', JSON.stringify(options.eager))
    }
    
    if (resourceType === 'raw' && options.access_mode === 'authenticated') {
      formData.append('access_mode', 'authenticated')
    }
    
    const apiUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`
    const response = await fetch(apiUrl, { method: 'POST', body: formData })
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error?.message || `Upload failed with status ${response.status}`)
    }
    
    const result = {
      url: data.secure_url,
      publicId: data.public_id,
      resourceType: data.resource_type,
      bytes: data.bytes,
      createdAt: data.created_at,
      format: data.format,
      originalFilename: data.original_filename,
    }
    
    if (data.resource_type === 'image') {
      result.width = data.width
      result.height = data.height
      result.aspectRatio = data.width / data.height
    }
    
    if (data.resource_type === 'video') {
      result.width = data.width
      result.height = data.height
      result.duration = data.duration
      result.bitrate = data.bitrate
      result.audio = data.audio
      result.video = data.video
      if (!options.skipThumbnail) {
        result.thumbnailUrl = getVideoThumbnailUrl(data.public_id)
      }
    }
    
    if (data.resource_type === 'raw') {
      result.filename = data.original_filename
      result.accessMode = data.access_mode
    }
    
    return result
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw error
  }
}

/**
 * Get video thumbnail URL from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Thumbnail options
 * @param {string} options.time - Timestamp in seconds (default: '1')
 * @param {number} options.width - Width in pixels (default: 640)
 * @param {number} options.height - Height in pixels (default: 480)
 * @param {number} options.quality - Quality percentage (default: 80)
 * @returns {string} Thumbnail URL
 */
export const getVideoThumbnailUrl = (publicId, options = {}) => {
  // ✅ FIXED: Validate config
  if (!CLOUD_NAME) {
    console.warn('Cloudinary cloud name not configured')
    return ''
  }
  
  const time = options.time || '1'
  const width = options.width || 640
  const height = options.height || 480
  const quality = options.quality || 80
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/w_${width},h_${height},q_${quality},so_${time}/${publicId}.jpg`
}

/**
 * Get optimized media URL with transformations
 * @param {string} url - Original Cloudinary URL
 * @param {Object} options - Transformation options
 * @param {number} options.width - Width in pixels
 * @param {number} options.height - Height in pixels
 * @param {number} options.quality - Quality percentage (1-100)
 * @param {string} options.format - Format ('auto', 'jpg', 'png', 'webp')
 * @param {string} options.crop - Crop mode ('limit', 'fill', 'scale', 'fit', 'pad')
 * @param {number} options.duration - Video duration in seconds
 * @param {number} options.startTime - Video start time in seconds
 * @returns {string} Optimized URL
 */
export const getOptimizedMediaUrl = (url, options = {}) => {
  if (!url) return url
  
  // ✅ FIXED: Validate config
  if (!CLOUD_NAME) {
    console.warn('Cloudinary cloud name not configured')
    return url
  }
  
  const { width, height, quality = 80, format = 'auto', crop = 'limit', duration, startTime } = options
  
  const transformations = []
  
  if (width && height) {
    transformations.push(`c_${crop},w_${width},h_${height}`)
  } else if (width) {
    transformations.push(`w_${width}`)
  } else if (height) {
    transformations.push(`h_${height}`)
  }
  
  if (quality !== undefined && quality !== 100) {
    transformations.push(`q_${quality}`)
  }
  
  if (format === 'auto') {
    transformations.push('f_auto')
  } else if (format) {
    transformations.push(`f_${format}`)
  }
  
  if (duration) {
    transformations.push(`du_${duration}`)
  }
  
  if (startTime) {
    transformations.push(`so_${startTime}`)
  }
  
  if (transformations.length === 0) return url
  
  const urlParts = url.split('/upload/')
  if (urlParts.length !== 2) return url
  
  return `${urlParts[0]}/upload/${transformations.join(',')}/${urlParts[1]}`
}

// Alias for backward compatibility
export const optimizeImage = getOptimizedMediaUrl

/**
 * Generate responsive srcset for images
 * @param {string} url - Original Cloudinary URL
 * @param {number[]} widths - Array of widths (default: [640, 768, 1024, 1280, 1536])
 * @returns {string} Srcset string
 */
export const getResponsiveSrcSet = (url, widths = [640, 768, 1024, 1280, 1536]) => {
  if (!url) return ''
  
  // ✅ FIXED: Validate config
  if (!CLOUD_NAME) {
    console.warn('Cloudinary cloud name not configured')
    return ''
  }
  
  return widths
    .map(width => `${getOptimizedMediaUrl(url, { width })} ${width}w`)
    .filter(src => src.trim() !== '')
    .join(', ')
}

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - Resource type ('image', 'video', 'raw')
 * @returns {Promise<boolean>} Success status
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    validateCloudinaryConfig()
    
    // Note: This requires a server-side API route because it needs the API secret
    // Client-side deletion is not secure. Call your own API endpoint.
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId, resourceType })
    })
    
    if (!response.ok) {
      throw new Error(`Deletion failed with status ${response.status}`)
    }
    
    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error('Cloudinary deletion error:', error)
    return false
  }
}

/**
 * Get Cloudinary configuration status
 * @returns {Object} Config status
 */
export const getCloudinaryConfigStatus = () => {
  return {
    isConfigured: !!CLOUD_NAME,
    cloudName: CLOUD_NAME || 'missing',
    uploadPreset: UPLOAD_PRESET,
    hasUploadPreset: !!UPLOAD_PRESET
  }
}

export default {
  uploadToCloudinary,
  getVideoThumbnailUrl,
  getOptimizedMediaUrl,
  optimizeImage,
  getResponsiveSrcSet,
  deleteFromCloudinary,
  getCloudinaryConfigStatus
}