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
          return {
            timeLeft: parsed.timeLeft || TIMER_DURATIONS.pomodoro,
            status: parsed.status || "idle",
            mode: parsed.mode || "pomodoro",
            completedSessions: parsed.completedSessions || 0,
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

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pomodoro-timer-state", JSON.stringify(timerState))
    }
  }, [timerState])

  // Timer countdown logic
  useEffect(() => {
    if (timerState.status === "running" && timerState.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimerState(prev => {
          const newTimeLeft = prev.timeLeft - 1
          
          if (newTimeLeft <= 0) {
            // Timer completed
            if (prev.mode === "pomodoro") {
              return {
                ...prev,
                completedSessions: prev.completedSessions + 1,
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
      setTimerState(prev => ({
        ...prev,
        status: "running",
        timeLeft: prev.status === "idle" ? TIMER_DURATIONS[prev.mode] : prev.timeLeft,
      }))
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
    setTimerState(prev => ({
      ...prev,
      completedSessions: prev.completedSessions + 1,
      status: "idle",
      timeLeft: TIMER_DURATIONS[prev.mode],
    }))
  }, [])

  const value: TimerContextType = {
    timerState,
    startTimer,
    pauseTimer,
    resetTimer,
    switchMode,
    completeSession,
  }

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider")
  }
  return context
}
