"use client"

import { motion } from "framer-motion"
import { Home, Calendar, Timer, User, Users } from "lucide-react"
import type { ActiveTab } from "@/app/page"

interface BottomNavigationProps {
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void
}

const tabs = [
  { id: "home" as const, icon: Home, label: "Tasks" },
  { id: "calendar" as const, icon: Calendar, label: "Calendar" },
  { id: "pomodoro" as const, icon: Timer, label: "Focus" },
  { id: "profile" as const, icon: User, label: "Profile" },
]

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center p-3 rounded-2xl transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-2xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              <Icon
                className={`w-6 h-6 mb-1 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}
              />

              <span
                className={`text-xs font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
