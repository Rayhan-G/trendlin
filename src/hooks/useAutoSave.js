// src/hooks/useAutoSave.js (COMPLETE FIXED FILE)

import { useEffect, useRef, useCallback, useState } from 'react'
import { postService } from '@/services/postService'

/**
 * Auto-save hook for editor content
 * @param {string} postId - Post ID (null for new posts)
 * @param {string} content - HTML content to save
 * @param {string} title - Post title
 * @param {number} interval - Auto-save interval in milliseconds (default: 30000)
 * @param {Object} options - Additional options
 * @param {boolean} options.enabled - Enable/disable auto-save (default: true)
 * @param {number} options.debounceDelay - Debounce delay before saving (default: 1000)
 * @param {Function} options.onSaveStart - Callback when save starts
 * @param {Function} options.onSaveSuccess - Callback when save succeeds
 * @param {Function} options.onSaveError - Callback when save fails
 * @returns {Object} Auto-save controls and status
 */
export const useAutoSave = (
  postId, 
  content, 
  title, 
  interval = 30000, 
  options = {}
) => {
  const {
    enabled = true,
    debounceDelay = 1000,
    onSaveStart,
    onSaveSuccess,
    onSaveError
  } = options

  // State for tracking save status
  const [lastSavedTime, setLastSavedTime] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [lastError, setLastError] = useState(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  // Refs for tracking
  const intervalRef = useRef(null)
  const debounceRef = useRef(null)
  const lastContentRef = useRef(content)
  const lastTitleRef = useRef(title)
  const isMountedRef = useRef(true)
  const savePromiseRef = useRef(null)
  
  // Set mounted flag
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])
  
  /**
   * Save draft to database
   * @returns {Promise<Object>} Save result
   */
  const saveDraft = useCallback(async () => {
    // Prevent multiple simultaneous saves
    if (savePromiseRef.current) {
      return savePromiseRef.current
    }
    
    // Don't save if disabled or no content
    if (!enabled) return null
    if (!title && !content) return null
    
    // Check if content actually changed
    const contentChanged = lastContentRef.current !== content
    const titleChanged = lastTitleRef.current !== title
    
    if (!contentChanged && !titleChanged && postId) {
      // No changes, skip save
      return null
    }
    
    // Update refs
    lastContentRef.current = content
    lastTitleRef.current = title
    
    // Notify save start
    onSaveStart?.()
    setLastError(null)
    setIsSaving(true)
    setHasUnsavedChanges(false)
    
    // Create save promise
    const savePromise = (async () => {
      try {
        // Determine if creating new or updating existing
        let result
        
        if (postId) {
          // Update existing post
          result = await postService.updatePost(postId, {
            title: title || 'Untitled',
            content: content || '',
            status: 'draft'
          })
        } else {
          // Create new post (draft)
          result = await postService.createDraft({
            title: title || 'Untitled',
            content: content || ''
          })
        }
        
        if (!isMountedRef.current) return null
        
        if (result && result.success !== false) {
          const savedId = result.id || result.data?.id || postId
          const savedTime = new Date()
          
          setLastSavedTime(savedTime)
          setLastError(null)
          setHasUnsavedChanges(false)
          
          // Notify success
          onSaveSuccess?.({
            id: savedId,
            timestamp: savedTime,
            title,
            content
          })
          
          return { success: true, id: savedId, timestamp: savedTime }
        } else {
          throw new Error(result?.error || 'Save failed')
        }
      } catch (error) {
        console.error('Auto-save error:', error)
        
        if (isMountedRef.current) {
          setLastError(error.message)
          setHasUnsavedChanges(true)
          onSaveError?.(error)
        }
        
        return { success: false, error: error.message }
      } finally {
        if (isMountedRef.current) {
          setIsSaving(false)
        }
        savePromiseRef.current = null
      }
    })()
    
    savePromiseRef.current = savePromise
    return savePromise
  }, [postId, content, title, enabled, onSaveStart, onSaveSuccess, onSaveError])
  
  /**
   * Debounced save (for immediate changes)
   */
  const debouncedSave = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    debounceRef.current = setTimeout(() => {
      saveDraft()
      debounceRef.current = null
    }, debounceDelay)
  }, [saveDraft, debounceDelay])
  
  /**
   * Manual save (immediate)
   */
  const manualSave = useCallback(async () => {
    // Clear any pending debounced saves
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    
    // Clear interval timer temporarily
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    // Save immediately
    const result = await saveDraft()
    
    // Restart interval if needed
    if (enabled && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        saveDraft()
      }, interval)
    }
    
    return result
  }, [saveDraft, enabled, interval])
  
  /**
   * Set up auto-save interval
   */
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }
    
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    // Set up new interval
    intervalRef.current = setInterval(() => {
      // Only save if there are unsaved changes
      if (hasUnsavedChanges || lastContentRef.current !== content || lastTitleRef.current !== title) {
        saveDraft()
      }
    }, interval)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled, interval, saveDraft, content, title, hasUnsavedChanges])
  
  /**
   * Trigger debounced save on content/title changes
   */
  useEffect(() => {
    if (!enabled) return
    if (!title && !content) return
    
    // Mark that we have unsaved changes
    setHasUnsavedChanges(true)
    
    // Trigger debounced save
    debouncedSave()
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [content, title, enabled, debouncedSave])
  
  /**
   * Get formatted last saved time
   * @returns {string|null} Formatted time or null
   */
  const getLastSavedTimeFormatted = useCallback(() => {
    if (!lastSavedTime) return null
    
    const now = new Date()
    const diffMs = now - lastSavedTime
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    
    if (diffSec < 60) {
      return 'Just now'
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`
    } else {
      return lastSavedTime.toLocaleTimeString()
    }
  }, [lastSavedTime])
  
  /**
   * Force save (bypass debounce and interval)
   */
  const forceSave = useCallback(async () => {
    // Clear pending timers
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    
    return saveDraft()
  }, [saveDraft])
  
  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setLastError(null)
  }, [])
  
  /**
   * Reset auto-save state (for new post)
   */
  const reset = useCallback(() => {
    setLastSavedTime(null)
    setLastError(null)
    setHasUnsavedChanges(false)
    setIsSaving(false)
    lastContentRef.current = ''
    lastTitleRef.current = ''
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
  }, [])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])
  
  return {
    // Save methods
    saveDraft: manualSave,
    forceSave,
    
    // Status
    isSaving,
    lastSavedTime,
    lastSavedTimeFormatted: getLastSavedTimeFormatted(),
    lastError,
    hasUnsavedChanges,
    
    // Getters
    getLastSavedTime: useCallback(() => lastSavedTime, [lastSavedTime]),
    isCurrentlySaving: useCallback(() => isSaving, [isSaving]),
    
    // Utilities
    clearError,
    reset
  }
}

/**
 * Simplified version of useAutoSave with sensible defaults
 * @param {string} postId - Post ID
 * @param {string} content - Content to save
 * @param {string} title - Title to save
 * @param {number} interval - Save interval
 * @returns {Object} Simplified auto-save interface
 */
export const useSimpleAutoSave = (postId, content, title, interval = 30000) => {
  const { saveDraft, isSaving, lastSavedTimeFormatted, hasUnsavedChanges, lastError } = useAutoSave(
    postId,
    content,
    title,
    interval,
    { enabled: true, debounceDelay: 1000 }
  )
  
  return {
    save: saveDraft,
    isSaving,
    lastSaved: lastSavedTimeFormatted,
    hasUnsavedChanges,
    error: lastError
  }
}

export default useAutoSave