"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, Target, Users, Calendar, User, ArrowLeft, CheckCircle, Clock, AlertTriangle, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface UserManualProps {
  onBack: () => void
}

export default function UserManual({ onBack }: UserManualProps) {
  const [activeSection, setActiveSection] = useState<string>("overview")

  const sections = [
    {
      id: "overview",
      title: "Overview",
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            StudySync helps you stay focused and organized with your studies. 
            Manage personal tasks, collaborate with teams, and use the focus timer.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Target className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-xs font-medium">Task Management</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Clock className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-xs font-medium">Focus Timer</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Users className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <p className="text-xs font-medium">Team Projects</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <p className="text-xs font-medium">Calendar View</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "tasks",
      title: "Managing Tasks",
      icon: Target,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-blue-900">Personal Tasks</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Click "Personal" button to add individual tasks</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Set title, description, deadline, and duration</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Mark tasks as complete when finished</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-blue-900">Team Tasks</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Click "Groups" to manage team projects</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Create projects and add tasks to them</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Track progress and deadlines together</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "timer",
      title: "Focus Timer",
      icon: Clock,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use the Pomodoro technique to stay focused during study sessions.
          </p>
          
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Timer Modes</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Work Session:</span>
                  <span className="font-medium">25 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Short Break:</span>
                  <span className="font-medium">5 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Long Break:</span>
                  <span className="font-medium">15 minutes</span>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">How to Use</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Choose your timer mode</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Click Start to begin</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Pause or reset as needed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "navigation",
      title: "Navigation",
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use the bottom navigation to move between different sections of the app.
          </p>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <BookOpen className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <p className="text-xs font-medium">Home</p>
                <p className="text-xs text-muted-foreground">Tasks & Dashboard</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Clock className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <p className="text-xs font-medium">Focus</p>
                <p className="text-xs text-muted-foreground">Timer & Sessions</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <p className="text-xs font-medium">Calendar</p>
                <p className="text-xs text-muted-foreground">Timeline & Deadlines</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <User className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                <p className="text-xs font-medium">Profile</p>
                <p className="text-xs text-muted-foreground">Settings & Logout</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "tips",
      title: "Quick Tips",
      icon: Zap,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">Getting Started</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-yellow-600" />
                  <span>Complete your profile first</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-yellow-600" />
                  <span>Add a few personal tasks to start</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-yellow-600" />
                  <span>Try the focus timer for study sessions</span>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Productivity</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Use 25-minute focused sessions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Set realistic deadlines</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Track your progress regularly</span>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Offline Use</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>App works without internet</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>All data is saved locally</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Syncs when connection returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-4 sm:p-6 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-4 sm:mb-6 shadow-lg">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2 text-white hover:bg-white/20">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white">User Manual</h1>
            <p className="text-sm sm:text-base text-white/80">Learn how to use StudySync effectively</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="overflow-x-auto">
        <div className="flex space-x-2 pb-2 min-w-max">
          {sections.map((section) => {
            const Icon = section.icon
            const isActive = activeSection === section.id

            return (
              <Button
                key={section.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSection(section.id)}
                className={`rounded-full whitespace-nowrap ${
                  isActive
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "border-blue-300 text-blue-700 hover:bg-blue-50"
                }`}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">{section.title}</span>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-white border-blue-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">
              {sections.find(s => s.id === activeSection)?.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sections.find(s => s.id === activeSection)?.content}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <div className="text-center pt-4">
        <p className="text-sm text-muted-foreground mb-3">
          Ready to get started? Go back and try these features!
        </p>
        <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700">
          <BookOpen className="w-4 h-4 mr-2" />
          Start Using StudySync
        </Button>
      </div>
    </div>
  )
}
