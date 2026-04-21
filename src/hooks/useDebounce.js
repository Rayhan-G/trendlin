// src/hooks/useDebounce.js (COMPLETE FILE - ENHANCED)

import { useEffect, useState, useCallback, useRef } from 'react'

/**
 * Debounce a value - delays updating the debounced value until after the specified delay
 * Useful for search inputs, form validation, etc.
 * 
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 1000ms)
 * @returns {any} Debounced value
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('')
 * const debouncedSearchTerm = useDebounce(searchTerm, 500)
 * 
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     searchAPI(debouncedSearchTerm)
 *   }
 * }, [debouncedSearchTerm])
 */
export const useDebounce = (value, delay = 1000) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    // Set timeout to update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    // Cleanup timeout if value changes before delay expires
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
  return debouncedValue
}

/**
 * Debounce a callback function - delays executing the callback until after the specified delay
 * Useful for search API calls, save operations, resize handlers, etc.
 * 
 * @param {Function} callback - The function to debounce
 * @param {number} delay - Delay in milliseconds (default: 1000ms)
 * @returns {Function} Debounced callback
 * 
 * @example
 * const debouncedSave = useDebouncedCallback(async (content) => {
 *   await saveToDatabase(content)
 * }, 1000)
 * 
 * // Call on every keystroke, but only saves after 1 second of no typing
 * onChange={(e) => debouncedSave(e.target.value)}
 */
export const useDebouncedCallback = (callback, delay = 1000) => {
  const timeoutRef = useRef(null)
  const callbackRef = useRef(callback)
  
  // Update callback ref if callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])
  
  const debouncedCallback = useCallback((...args) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args)
    }, delay)
  }, [delay])
  
  // Cancel any pending debounced call
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])
  
  // Immediately execute and cancel pending
  const flush = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    callbackRef.current(...args)
  }, [])
  
  return { debouncedCallback, cancel, flush }
}

/**
 * Throttle a value - limits how often a value can update
 * Useful for scroll position, window resize, etc.
 * 
 * @param {any} value - The value to throttle
 * @param {number} limit - Time limit in milliseconds (default: 1000ms)
 * @returns {any} Throttled value
 * 
 * @example
 * const scrollPosition = useThrottle(window.scrollY, 100)
 */
export const useThrottle = (value, limit = 1000) => {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastRan = useRef(Date.now())
  
  useEffect(() => {
    const handler = setTimeout(() => {
      const now = Date.now()
      if (now - lastRan.current >= limit) {
        setThrottledValue(value)
        lastRan.current = now
      }
    }, limit - (Date.now() - lastRan.current))
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, limit])
  
  return throttledValue
}

/**
 * Throttle a callback function - limits how often the callback can execute
 * 
 * @param {Function} callback - The function to throttle
 * @param {number} limit - Time limit in milliseconds (default: 1000ms)
 * @returns {Function} Throttled callback
 * 
 * @example
 * const throttledScroll = useThrottledCallback(() => {
 *   console.log('Scroll position:', window.scrollY)
 * }, 100)
 * 
 * window.addEventListener('scroll', throttledScroll)
 */
export const useThrottledCallback = (callback, limit = 1000) => {
  const lastRan = useRef(Date.now())
  const timeoutRef = useRef(null)
  const callbackRef = useRef(callback)
  
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])
  
  const throttledCallback = useCallback((...args) => {
    const now = Date.now()
    
    if (now - lastRan.current >= limit) {
      // Time limit passed, execute immediately
      callbackRef.current(...args)
      lastRan.current = now
    } else if (!timeoutRef.current) {
      // Schedule execution for the remaining time
      const remaining = limit - (now - lastRan.current)
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
        lastRan.current = Date.now()
        timeoutRef.current = null
      }, remaining)
    }
  }, [limit])
  
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])
  
  return { throttledCallback, cancel }
}

/**
 * Use debounced effect - runs useEffect only after debounce delay
 * 
 * @param {Function} effect - Effect to run
 * @param {Array} deps - Dependencies array
 * @param {number} delay - Delay in milliseconds (default: 1000ms)
 * 
 * @example
 * useDebouncedEffect(() => {
 *   searchAPI(searchTerm)
 * }, [searchTerm], 500)
 */
export const useDebouncedEffect = (effect, deps, delay = 1000) => {
  const timeoutRef = useRef(null)
  
  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      effect()
    }, delay)
    
    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, ...deps])
}

export default {
  useDebounce,
  useDebouncedCallback,
  useThrottle,
  useThrottledCallback,
  useDebouncedEffect
}