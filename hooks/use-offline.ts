"use client"

import { useState, useEffect } from "react"

export function useOffline() {
  const [isOnline, setIsOnline] = useState(true)
  const [isOfflinePage, setIsOfflinePage] = useState(false)

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine)
    
    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      setIsOfflinePage(false)
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      // Check if we're on the offline page
      if (window.location.pathname === '/offline') {
        setIsOfflinePage(true)
      }
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Check if we're on the offline page
    if (window.location.pathname === '/offline') {
      setIsOfflinePage(true)
    }
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const checkConnection = async () => {
    try {
      const response = await fetch('/', { cache: 'no-cache' })
      if (response.ok) {
        setIsOnline(true)
        setIsOfflinePage(false)
        return true
      }
    } catch (error) {
      setIsOnline(false)
      return false
    }
    return false
  }

  return {
    isOnline,
    isOfflinePage,
    checkConnection
  }
}
