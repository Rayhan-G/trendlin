// src/pages/api/editor/save.js (COMPLETE FIXED FILE)

import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { generateSlug, createUniqueSlug } from '@/utils/slugify'

export default async function handler(req, res) {
  // ✅ FIXED: Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  // ✅ FIXED: Check Supabase configuration
  if (!isSupabaseConfigured()) {
    return res.status(500).json({ error: 'Supabase not configured' })
  }
  
  // ✅ FIXED: Check authentication
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized. Missing authorization header.' })
  }
  
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized. Invalid or expired token.' })
  }
  
  const { 
    id, 
    title, 
    content, 
    excerpt, 
    status, 
    tags, 
    meta_description, 
    featured_image, 
    featured_video,
    category,
    is_featured,
    seo_title,
    seo_description,
    slug: customSlug,
    scheduled_for,
    version_comment,
    author_id = user.id,
    author_name = user.email?.split('@')[0] || 'User'
  } = req.body

  // ✅ FIXED: Validate required fields
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' })
  }
  
  if (!content || content.trim() === '' || content === '<p></p>') {
    return res.status(400).json({ error: 'Content is required' })
  }
  
  if (status && !['draft', 'published', 'scheduled', 'archived'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' })
  }

  try {
    const now = new Date().toISOString()
    
    // Calculate word count from content
    const plainText = content?.replace(/<[^>]*>/g, '').trim() || ''
    const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length || 0
    
    // Calculate reading time (200 words per minute)
    const readingTime = Math.max(1, Math.ceil(wordCount / 200))
    
    // Handle slug generation
    let slug = customSlug
    if (!slug) {
      slug = generateSlug(title)
    }
    
    // Check if this is a new post or existing
    let postId = id
    let isNewPost = false
    
    // ✅ FIXED: Prepare update/insert data
    const postData = {
      title: title.trim(),
      content: content,
      excerpt: excerpt || (title.length > 160 ? title.substring(0, 157) + '...' : title),
      word_count: wordCount,
      reading_time: readingTime,
      updated_at: now
    }
    
    // Add optional fields if provided
    if (tags !== undefined) postData.tags = Array.isArray(tags) ? tags : []
    if (meta_description !== undefined) postData.meta_description = meta_description
    if (featured_image !== undefined) postData.featured_image = featured_image
    if (featured_video !== undefined) postData.featured_video = featured_video
    if (category !== undefined) postData.category = category
    if (is_featured !== undefined) postData.is_featured = is_featured
    if (seo_title !== undefined) postData.seo_title = seo_title
    if (seo_description !== undefined) postData.seo_description = seo_description
    if (author_id !== undefined) postData.author_id = author_id
    if (author_name !== undefined) postData.author_name = author_name
    
    // ✅ FIXED: Handle status changes
    if (status !== undefined) {
      postData.status = status
      
      // Set published_at when status changes to published
      if (status === 'published' && !postData.published_at) {
        postData.published_at = now
      }
      
      // Set scheduled_for when status is scheduled
      if (status === 'scheduled' && scheduled_for) {
        postData.scheduled_for = new Date(scheduled_for).toISOString()
      }
    }
    
    let result
    
    if (postId) {
      // Update existing post
      // ✅ FIXED: Ensure slug is unique for updates
      if (slug) {
        const existingSlug = await createUniqueSlug(supabase, slug, postId)
        postData.slug = existingSlug
      }
      
      const { data, error } = await supabase
        .from('posts')
        .update(postData)
        .eq('id', postId)
        .select()
        .maybeSingle()
      
      if (error) throw new Error(error.message)
      if (!data) throw new Error('Post not found')
      
      result = data
      
    } else {
      // Create new post
      isNewPost = true
      
      // ✅ FIXED: Generate unique slug for new post
      const uniqueSlug = await createUniqueSlug(supabase, slug || generateSlug(title))
      postData.slug = uniqueSlug
      postData.created_at = now
      postData.status = status || 'draft'
      
      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select()
        .maybeSingle()
      
      if (error) throw new Error(error.message)
      
      result = data
      postId = result.id
    }
    
    // ✅ FIXED: Save version history if content changed
    if (content !== undefined && postId) {
      // Check if post_versions table exists and create if not
      try {
        // Get current max version number
        const { data: versions } = await supabase
          .from('post_versions')
          .select('version_number')
          .eq('post_id', postId)
          .order('version_number', { ascending: false })
          .limit(1)
        
        const nextVersion = (versions?.[0]?.version_number || 0) + 1
        
        await supabase
          .from('post_versions')
          .insert({
            post_id: postId,
            content: content,
            version_number: nextVersion,
            created_by: author_name,
            created_by_id: author_id,
            comment: version_comment || (isNewPost ? 'Initial version' : 'Auto-saved'),
            created_at: now
          })
      } catch (versionError) {
        console.error('Error saving version history:', versionError)
        // Don't fail the main save if version history fails
      }
    }
    
    return res.status(200).json({
      success: true,
      document: result,
      savedAt: now,
      isNew: isNewPost,
      id: postId
    })

  } catch (error) {
    console.error('Save error:', error)
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to save document' 
    })
  }
}