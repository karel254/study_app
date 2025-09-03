"use client"

import { motion } from "framer-motion"
import { BookOpen, Calendar, User, Clock } from "lucide-react"
import { useTimer } from "@/contexts/timer-context"

interface BottomNavigationProps {
  activeTab: "home" | "pomodoro" | "calendar" | "profile"
  onTabChange: (tab: "home" | "pomodoro" | "calendar" | "profile") => void
}

const tabs = [
  { id: "home", label: "Tasks", icon: BookOpen },
  { id: "pomodoro", label: "Focus", icon: Clock },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "profile", label: "Profile", icon: User }
]

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const { timerState } = useTimer()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-900 to-blue-800 backdrop-blur-lg border-t border-blue-700 shadow-lg">
      <div className="flex items-center justify-around py-2 px-2 sm:px-4 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white/20 rounded-2xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              <Icon
                className={`w-5 h-5 sm:w-6 sm:h-6 mb-1 transition-colors ${isActive ? "text-white" : "text-white/70"}`}
              />

              <span
                className={`text-xs font-medium transition-colors ${
                  isActive ? "text-white" : "text-white/70"
                }`}
              >
                {tab.label}
              </span>

              {/* Timer indicator for Focus tab */}
              {tab.id === "pomodoro" && timerState.status === "running" && (
                <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
