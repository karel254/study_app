"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, AlertTriangle, CheckCircle2, Clock, ArrowLeft, Users } from "lucide-react"
import type { CollaborativeTask, GroupProject } from "@/types/collaboration"
import { CollaborativeAddTaskForm } from "./collaborative-add-task-form"
import { CollaborativeTaskItem } from "./collaborative-task-item"
import { isWithinInterval, subDays, startOfDay } from "date-fns"

interface CollaborativeTaskListProps {
  tasks: CollaborativeTask[]
  project: GroupProject
  onAddTask: (task: Omit<CollaborativeTask, "id" | "createdAt" | "createdBy" | "comments">) => void
  onUpdateTask: (id: string, updates: Partial<CollaborativeTask>) => void
  onDeleteTask: (id: string) => void
  onBackToProjects: () => void
}

type FilterType = "all" | "pending" | "completed" | "upcoming" | "assigned-to-me"

export function CollaborativeTaskList({
  tasks,
  project,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onBackToProjects,
}: CollaborativeTaskListProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [filter, setFilter] = useState<FilterType>("all")

  const currentUserId = "current-user"
  const projectTasks = tasks.filter((task) => task.projectId === project.id)

  const { upcomingTasks, filteredTasks, completedCount, pendingCount, myTasksCount } = useMemo(() => {
    const now = new Date()
    const threeDaysFromNow = subDays(startOfDay(now), -3)

    const upcoming = projectTasks.filter((task) => {
      if (task.completed) return false
      const deadline = new Date(task.deadline)
      return isWithinInterval(deadline, { start: startOfDay(now), end: threeDaysFromNow })
    })

    const myTasks = projectTasks.filter(
      (task) => task.assignedTo?.includes(currentUserId) || task.createdBy === currentUserId,
    )

    let filtered = projectTasks
    switch (filter) {
      case "pending":
        filtered = projectTasks.filter((task) => !task.completed)
        break
      case "completed":
        filtered = projectTasks.filter((task) => task.completed)
        break
      case "upcoming":
        filtered = upcoming
        break
      case "assigned-to-me":
        filtered = myTasks
        break
      default:
        filtered = projectTasks
    }

    // Sort by priority, then deadline, then creation date
    filtered = filtered.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }

      const priorityOrder = { high: 3, medium: 2, low: 1 }
      if (a.priority !== b.priority) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }

      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    })

    return {
      upcomingTasks: upcoming,
      filteredTasks: filtered,
      completedCount: projectTasks.filter((t) => t.completed).length,
      pendingCount: projectTasks.filter((t) => !t.completed).length,
      myTasksCount: myTasks.length,
    }
  }, [projectTasks, filter, currentUserId])

  const filterOptions = [
    { value: "all" as const, label: "All", count: projectTasks.length },
    { value: "assigned-to-me" as const, label: "My Tasks", count: myTasksCount },
    { value: "pending" as const, label: "Pending", count: pendingCount },
    { value: "upcoming" as const, label: "Due Soon", count: upcomingTasks.length },
    { value: "completed" as const, label: "Completed", count: completedCount },
  ]

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBackToProjects} className="rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
            <h1 className="text-2xl font-bold text-balance">{project.name}</h1>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <p className="text-muted-foreground">
              {pendingCount} pending • {completedCount} completed
            </p>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{project.members.length}</span>
            </div>
          </div>
          <Button onClick={() => setShowAddForm(true)} size="sm" className="rounded-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Team Members */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Team:</span>
          <div className="flex -space-x-2">
            {project.members.slice(0, 4).map((member) => (
              <Avatar key={member.id} className="w-8 h-8 border-2 border-background">
                <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
              </Avatar>
            ))}
            {project.members.length > 4 && (
              <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                <span className="text-xs text-muted-foreground">+{project.members.length - 4}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Tasks Alert */}
      {upcomingTasks.length > 0 && filter !== "upcoming" && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <div className="flex-1">
                  <p className="font-medium text-orange-900 dark:text-orange-100">
                    {upcomingTasks.length} task{upcomingTasks.length > 1 ? "s" : ""} due soon
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">Team deadlines approaching</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilter("upcoming")}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900/50"
                >
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {filterOptions.map((option) => (
          <Button
            key={option.value}
            variant={filter === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(option.value)}
            className="rounded-full whitespace-nowrap"
          >
            {option.label}
            {option.count > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {option.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                {filter === "completed" ? (
                  <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                ) : (
                  <Clock className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <h3 className="font-medium text-muted-foreground mb-2">
                {filter === "completed"
                  ? "No completed tasks yet"
                  : filter === "upcoming"
                    ? "No upcoming deadlines"
                    : filter === "assigned-to-me"
                      ? "No tasks assigned to you"
                      : filter === "pending"
                        ? "No pending tasks"
                        : "No tasks yet"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {filter === "all" || filter === "pending"
                  ? "Add your first team task to get started"
                  : "Tasks will appear here when available"}
              </p>
            </motion.div>
          ) : (
            filteredTasks.map((task, index) => (
              <CollaborativeTaskItem
                key={task.id}
                task={task}
                project={project}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
                index={index}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add Task Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <CollaborativeAddTaskForm
            project={project}
            onSubmit={(task) => {
              onAddTask(task)
              setShowAddForm(false)
            }}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
