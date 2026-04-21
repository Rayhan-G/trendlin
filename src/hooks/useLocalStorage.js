// src/hooks/useLocalStorage.js
import { useState, useEffect, useCallback } from 'react'

export const useLocalStorage = (key, initialValue) => {
  // Get stored value
  const readValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  }, [key, initialValue])

  // State to store our value
  const [storedValue, setStoredValue] = useState(readValue)

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Save state
      setStoredValue(valueToStore)
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  // Listen for changes to this localStorage key in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === key && event.newValue) {
        setStoredValue(JSON.parse(event.newValue))
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [storedValue, setValue]
}

export const useLocalStorageObject = (key, initialValue = {}) => {
  const [storedValue, setStoredValue] = useLocalStorage(key, initialValue)

  const updateValue = useCallback((updates) => {
    setStoredValue(prev => ({
      ...prev,
      ...updates
    }))
  }, [setStoredValue])

  const removeKey = useCallback((removeKeyName) => {
    setStoredValue(prev => {
      const { [removeKeyName]: _, ...rest } = prev
      return rest
    })
  }, [setStoredValue])

  const clear = useCallback(() => {
    setStoredValue({})
  }, [setStoredValue])

  return [storedValue, updateValue, removeKey, clear]
}

export const useLocalStorageArray = (key, initialValue = []) => {
  const [storedValue, setStoredValue] = useLocalStorage(key, initialValue)

  const addItem = useCallback((item) => {
    setStoredValue(prev => [...prev, item])
  }, [setStoredValue])

  const removeItem = useCallback((indexOrPredicate) => {
    setStoredValue(prev => {
      if (typeof indexOrPredicate === 'number') {
        return prev.filter((_, i) => i !== indexOrPredicate)
      }
      return prev.filter(indexOrPredicate)
    })
  }, [setStoredValue])

  const updateItem = useCallback((index, newItem) => {
    setStoredValue(prev => prev.map((item, i) => i === index ? newItem : item))
  }, [setStoredValue])

  const clear = useCallback(() => {
    setStoredValue([])
  }, [setStoredValue])

  return [storedValue, addItem, removeItem, updateItem, clear]
}

export default useLocalStorage