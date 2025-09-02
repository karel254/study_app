"use client"

import { useState, useEffect, useRef, useCallback } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isLoaded, setIsLoaded] = useState(false)
  const isInitialized = useRef(false)
  const lastSavedValue = useRef<string>("")
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load from localStorage only once on mount
  useEffect(() => {
    if (isInitialized.current) return
    
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        // Check if the item is valid JSON before parsing
        if (item.trim().startsWith('{') || item.trim().startsWith('[') || item === 'null') {
          const parsed = JSON.parse(item)
          setStoredValue(parsed)
          lastSavedValue.current = item
        } else {
          // If it's not valid JSON, log a warning and use initial value
          console.warn(`Invalid JSON data found in localStorage for key "${key}":`, item)
          // Clear the invalid data
          window.localStorage.removeItem(key)
          setStoredValue(initialValue)
        }
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      // Clear the corrupted data and use initial value
      try {
        window.localStorage.removeItem(key)
      } catch (clearError) {
        console.error(`Error clearing corrupted localStorage key "${key}":`, clearError)
      }
      setStoredValue(initialValue)
    } finally {
      setIsLoaded(true)
      isInitialized.current = true
    }
  }, [key]) // Only depend on key, not initialValue

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Prevent unnecessary localStorage writes
      const serializedValue = JSON.stringify(valueToStore)
      if (serializedValue === lastSavedValue.current) {
        setStoredValue(valueToStore)
        return
      }
      
      setStoredValue(valueToStore)
      
      // Debounce localStorage writes to prevent rapid updates
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem(key, serializedValue)
            lastSavedValue.current = serializedValue
          } catch (error) {
            console.error(`Error writing to localStorage key "${key}":`, error)
          }
        }
      }, 100) // 100ms debounce
      
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  return [storedValue, setValue, isLoaded] as const
}
