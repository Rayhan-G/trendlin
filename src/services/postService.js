// src/services/postService.js (COMPLETE FIXED FILE)

import { supabase } from '@/lib/supabase'
import { generateSlug, createUniqueSlug } from '@/utils/slugify'

export const postService = {
  /**
   * Create a new post
   * @param {Object} postData - Post data
   * @returns {Promise<Object>} Result with success flag and data/error
   */
  async createPost(postData) {
    // ✅ FIXED: Validate required fields
    if (!postData.title || postData.title.trim() === '') {
      return { success: false, error: 'Title is required' }
    }
    
    if (!postData.content || postData.content.trim() === '') {
      return { success: false, error: 'Content is required' }
    }
    
    try {
      // ✅ FIXED: Generate unique slug
      const baseSlug = generateSlug(postData.title)
      const slug = await createUniqueSlug(supabase, baseSlug)
      
      const now = new Date().toISOString()
      
      const { data, error } = await supabase
        .from('posts')
        .insert([{
          title: postData.title.trim(),
          content: postData.content,
          excerpt: postData.excerpt || postData.title.substring(0, 160),
          status: postData.status || 'draft',
          scheduled_for: postData.scheduled_for || null,
          slug,
          category: postData.category || null,
          tags: postData.tags || [],
          featured_image: postData.featured_image || null,
          featured_video: postData.featured_video || null,
          is_featured: postData.is_featured || false,
          seo_title: postData.seo_title || null,
          seo_description: postData.seo_description || null,
          author_id: postData.author_id || null,
          author_name: postData.author_name || null,
          created_at: now,
          updated_at: now
        }])
        .select()
        .maybeSingle() // ✅ FIXED: Use maybeSingle()
      
      if (error) throw error
      if (!data) throw new Error('Failed to create post')
      
      return { success: true, data }
    } catch (error) {
      console.error('Create post error:', error)
      return { success: false, error: error.message }
    }
  },
  
  /**
   * Get a single post by ID
   * @param {string} id - Post ID
   * @returns {Promise<Object>} Result with success flag and data/error
   */
  async getPost(id) {
    if (!id) {
      return { success: false, error: 'Post ID is required' }
    }
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .maybeSingle() // ✅ FIXED: Use maybeSingle()
      
      if (error) throw error
      if (!data) return { success: false, error: 'Post not found' }
      
      return { success: true, data }
    } catch (error) {
      console.error('Get post error:', error)
      return { success: false, error: error.message }
    }
  },
  
  /**
   * Get a single post by slug (published only)
   * @param {string} slug - Post slug
   * @returns {Promise<Object>} Result with success flag and data/error
   */
  async getPostBySlug(slug) {
    if (!slug) {
      return { success: false, error: 'Slug is required' }
    }
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle() // ✅ FIXED: Use maybeSingle()
      
      if (error) throw error
      if (!data) return { success: false, error: 'Post not found' }
      
      return { success: true, data }
    } catch (error) {
      console.error('Get post by slug error:', error)
      return { success: false, error: error.message }
    }
  },
  
  /**
   * Update an existing post
   * @param {string} id - Post ID
   * @param {Object} postData - Updated post data
   * @returns {Promise<Object>} Result with success flag and data/error
   */
  async updatePost(id, postData) {
    if (!id) {
      return { success: false, error: 'Post ID is required' }
    }
    
    try {
      const now = new Date().toISOString()
      let updateData = {
        updated_at: now
      }
      
      // Only include fields that are provided
      if (postData.title !== undefined) updateData.title = postData.title.trim()
      if (postData.content !== undefined) updateData.content = postData.content
      if (postData.excerpt !== undefined) updateData.excerpt = postData.excerpt
      if (postData.status !== undefined) updateData.status = postData.status
      if (postData.category !== undefined) updateData.category = postData.category
      if (postData.tags !== undefined) updateData.tags = postData.tags
      if (postData.featured_image !== undefined) updateData.featured_image = postData.featured_image
      if (postData.featured_video !== undefined) updateData.featured_video = postData.featured_video
      if (postData.is_featured !== undefined) updateData.is_featured = postData.is_featured
      if (postData.seo_title !== undefined) updateData.seo_title = postData.seo_title
      if (postData.seo_description !== undefined) updateData.seo_description = postData.seo_description
      if (postData.author_id !== undefined) updateData.author_id = postData.author_id
      if (postData.author_name !== undefined) updateData.author_name = postData.author_name
      
      // ✅ FIXED: Handle scheduled date
      if (postData.scheduled_for !== undefined) {
        updateData.scheduled_for = postData.scheduled_for
      }
      
      // ✅ FIXED: Handle published_at when publishing
      if (postData.status === 'published' && !postData.published_at) {
        updateData.published_at = now
      }
      
      // ✅ FIXED: Update slug if title changed
      if (postData.title !== undefined) {
        const baseSlug = generateSlug(postData.title)
        updateData.slug = await createUniqueSlug(supabase, baseSlug, id)
      }
      
      const { data, error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', id)
        .select()
        .maybeSingle() // ✅ FIXED: Use maybeSingle()
      
      if (error) throw error
      if (!data) throw new Error('Post not found')
      
      return { success: true, data }
    } catch (error) {
      console.error('Update post error:', error)
      return { success: false, error: error.message }
    }
  },
  
  /**
   * Delete a post
   * @param {string} id - Post ID
   * @returns {Promise<Object>} Result with success flag
   */
  async deletePost(id) {
    if (!id) {
      return { success: false, error: 'Post ID is required' }
    }
    
    try {
      // ✅ FIXED: Also delete related records
      await supabase.from('post_views').delete().eq('post_id', id)
      await supabase.from('post_versions').delete().eq('post_id', id)
      
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Delete post error:', error)
      return { success: false, error: error.message }
    }
  },
  
  /**
   * Get all posts with optional filtering
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} Result with success flag and data/error
   */
  async getAllPosts(options = {}) {
    try {
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (options.status && options.status !== 'all') {
        query = query.eq('status', options.status)
      }
      
      if (options.category && options.category !== 'all') {
        query = query.eq('category', options.category)
      }
      
      if (options.limit) {
        query = query.limit(options.limit)
      }
      
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Get all posts error:', error)
      return { success: false, error: error.message, data: [] }
    }
  },
  
  /**
   * Get published posts only
   * @param {number} limit - Max posts to return
   * @returns {Promise<Object>} Result with success flag and data/error
   */
  async getPublishedPosts(limit = 50) {
    return await this.getAllPosts({ status: 'published', limit })
  },
  
  /**
   * Publish a post
   * @param {string} id - Post ID
   * @returns {Promise<Object>} Result with success flag
   */
  async publishPost(id) {
    const now = new Date().toISOString()
    return await this.updatePost(id, { 
      status: 'published',
      published_at: now
    })
  },
  
  /**
   * Schedule a post for future publication
   * @param {string} id - Post ID
   * @param {string} scheduledDate - ISO date string
   * @returns {Promise<Object>} Result with success flag
   */
  async schedulePost(id, scheduledDate) {
    if (!scheduledDate) {
      return { success: false, error: 'Scheduled date is required' }
    }
    
    return await this.updatePost(id, {
      status: 'scheduled',
      scheduled_for: scheduledDate
    })
  },
  
  /**
   * Save a draft (create or update)
   * @param {string|null} id - Post ID (null for new draft)
   * @param {Object} draftData - Draft data
   * @returns {Promise<Object>} Result with success flag and data/error
   */
  async saveDraft(id, draftData) {
    // ✅ FIXED: Validate at least title or content
    if (!draftData.title && !draftData.content) {
      return { success: false, error: 'Title or content is required' }
    }
    
    if (id) {
      return await this.updatePost(id, { ...draftData, status: 'draft' })
    } else {
      return await this.createPost({ ...draftData, status: 'draft' })
    }
  },
  
  /**
   * Increment view count for a post (safe with race conditions)
   * @param {string} id - Post ID
   * @returns {Promise<Object>} Result with success flag
   */
  async incrementViews(id) {
    if (!id) {
      return { success: false, error: 'Post ID is required' }
    }
    
    try {
      // ✅ FIXED: Use RPC function to avoid race conditions
      const { error } = await supabase.rpc('increment_post_views', {
        post_id: id,
        increment_by: 1
      })
      
      if (error) {
        // Fallback: manual increment if RPC doesn't exist
        const { data: post } = await supabase
          .from('posts')
          .select('views')
          .eq('id', id)
          .maybeSingle()
        
        const { error: updateError } = await supabase
          .from('posts')
          .update({ views: (post?.views || 0) + 1 })
          .eq('id', id)
        
        if (updateError) throw updateError
      }
      
      return { success: true }
    } catch (error) {
      console.error('Increment views error:', error)
      return { success: false, error: error.message }
    }
  },
  
  /**
   * Get posts by category
   * @param {string} category - Category name
   * @param {number} limit - Max posts to return
   * @returns {Promise<Object>} Result with success flag and data/error
   */
  async getPostsByCategory(category, limit = 20) {
    if (!category) {
      return { success: false, error: 'Category is required' }
    }
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .eq('category', category)
        .order('published_at', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Get posts by category error:', error)
      return { success: false, error: error.message, data: [] }
    }
  },
  
  /**
   * Get featured posts (editor's picks)
   * @param {number} limit - Max posts to return
   * @returns {Promise<Object>} Result with success flag and data/error
   */
  async getFeaturedPosts(limit = 6) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Get featured posts error:', error)
      return { success: false, error: error.message, data: [] }
    }
  },
  
  /**
   * Search posts by title or content
   * @param {string} query - Search query
   * @param {number} limit - Max posts to return
   * @returns {Promise<Object>} Result with success flag and data/error
   */
  async searchPosts(query, limit = 20) {
    if (!query || query.trim() === '') {
      return { success: true, data: [] }
    }
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Search posts error:', error)
      return { success: false, error: error.message, data: [] }
    }
  }
}

export default postService