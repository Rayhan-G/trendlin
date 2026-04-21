// src/utils/slugify.js
// This is a UTILITY file - no React hooks allowed here!

/**
 * Generate a slug from a string
 * @param {string} text - The text to convert to slug
 * @returns {string} - The generated slug
 */
export function generateSlug(text) {
  if (!text) return 'untitled'
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

/**
 * Create a unique slug by checking against database
 * @param {object} supabaseClient - Supabase client instance
 * @param {string} title - The post title
 * @param {string} excludeId - Post ID to exclude from check (for updates)
 * @returns {string} - Unique slug
 */
export async function createUniqueSlug(supabaseClient, title, excludeId = null) {
  if (!title) return 'untitled'
  
  let baseSlug = generateSlug(title)
  let slug = baseSlug
  let counter = 1
  let exists = true
  
  while (exists) {
    let query = supabaseClient
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    
    if (excludeId) {
      query = supabaseClient
        .from('posts')
        .select('id')
        .eq('slug', slug)
        .neq('id', excludeId)
        .maybeSingle()
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error checking slug uniqueness:', error)
      exists = false
      break
    }
    
    if (!data) {
      exists = false
    } else {
      slug = `${baseSlug}-${counter}`
      counter++
    }
  }
  
  return slug
}

/**
 * Validate slug format
 * @param {string} slug - The slug to validate
 * @returns {boolean} - Whether the slug is valid
 */
export function isValidSlug(slug) {
  if (!slug || slug === 'untitled') return false
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug) && slug.length <= 60
}

/**
 * Sanitize slug (remove special characters)
 * @param {string} text - The text to sanitize
 * @returns {string} - Sanitized text
 */
export function sanitizeSlug(text) {
  if (!text) return ''
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}