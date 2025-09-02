import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to clear corrupted localStorage data
export function clearCorruptedLocalStorage() {
  if (typeof window === "undefined") return

  const keysToCheck = [
    "student-profile",
    "tasks", 
    "collaborative-tasks",
    "group-projects",
    "selected-project",
    "theme",
    "pomodoro-sessions",
    "pomodoro-timer-state"
  ]

  keysToCheck.forEach(key => {
    try {
      const item = localStorage.getItem(key)
      if (item) {
        // Try to parse as JSON
        JSON.parse(item)
      }
    } catch (error) {
      console.warn(`Corrupted data found in localStorage key "${key}":`, error)
      // Clear the corrupted data
      localStorage.removeItem(key)
    }
  })
}

// Utility function to validate if a string is valid JSON
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

// Debug function to inspect localStorage (can be called from browser console)
export function debugLocalStorage() {
  if (typeof window === "undefined") return

  const keysToCheck = [
    "student-profile",
    "tasks", 
    "collaborative-tasks",
    "group-projects",
    "selected-project",
    "theme",
    "pomodoro-sessions",
    "pomodoro-timer-state"
  ]

  console.log("=== LocalStorage Debug Info ===")
  keysToCheck.forEach(key => {
    const item = localStorage.getItem(key)
    if (item) {
      const isValid = isValidJSON(item)
      console.log(`${key}: ${isValid ? '✅ Valid JSON' : '❌ Invalid JSON'}`)
      if (!isValid) {
        console.log(`  Content: ${item}`)
        console.log(`  Length: ${item.length}`)
      }
    } else {
      console.log(`${key}: Not set`)
    }
  })
  
  // Check for any other keys that might contain "system"
  const allKeys = Object.keys(localStorage)
  const suspiciousKeys = allKeys.filter(key => 
    key.toLowerCase().includes('system') || 
    key.toLowerCase().includes('browser') ||
    key.toLowerCase().includes('chrome')
  )
  
  if (suspiciousKeys.length > 0) {
    console.log("⚠️  Suspicious keys found:")
    suspiciousKeys.forEach(key => {
      const item = localStorage.getItem(key)
      console.log(`  ${key}: ${item}`)
    })
  }
}
