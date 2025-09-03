"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Wifi, WifiOff, RefreshCw, BookOpen, Target, Zap, CheckCircle } from "lucide-react"

export default function OfflinePage() {
  // Component is hidden but must exist for build
  return <div style={{ display: 'none' }}>Offline Page</div>
  
  const [isOnline, setIsOnline] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [isLoading, setIsLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine)
    
    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      // Small delay to ensure connection is stable
      setTimeout(() => {
        // Check if user was logged in before going offline
        const wasLoggedIn = localStorage.getItem("was-logged-in") === "true"
        const hasProfile = localStorage.getItem("student-profile")
        
        if (wasLoggedIn || hasProfile) {
          // User was logged in, go back to tasks
          window.location.href = "/?tab=home"
        } else {
          // User was not logged in, go to registration
          window.location.href = "/"
        }
      }, 1000)
    }
    
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Auto-detect theme preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(prefersDark ? "dark" : "light")
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = async () => {
    setIsLoading(true)
    setRetryCount(prev => prev + 1)
    
    try {
      // Try to fetch a small resource to test connection
      const response = await fetch('/Minimalist Logo for StudySync App (Version 1).png', { 
        method: 'HEAD',
        cache: 'no-cache'
      })
      
      if (response.ok) {
        setIsOnline(true)
        // Check if user was logged in before going offline
        const wasLoggedIn = localStorage.getItem("was-logged-in") === "true"
        const hasProfile = localStorage.getItem("student-profile")
        
        if (wasLoggedIn || hasProfile) {
          // User was logged in, go back to tasks
          window.location.href = "/?tab=home"
        } else {
          // User was not logged in, go to registration
          window.location.href = "/"
        }
      }
    } catch (error) {
      console.log('Still offline, retry count:', retryCount + 1)
      // If still offline, show retry message
      setTimeout(() => {
        setIsLoading(false)
      }, 1000)
    }
  }

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light")
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      theme === "dark" 
        ? "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white" 
        : "bg-gradient-to-br from-blue-50 via-white to-blue-100 text-slate-900"
    }`} style={{ display: 'none' }}>
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-full transition-all duration-300 ${
            theme === "dark" 
              ? "bg-white/10 hover:bg-white/20 text-white" 
              : "bg-slate-900/10 hover:bg-slate-900/20 text-slate-900"
          }`}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        {/* Logo and Status */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-2xl">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-lg font-medium">
              {isOnline ? "Connection Restored!" : "You're Offline"}
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            StudySync
          </h1>
          <p className="text-lg opacity-80">
            {isOnline ? "Welcome back! Redirecting..." : "Stay focused, even offline"}
          </p>
        </motion.div>

        {/* Status Indicator */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className={`p-6 rounded-2xl backdrop-blur-sm ${
            theme === "dark" 
              ? "bg-white/10 border border-white/20" 
              : "bg-slate-900/10 border border-slate-900/20"
          }`}>
            <div className="flex items-center justify-center space-x-3 mb-4">
              {isOnline ? (
                <CheckCircle className="w-8 h-8 text-green-400" />
              ) : (
                <WifiOff className="w-8 h-8 text-red-400" />
              )}
              <span className="text-xl font-semibold">
                {isOnline ? "Connection Active" : "No Internet Connection"}
              </span>
            </div>
            
            <p className="text-sm opacity-80 max-w-md">
              {isOnline 
                ? "Your connection has been restored. You'll be redirected to the tasks page shortly."
                : "Don't worry! StudySync works offline. Your data is safely stored locally."
              }
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        {!isOnline ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4"
          >
            <button
              onClick={handleRetry}
              disabled={isLoading}
              className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-3 ${
                theme === "dark"
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Wifi className="w-5 h-5" />
              )}
              <span>
                {isLoading ? `Retrying... (${retryCount})` : "Check Connection"}
              </span>
            </button>
            
            <p className="text-sm opacity-60">
              {retryCount > 0 && `Retry attempt ${retryCount}`}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4"
          >
            <button
              onClick={() => {
                // Check if user was logged in before going offline
                const wasLoggedIn = localStorage.getItem("was-logged-in") === "true"
                const hasProfile = localStorage.getItem("student-profile")
                
                if (wasLoggedIn || hasProfile) {
                  // User was logged in, go back to tasks
                  window.location.href = "/?tab=home"
                } else {
                  // User was not logged in, go to registration
                  window.location.href = "/"
                }
              }}
              className="px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-3 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
            >
              <BookOpen className="w-5 h-5" />
              <span>Continue Studying</span>
            </button>
            
            <p className="text-sm opacity-60">
              Click to go to your tasks and continue your study session
            </p>
          </motion.div>
        )}

        {/* Features Preview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl"
        >
          <div className={`p-4 rounded-xl ${
            theme === "dark" 
              ? "bg-white/5 border border-white/10" 
              : "bg-slate-900/5 border border-slate-900/10"
          }`}>
            <Target className="w-8 h-8 mx-auto mb-3 text-blue-400" />
            <h3 className="font-semibold mb-2">Focus Timer</h3>
            <p className="text-sm opacity-70">Stay productive with Pomodoro technique</p>
          </div>
          
          <div className={`p-4 rounded-xl ${
            theme === "dark" 
              ? "bg-white/5 border border-white/10" 
              : "bg-slate-900/5 border border-slate-900/10"
          }`}>
            <BookOpen className="w-8 h-8 mx-auto mb-3 text-blue-400" />
            <h3 className="font-semibold mb-2">Task Management</h3>
            <p className="text-sm opacity-70">Organize personal and team tasks</p>
          </div>
          
          <div className={`p-4 rounded-xl ${
            theme === "dark" 
              ? "bg-white/5 border border-white/10" 
              : "bg-slate-900/5 border border-slate-900/10"
          }`}>
            <Zap className="w-8 h-8 mx-auto mb-3 text-blue-400" />
            <h3 className="font-semibold mb-2">Offline Ready</h3>
            <p className="text-sm opacity-70">Works seamlessly without internet</p>
          </div>
        </motion.div>

        {/* Connection Tips */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 text-sm opacity-60 max-w-md"
        >
          <p>
            💡 <strong>Tip:</strong> Check your Wi-Fi connection or try switching to mobile data
          </p>
        </motion.div>
      </div>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)`
        }} />
      </div>
    </div>
  )
}
