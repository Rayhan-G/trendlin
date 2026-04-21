// src/lib/supabaseQueries.js (COMPLETE FIXED FILE)

import { supabase } from './supabase'

/**
 * Get a single document by ID
 * @param {string} id - Post ID
 * @returns {Promise<Object|null>} Post or null
 */
export async function getDocument(id) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .maybeSingle() // ✅ FIXED: returns null instead of error when no rows
  
  if (error) { 
    console.error('Error fetching document:', error)
    return null 
  }
  
  return data
}

/**
 * Get a single document by slug
 * @param {string} slug - Post slug
 * @returns {Promise<Object|null>} Post or null
 */
export async function getDocumentBySlug(slug) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle() // ✅ FIXED: returns null instead of error when no rows
  
  if (error) { 
    console.error('Error fetching document by slug:', error)
    return null 
  }
  
  return data
}

/**
 * Save a document (insert or update)
 * @param {Object} document - Post data
 * @returns {Promise<Object|null>} Saved post or null
 */
export async function saveDocument(document) {
  if (!supabase) return null
  
  const now = new Date().toISOString()
  
  // ✅ FIXED: Only include fields that exist in posts table
  const postData = {
    updated_at: now
  }
  
  // Add fields only if they exist
  if (document.id !== undefined) postData.id = document.id
  if (document.title !== undefined) postData.title = document.title
  if (document.content !== undefined) postData.content = document.content
  if (document.slug !== undefined) postData.slug = document.slug
  if (document.excerpt !== undefined) postData.excerpt = document.excerpt
  if (document.featured_image !== undefined) postData.featured_image = document.featured_image
  if (document.status !== undefined) postData.status = document.status
  if (document.author_id !== undefined) postData.author_id = document.author_id
  if (document.author_name !== undefined) postData.author_name = document.author_name
  if (document.tags !== undefined) postData.tags = document.tags
  if (document.category !== undefined) postData.category = document.category
  if (document.is_featured !== undefined) postData.is_featured = document.is_featured
  
  // ✅ FIXED: Handle published_at separately
  if (document.status === 'published' && !document.published_at) {
    postData.published_at = now
  } else if (document.published_at) {
    postData.published_at = document.published_at
  }
  
  // Only add created_at for new documents
  if (!document.id) {
    postData.created_at = now
  }
  
  const { data, error } = await supabase
    .from('posts')
    .upsert(postData)
    .select()
    .maybeSingle()
  
  if (error) { 
    console.error('Error saving document:', error)
    return null 
  }
  
  return data
}

/**
 * Create a new empty document
 * @param {string} userId - Author ID
 * @param {string} userName - Author name
 * @param {string} title - Post title
 * @returns {Promise<Object|null>} Created post or null
 */
export async function createDocument(userId, userName, title = 'Untitled') {
  if (!supabase) return null
  
  // ✅ FIXED: Generate unique slug
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  
  // Check if slug exists and make it unique
  let slug = baseSlug
  let counter = 1
  let exists = true
  
  while (exists) {
    const { data } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    
    if (!data) {
      exists = false
    } else {
      slug = `${baseSlug}-${counter}`
      counter++
    }
    
    if (counter > 50) {
      slug = `${baseSlug}-${Date.now()}`
      break
    }
  }
  
  const now = new Date().toISOString()
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      title: title || 'Untitled',
      content: '',
      slug: slug,
      status: 'draft',
      author_id: userId,
      author_name: userName,
      created_at: now,
      updated_at: now
    })
    .select()
    .maybeSingle()
  
  if (error) { 
    console.error('Error creating document:', error)
    return null 
  }
  
  return data
}

/**
 * Get all documents by user ID
 * @param {string} userId - Author ID
 * @returns {Promise<Array>} Array of posts
 */
export async function getUserDocuments(userId) {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('author_id', userId)
    .order('updated_at', { ascending: false })
  
  if (error) { 
    console.error('Error fetching user documents:', error)
    return [] 
  }
  
  return data || []
}

/**
 * Get all published documents (for frontend)
 * @param {number} limit - Max posts to return
 * @param {number} offset - Pagination offset
 * @returns {Promise<Array>} Array of published posts
 */
export async function getAllDocuments(limit = 50, offset = 0) {
  if (!supabase) return []
  
  // ✅ FIXED: Use published_at for ordering published posts
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsLast: true })
    .range(offset, offset + limit - 1)
  
  if (error) { 
    console.error('Error fetching all documents:', error)
    return [] 
  }
  
  return data || []
}

/**
 * Delete a document by ID
 * @param {string} id - Post ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteDocument(id) {
  if (!supabase) return false
  
  // ✅ FIXED: Also delete related records
  const { error: versionsError } = await supabase
    .from('post_versions')
    .delete()
    .eq('post_id', id)
  
  if (versionsError) {
    console.error('Error deleting versions:', versionsError)
    // Continue anyway
  }
  
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)
  
  if (error) { 
    console.error('Error deleting document:', error)
    return false 
  }
  
  return true
}

/**
 * Update document status (draft, published, scheduled, archived)
 * @param {string} id - Post ID
 * @param {string} status - New status
 * @returns {Promise<boolean>} Success status
 */
export async function updateDocumentStatus(id, status) {
  if (!supabase) return false
  
  const now = new Date().toISOString()
  const updateData = {
    status,
    updated_at: now
  }
  
  // ✅ FIXED: Only set published_at when publishing
  if (status === 'published') {
    updateData.published_at = now
  }
  
  const { error } = await supabase
    .from('posts')
    .update(updateData)
    .eq('id', id)
  
  if (error) { 
    console.error('Error updating document status:', error)
    return false 
  }
  
  return true
}

/**
 * Get version history for a document
 * @param {string} documentId - Post ID
 * @returns {Promise<Array>} Array of versions
 */
export async function getDocumentVersions(documentId) {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('post_versions')
    .select('*')
    .eq('post_id', documentId)
    .order('version_number', { ascending: false })
  
  if (error) { 
    console.error('Error fetching versions:', error)
    return [] 
  }
  
  return data || []
}

/**
 * Save a new version of a document
 * @param {string} documentId - Post ID
 * @param {string} content - Post content
 * @param {string} userId - User ID
 * @param {string} userName - User name
 * @param {string} comment - Version comment
 * @returns {Promise<Object|null>} Saved version or null
 */
export async function saveVersion(documentId, content, userId, userName, comment = '') {
  if (!supabase) return null
  
  // Get next version number
  const { data: versions } = await supabase
    .from('post_versions')
    .select('version_number')
    .eq('post_id', documentId)
    .order('version_number', { ascending: false })
    .limit(1)
  
  const nextVersion = (versions?.[0]?.version_number || 0) + 1
  
  const { data, error } = await supabase
    .from('post_versions')
    .insert({
      post_id: documentId,
      content,
      version_number: nextVersion,
      created_by: userName,
      created_by_id: userId,
      comment: comment || `Version ${nextVersion}`,
      created_at: new Date().toISOString()
    })
    .select()
    .maybeSingle()
  
  if (error) { 
    console.error('Error saving version:', error)
    return null 
  }
  
  return data
}

/**
 * Restore a previous version
 * @param {string} documentId - Post ID
 * @param {string} versionId - Version ID
 * @param {string} content - Content to restore
 * @returns {Promise<boolean>} Success status
 */
export async function restoreVersion(documentId, versionId, content) {
  if (!supabase) return false
  
  // Update post with restored content
  const { error: updateError } = await supabase
    .from('posts')
    .update({ 
      content, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', documentId)
  
  if (updateError) { 
    console.error('Error restoring version:', updateError)
    return false 
  }
  
  // Save a new version marking the restore
  await saveVersion(
    documentId, 
    content, 
    'system', 
    'System', 
    `Restored from version ${versionId}`
  )
  
  return true
}

/**
 * Search documents by title or content
 * @param {string} userId - Author ID
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of matching posts
 */
export async function searchDocuments(userId, query) {
  if (!supabase) return []
  if (!query || query.trim() === '') return getUserDocuments(userId)
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('author_id', userId)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('updated_at', { ascending: false })
  
  if (error) { 
    console.error('Error searching documents:', error)
    return [] 
  }
  
  return data || []
}

/**
 * Get published posts by category
 * @param {string} category - Category slug
 * @param {number} limit - Max posts
 * @returns {Promise<Array>} Array of posts
 */
export async function getPostsByCategory(category, limit = 20) {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .eq('category', category)
    .order('published_at', { ascending: false })
    .limit(limit)
  
  if (error) { 
    console.error('Error fetching posts by category:', error)
    return [] 
  }
  
  return data || []
}

/**
 * Get featured posts (editor's picks)
 * @param {number} limit - Max posts
 * @returns {Promise<Array>} Array of featured posts
 */
export async function getFeaturedPosts(limit = 6) {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit)
  
  if (error) { 
    console.error('Error fetching featured posts:', error)
    return [] 
  }
  
  return data || []
}

export default {
  getDocument,
  getDocumentBySlug,
  saveDocument,
  createDocument,
  getUserDocuments,
  getAllDocuments,
  deleteDocument,
  updateDocumentStatus,
  getDocumentVersions,
  saveVersion,
  restoreVersion,
  searchDocuments,
  getPostsByCategory,
  getFeaturedPosts
}