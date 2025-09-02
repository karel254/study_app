"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { clearCorruptedLocalStorage } from "@/lib/utils"
import { StudentOnboarding, type StudentProfile } from "@/components/student-onboarding"
import { UnifiedTaskDashboard } from "@/components/unified-task-dashboard"
import { GroupManagement } from "@/components/group-management"
import { ThemeProvider } from "@/components/theme-provider"
import { BottomNavigation } from "@/components/bottom-navigation"
import type { Task, CollaborativeTask, GroupProject } from "@/types/collaboration"
import { CalendarView } from "@/components/calendar-view"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { StudentProfileComponent } from "@/components/student-profile"

export default function StudyTracker() {
  const [activeTab, setActiveTab] = useState<"home" | "calendar" | "pomodoro" | "profile">("home")
  const [studentProfile, setStudentProfile] = useLocalStorage<StudentProfile | null>("student-profile", null)
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", [])
  const [collaborativeTasks, setCollaborativeTasks] = useLocalStorage<CollaborativeTask[]>("collaborative-tasks", [])
  const [projects, setProjects] = useLocalStorage<GroupProject[]>("group-projects", [])
  const [selectedProject, setSelectedProject] = useLocalStorage<GroupProject | null>("selected-project", null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showGroups, setShowGroups] = useState(false)

  useEffect(() => {
    // Clear any corrupted localStorage data on startup
    clearCorruptedLocalStorage()
    
    const timer = setTimeout(() => {
      if (!studentProfile) {
        setShowOnboarding(true)
      }
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, []) // Remove studentProfile dependency to prevent infinite loops

  const handleOnboardingComplete = (profile: StudentProfile) => {
    setStudentProfile(profile)
    setShowOnboarding(false)
  }

  const addTask = (task: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      duration: task.duration || 60, // Default to 60 minutes if not provided
    }
    setTasks((prev) => [...prev, newTask])
  }

  const addCollaborativeTask = (task: Omit<CollaborativeTask, "id" | "createdAt" | "createdBy" | "comments">) => {
    const newTask: CollaborativeTask = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      createdBy: "current-user",
      comments: [],
      duration: task.duration || 60, // Default to 60 minutes if not provided
    }
    setCollaborativeTasks((prev) => [...prev, newTask])
  }

  const updateCollaborativeTask = (id: string, updates: Partial<CollaborativeTask>) => {
    setCollaborativeTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...updates } : task)))
  }

  const deleteCollaborativeTask = (id: string) => {
    setCollaborativeTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...updates } : task)))
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const handleUpdateProject = (updatedProject: GroupProject) => {
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)))
    if (selectedProject?.id === updatedProject.id) {
      setSelectedProject(updatedProject)
    }
  }

  const handleSelectProject = (project: GroupProject | null) => {
    setSelectedProject(project)
    setShowGroups(false) // Close groups view when project is selected
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case "home":
        if (showGroups) {
          return (
            <GroupManagement
              onSelectProject={handleSelectProject}
              selectedProject={selectedProject}
              projects={projects}
              onUpdateProjects={setProjects}
              onBack={() => setShowGroups(false)}
            />
          )
        }
        return (
          <UnifiedTaskDashboard
            individualTasks={tasks}
            collaborativeTasks={collaborativeTasks}
            projects={projects}
            onAddIndividualTask={addTask}
            onUpdateIndividualTask={updateTask}
            onDeleteIndividualTask={deleteTask}
            onAddCollaborativeTask={addCollaborativeTask}
            onUpdateCollaborativeTask={updateCollaborativeTask}
            onDeleteCollaborativeTask={deleteCollaborativeTask}
            onShowGroups={() => setShowGroups(true)}
          />
        )
      case "calendar":
        return <CalendarView tasks={[...tasks, ...collaborativeTasks]} />
      case "pomodoro":
        return <PomodoroTimer />
      case "profile":
        return (
          <StudentProfileComponent
            profile={studentProfile || { name: "", course: "", year: "", university: "" }}
            onUpdateProfile={setStudentProfile}
          />
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
              />
            </div>
            <h2 className="text-xl font-semibold">StudyTracker</h2>
            <p className="text-muted-foreground">Loading your study companion...</p>
          </motion.div>
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        <AnimatePresence>
          {showOnboarding && <StudentOnboarding onComplete={handleOnboardingComplete} />}
        </AnimatePresence>

        <main className="pb-20 px-4 pt-0 max-w-md mx-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderActiveTab()}
          </motion.div>
        </main>

        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </ThemeProvider>
  )
}
