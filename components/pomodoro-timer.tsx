"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Pause, RotateCcw, Timer, Coffee, Zap } from "lucide-react"
import { useTimer } from "@/contexts/timer-context"

export function PomodoroTimer() {
  const { timerState, startTimer, pauseTimer, resetTimer, switchMode, completeSession } = useTimer()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "pomodoro":
        return "text-red-600"
      case "short-break":
        return "text-green-600"
      case "long-break":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "pomodoro":
        return <Timer className="w-4 h-4" />
      case "short-break":
        return <Coffee className="w-4 h-4" />
      case "long-break":
        return <Zap className="w-4 h-4" />
      default:
        return <Timer className="w-4 h-4" />
    }
  }

  const getProgressPercentage = () => {
    const totalTime = timerState.mode === "pomodoro" ? 25 * 60 : timerState.mode === "short-break" ? 5 * 60 : 15 * 60
    return ((totalTime - timerState.timeLeft) / totalTime) * 100
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-4 sm:p-6 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-4 sm:mb-6 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Focus Timer</h1>
          <p className="text-sm sm:text-base text-white/80">Stay focused and productive with timed work sessions</p>
        </div>
      </div>

      {/* Timer Display */}
      <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200 shadow-lg">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl sm:text-2xl text-blue-900">Pomodoro Timer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Mode Selection */}
          <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-2">
            {(["pomodoro", "short-break", "long-break"] as const).map((timerMode) => (
              <Button
                key={timerMode}
                variant={timerState.mode === timerMode ? "default" : "outline"}
                size="sm"
                onClick={() => switchMode(timerMode)}
                className={`rounded-full ${
                  timerState.mode === timerMode
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "border-blue-300 text-blue-700 hover:bg-blue-50"
                }`}
              >
                {getModeIcon(timerMode)}
                <span className="ml-2 capitalize text-xs sm:text-sm">
                  {timerMode === "pomodoro" ? "Work" : timerMode === "short-break" ? "Short Break" : "Long Break"}
                </span>
              </Button>
            ))}
          </div>

          {/* Timer Circle */}
          <div className="flex justify-center">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64">
              {/* Progress Ring */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgressPercentage() / 100)}`}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              
              {/* Timer Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={`text-4xl sm:text-6xl font-bold ${getModeColor(timerState.mode)}`}>
                  {formatTime(timerState.timeLeft)}
                </div>
                <div className="text-sm sm:text-lg text-blue-700 capitalize mt-2 text-center">
                  {timerState.status === "running" ? "Working..." : timerState.status === "paused" ? "Paused" : "Ready"}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            {timerState.status === "running" ? (
              <Button onClick={pauseTimer} size="lg" className="bg-orange-600 hover:bg-orange-700 rounded-full px-6 sm:px-8">
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Pause
              </Button>
            ) : (
              <Button onClick={startTimer} size="lg" className="bg-green-600 hover:bg-green-700 rounded-full px-6 sm:px-8">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {timerState.status === "paused" ? "Resume" : "Start"}
              </Button>
            )}
            
            <Button onClick={resetTimer} variant="outline" size="lg" className="border-blue-300 text-blue-700 hover:bg-blue-50 rounded-full px-6 sm:px-8">
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Reset
            </Button>
          </div>

          {/* Session Counter */}
          <div className="text-center">
            <p className="text-sm sm:text-base text-blue-700">
              Completed Sessions: <span className="font-bold">{timerState.completedSessions}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      {timerState.completedSessions > 0 && (
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg text-blue-900">Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: Math.min(timerState.completedSessions, 5) }, (_, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 bg-white/60 rounded-lg border border-blue-200">
                  <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0" />
                  <span className="text-sm sm:text-base text-blue-700 flex-1">Session {timerState.completedSessions - i}</span>
                  <span className="text-xs sm:text-sm text-blue-500">25 minutes</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
