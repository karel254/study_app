"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import type { Task } from "@/app/page"
import { AddTaskForm } from "./add-task-form"
import { TaskItem } from "./task-item"
import { isWithinInterval, subDays, startOfDay } from "date-fns"

interface TaskListProps {
  tasks: Task[]
  onAddTask: (task: Omit<Task, "id" | "createdAt">) => void
  onUpdateTask: (id: string, updates: Partial<Task>) => void
  onDeleteTask: (id: string) => void
}

type FilterType = "all" | "pending" | "completed" | "upcoming"

export function TaskList({ tasks, onAddTask, onUpdateTask, onDeleteTask }: TaskListProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [filter, setFilter] = useState<FilterType>("all")

  const { upcomingTasks, filteredTasks, completedCount, pendingCount } = useMemo(() => {
    const now = new Date()
    const threeDaysFromNow = subDays(startOfDay(now), -3)

    const upcoming = tasks.filter((task) => {
      if (task.completed) return false
      const deadline = new Date(task.deadline)
      return isWithinInterval(deadline, { start: startOfDay(now), end: threeDaysFromNow })
    })

    let filtered = tasks
    switch (filter) {
      case "pending":
        filtered = tasks.filter((task) => !task.completed)
        break
      case "completed":
        filtered = tasks.filter((task) => task.completed)
        break
      case "upcoming":
        filtered = upcoming
        break
      default:
        filtered = tasks
    }

    // Sort by deadline (upcoming first), then by creation date
    filtered = filtered.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    })

    return {
      upcomingTasks: upcoming,
      filteredTasks: filtered,
      completedCount: tasks.filter((t) => t.completed).length,
      pendingCount: tasks.filter((t) => !t.completed).length,
    }
  }, [tasks, filter])

  const filterOptions = [
    { value: "all" as const, label: "All", count: tasks.length },
    { value: "pending" as const, label: "Pending", count: pendingCount },
    { value: "upcoming" as const, label: "Due Soon", count: upcomingTasks.length },
    { value: "completed" as const, label: "Completed", count: completedCount },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-balance">Tasks</h1>
          <p className="text-muted-foreground">
            {pendingCount} pending • {completedCount} completed
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} size="sm" className="rounded-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
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
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Don't forget about your upcoming deadlines
                  </p>
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
                    : filter === "pending"
                      ? "No pending tasks"
                      : "No tasks yet"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {filter === "all" || filter === "pending"
                  ? "Add your first task to get started"
                  : "Tasks will appear here when available"}
              </p>
            </motion.div>
          ) : (
            filteredTasks.map((task, index) => (
              <TaskItem key={task.id} task={task} onUpdate={onUpdateTask} onDelete={onDeleteTask} index={index} />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add Task Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <AddTaskForm
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
