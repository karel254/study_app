"use client"

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react"

export interface TimerState {
  timeLeft: number
  status: "idle" | "running" | "paused"
  mode: "pomodoro" | "short-break" | "long-break"
  completedSessions: number
}

interface TimerContextType {
  timerState: TimerState
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  switchMode: (mode: "pomodoro" | "short-break" | "long-break") => void
  completeSession: () => void
  playNotificationSound: () => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

const TIMER_DURATIONS = {
  pomodoro: 25 * 60, // 25 minutes
  "short-break": 5 * 60, // 5 minutes
  "long-break": 15 * 60, // 15 minutes
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [timerState, setTimerState] = useState<TimerState>(() => {
    // Load from localStorage on mount
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("pomodoro-timer-state")
        if (saved) {
          const parsed = JSON.parse(saved)
          // Ensure all values are valid numbers
          const timeLeft = typeof parsed.timeLeft === 'number' && !isNaN(parsed.timeLeft) 
            ? parsed.timeLeft 
            : TIMER_DURATIONS.pomodoro
          
          const completedSessions = typeof parsed.completedSessions === 'number' && !isNaN(parsed.completedSessions)
            ? parsed.completedSessions 
            : 0
          
          return {
            timeLeft: Math.max(0, timeLeft),
            status: parsed.status || "idle",
            mode: parsed.mode || "pomodoro",
            completedSessions: Math.max(0, completedSessions),
          }
        }
      } catch (error) {
        console.warn("Failed to load timer state:", error)
      }
    }
    
    return {
      timeLeft: TIMER_DURATIONS.pomodoro,
      status: "idle",
      mode: "pomodoro",
      completedSessions: 0,
    }
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)



  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Only save if all values are valid
      if (typeof timerState.timeLeft === 'number' && !isNaN(timerState.timeLeft) &&
          typeof timerState.completedSessions === 'number' && !isNaN(timerState.completedSessions)) {
        localStorage.setItem("pomodoro-timer-state", JSON.stringify(timerState))
      } else {
        // Clear corrupted data and reset to default
        localStorage.removeItem("pomodoro-timer-state")
        setTimerState({
          timeLeft: TIMER_DURATIONS.pomodoro,
          status: "idle",
          mode: "pomodoro",
          completedSessions: 0,
        })
      }
    }
  }, [timerState])

  // Timer countdown logic
  useEffect(() => {
    if (timerState.status === "running" && timerState.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimerState(prev => {
          // Ensure timeLeft is a valid number
          if (typeof prev.timeLeft !== 'number' || isNaN(prev.timeLeft)) {
            return {
              ...prev,
              timeLeft: TIMER_DURATIONS[prev.mode],
              status: "idle"
            }
          }
          
          const newTimeLeft = Math.max(0, prev.timeLeft - 1)
          
          if (newTimeLeft <= 0) {
            // Timer completed - play notification sound
            if (audioRef.current) {
              audioRef.current.currentTime = 0
              audioRef.current.play().catch(console.warn)
              
              // Stop audio after 10 seconds
              setTimeout(() => {
                if (audioRef.current) {
                  audioRef.current.pause()
                  audioRef.current.currentTime = 0
                }
              }, 10000)
            }
            
            if (prev.mode === "pomodoro") {
              return {
                ...prev,
                completedSessions: Math.max(0, prev.completedSessions + 1),
                status: "idle",
                timeLeft: TIMER_DURATIONS.pomodoro,
              }
            } else {
              // For breaks, switch back to pomodoro
              return {
                ...prev,
                mode: "pomodoro",
                status: "idle",
                timeLeft: TIMER_DURATIONS.pomodoro,
              }
            }
          }
          
          return { ...prev, timeLeft: newTimeLeft }
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [timerState.status, timerState.timeLeft, timerState.mode])

  const startTimer = useCallback(() => {
    if (timerState.status === "idle" || timerState.status === "paused") {
      setTimerState(prev => {
        // Ensure we have valid time values
        const currentTimeLeft = typeof prev.timeLeft === 'number' && !isNaN(prev.timeLeft) 
          ? prev.timeLeft 
          : TIMER_DURATIONS[prev.mode]
        
        return {
          ...prev,
          status: "running",
          timeLeft: prev.status === "idle" ? TIMER_DURATIONS[prev.mode] : Math.max(0, currentTimeLeft),
        }
      })
    }
  }, [timerState.status])

  const pauseTimer = useCallback(() => {
    if (timerState.status === "running") {
      setTimerState(prev => ({ ...prev, status: "paused" }))
    }
  }, [timerState.status])

  const resetTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      status: "idle",
      timeLeft: TIMER_DURATIONS[prev.mode],
    }))
  }, [])

  const switchMode = useCallback((mode: "pomodoro" | "short-break" | "long-break") => {
    setTimerState(prev => ({
      ...prev,
      mode,
      status: "idle",
      timeLeft: TIMER_DURATIONS[mode],
    }))
  }, [])

  const completeSession = useCallback(() => {
    setTimerState(prev => {
      const currentCompleted = typeof prev.completedSessions === 'number' && !isNaN(prev.completedSessions)
        ? prev.completedSessions 
        : 0
      
      return {
        ...prev,
        completedSessions: Math.max(0, currentCompleted + 1),
        status: "idle",
        timeLeft: TIMER_DURATIONS[prev.mode],
      }
    })
  }, [])

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(console.warn)
      
      // Stop audio after 10 seconds
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.currentTime = 0
        }
      }, 10000)
    }
  }, [])

  const value: TimerContextType = {
    timerState,
    startTimer,
    pauseTimer,
    resetTimer,
    switchMode,
    completeSession,
    playNotificationSound,
  }

  return (
    <TimerContext.Provider value={value}>
      {/* Hidden audio element for timer notifications */}
      <audio 
        ref={audioRef}
        src="/notification.mp3" 
        preload="auto"
        className="hidden"
      />
      {children}
    </TimerContext.Provider>
  )
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider")
  }
  return context
}
