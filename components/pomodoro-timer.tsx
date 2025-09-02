"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Coffee, Brain, BarChart3 } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"

type TimerMode = "focus" | "break"
type TimerStatus = "idle" | "running" | "paused"

interface PomodoroSession {
  id: string
  mode: TimerMode
  duration: number
  completedAt: string
}

interface TimerState {
  mode: TimerMode
  status: TimerStatus
  timeLeft: number
  totalTime: number
}

const FOCUS_TIME = 25 * 60 // 25 minutes in seconds
const BREAK_TIME = 5 * 60 // 5 minutes in seconds

export function PomodoroTimer() {
  const [timerState, setTimerState] = useState<TimerState>({
    mode: "focus",
    status: "idle",
    timeLeft: FOCUS_TIME,
    totalTime: FOCUS_TIME,
  })

  const [sessions, setSessions] = useLocalStorage<PomodoroSession[]>("pomodoro-sessions", [])
  const [showStats, setShowStats] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Save timer state to localStorage
  const saveTimerState = useCallback((state: TimerState) => {
    try {
      localStorage.setItem("pomodoro-timer-state", JSON.stringify(state))
    } catch (error) {
      console.error("Error saving timer state:", error)
    }
  }, [])

  // Load timer state from localStorage on mount
  useEffect(() => {
    try {
    const savedState = localStorage.getItem("pomodoro-timer-state")
    if (savedState) {
        const parsed = JSON.parse(savedState)
        if (parsed && typeof parsed === "object") {
          setTimerState(parsed)
        }
      }
    } catch (error) {
      console.error("Error loading timer state:", error)
      localStorage.removeItem("pomodoro-timer-state")
    }
  }, [])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  const startTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    setTimerState(prev => {
      const newState = { ...prev, status: "running" as const }
      // Use setTimeout to avoid immediate localStorage writes
      setTimeout(() => saveTimerState(newState), 0)
      return newState
    })

    intervalRef.current = setInterval(() => {
      setTimerState(prev => {
        const newTimeLeft = prev.timeLeft - 1

        if (newTimeLeft <= 0) {
          // Timer completed
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }

          // Add completed session to history
          const session: PomodoroSession = {
            id: crypto.randomUUID(),
            mode: prev.mode,
            duration: prev.totalTime,
            completedAt: new Date().toISOString(),
          }
          setSessions(prevSessions => [...prevSessions, session])

          // Switch to next mode
          const nextMode: TimerMode = prev.mode === "focus" ? "break" : "focus"
          const nextTime = nextMode === "focus" ? FOCUS_TIME : BREAK_TIME

          const newState: TimerState = {
            mode: nextMode,
            status: "idle" as const,
            timeLeft: nextTime,
            totalTime: nextTime,
          }

          // Use setTimeout to avoid nested state updates
          setTimeout(() => {
            setTimerState(newState)
            saveTimerState(newState)
          }, 0)

          // Show notification (if supported)
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(`${prev.mode === "focus" ? "Focus" : "Break"} session completed!`, {
              body: `Time for a ${nextMode === "focus" ? "focus session" : "break"}`,
              icon: "/favicon.ico",
            })
          }

          return newState
        }

        const newState = {
          ...prev,
          timeLeft: newTimeLeft,
        }

        // Debounce localStorage saves to prevent rapid updates
        setTimeout(() => saveTimerState(newState), 0)
        return newState
      })
    }, 1000)
  }, [saveTimerState, setSessions])

  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setTimerState(prev => {
      const newState = { ...prev, status: "paused" }
      saveTimerState(newState)
      return newState
    })
  }, [saveTimerState])

  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setTimerState(prev => {
      const newTime = prev.mode === "focus" ? FOCUS_TIME : BREAK_TIME
      const newState = {
        mode: prev.mode,
        status: "idle",
        timeLeft: newTime,
        totalTime: newTime,
      }

      setTimerState(newState)
      saveTimerState(newState)
      return newState
    })
  }, [saveTimerState])

  const switchMode = useCallback((newMode: TimerMode) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

    setTimerState(prev => {
      const newTime = newMode === "focus" ? FOCUS_TIME : BREAK_TIME
      const newState = {
        mode: newMode,
        status: "idle",
        timeLeft: newTime,
        totalTime: newTime,
      }

      setTimerState(newState)
      saveTimerState(newState)
      return newState
    })
  }, [saveTimerState])

  // Test function to verify timer works
  const testTimer = useCallback(() => {
    console.log("Testing timer...")
    console.log("Current state:", timerState)
    console.log("Interval ref:", intervalRef.current)
    
    // Test with a 10-second countdown
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setTimerState({
      mode: "focus",
      status: "running",
      timeLeft: 10,
      totalTime: 10,
    })

    intervalRef.current = setInterval(() => {
      setTimerState(prev => {
        const newTimeLeft = prev.timeLeft - 1
        console.log("Test timer tick:", newTimeLeft)
        
        if (newTimeLeft <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          
          setTimerState({
            mode: "focus",
            status: "idle",
            timeLeft: FOCUS_TIME,
            totalTime: FOCUS_TIME,
          })
          
          return {
            mode: "focus",
            status: "idle",
            timeLeft: FOCUS_TIME,
            totalTime: FOCUS_TIME,
          }
        }

        return {
          ...prev,
          timeLeft: newTimeLeft,
        }
      })
    }, 1000)
  }, [timerState])

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const progress = ((timerState.totalTime - timerState.timeLeft) / timerState.totalTime) * 100
  const circumference = 2 * Math.PI * 120
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const todaySessions = sessions.filter((session) => {
    const today = new Date().toDateString()
    const sessionDate = new Date(session.completedAt).toDateString()
    return today === sessionDate
  })

  const focusSessionsToday = todaySessions.filter((s) => s.mode === "focus").length
  const totalFocusTime = todaySessions.filter((s) => s.mode === "focus").reduce((acc, s) => acc + s.duration, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-balance">Focus Timer</h1>
          <p className="text-muted-foreground">Stay productive with the Pomodoro Technique</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={testTimer} className="rounded-full">
            Test
          </Button>
        <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)} className="rounded-full">
          <BarChart3 className="w-4 h-4 mr-2" />
          Stats
        </Button>
        </div>
      </div>

      {/* Stats Card */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-card/50 backdrop-blur border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Today's Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{focusSessionsToday}</div>
                    <div className="text-sm text-muted-foreground">Focus Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{Math.round(totalFocusTime / 60)}m</div>
                    <div className="text-sm text-muted-foreground">Focus Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode Selector */}
      <div className="flex space-x-2">
        <Button
          variant={timerState.mode === "focus" ? "default" : "outline"}
          onClick={() => switchMode("focus")}
          disabled={timerState.status === "running"}
          className="flex-1 rounded-xl"
        >
          <Brain className="w-4 h-4 mr-2" />
          Focus (25m)
        </Button>
        <Button
          variant={timerState.mode === "break" ? "default" : "outline"}
          onClick={() => switchMode("break")}
          disabled={timerState.status === "running"}
          className="flex-1 rounded-xl"
        >
          <Coffee className="w-4 h-4 mr-2" />
          Break (5m)
        </Button>
      </div>

      {/* Timer Display */}
      <Card className="bg-card/50 backdrop-blur border-0 shadow-lg">
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center space-y-6">
            {/* Circular Progress */}
            <div className="relative">
              <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 256 256">
                {/* Background circle */}
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted/20"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  className={timerState.mode === "focus" ? "text-primary" : "text-green-500"}
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: strokeDashoffset,
                  }}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: strokeDashoffset }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </svg>

              {/* Timer Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  key={timerState.timeLeft}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl font-bold font-mono"
                >
                  {formatTime(timerState.timeLeft)}
                </motion.div>
                <Badge variant="secondary" className="mt-2">
                  {timerState.mode === "focus" ? (
                    <>
                      <Brain className="w-3 h-3 mr-1" />
                      Focus Time
                    </>
                  ) : (
                    <>
                      <Coffee className="w-3 h-3 mr-1" />
                      Break Time
                    </>
                  )}
                </Badge>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={resetTimer} size="lg" className="rounded-full bg-transparent">
                <RotateCcw className="w-5 h-5" />
              </Button>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={timerState.status === "running" ? pauseTimer : startTimer}
                  size="lg"
                  className="w-16 h-16 rounded-full text-lg"
                >
                  {timerState.status === "running" ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </Button>
              </motion.div>

              <Button
                variant="outline"
                onClick={resetTimer}
                size="lg"
                className="rounded-full opacity-0 pointer-events-none bg-transparent"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>

            {/* Status Text */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {timerState.status === "idle"
                  ? "Ready to start"
                  : timerState.status === "running"
                    ? `${timerState.mode === "focus" ? "Stay focused!" : "Take a break!"}`
                    : "Timer paused"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      {todaySessions.length > 0 && (
        <Card className="bg-card/50 backdrop-blur border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Recent Sessions</CardTitle>
            <CardDescription>Your completed sessions today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todaySessions
                .slice(-5)
                .reverse()
                .map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {session.mode === "focus" ? (
                        <Brain className="w-4 h-4 text-primary" />
                      ) : (
                        <Coffee className="w-4 h-4 text-green-500" />
                      )}
                      <div>
                        <p className="font-medium">
                          {session.mode === "focus" ? "Focus Session" : "Break Session"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.completedAt).toLocaleTimeString()}
                        </p>
                    </div>
                    </div>
                    <Badge variant="outline">{Math.round(session.duration / 60)}m</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
