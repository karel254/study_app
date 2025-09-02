"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, CheckCircle2, AlertTriangle, Clock, Users } from "lucide-react"
import type { Task } from "@/app/page"
import type { CollaborativeTask } from "@/types/collaboration"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isPast,
  isWithinInterval,
  subDays,
  startOfDay,
} from "date-fns"

type CalendarTask = Task | CollaborativeTask

interface CalendarViewProps {
  tasks: CalendarTask[]
}

export function CalendarView({ tasks }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, CalendarTask[]> = {}

    tasks.forEach((task) => {
      const dateKey = format(new Date(task.deadline), "yyyy-MM-dd")
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(task)
    })

    return grouped
  }, [tasks])

  // Get tasks for selected date
  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return []
    const dateKey = format(selectedDate, "yyyy-MM-dd")
    return tasksByDate[dateKey] || []
  }, [selectedDate, tasksByDate])

  const getTasksForDate = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd")
    return tasksByDate[dateKey] || []
  }

  const getDateStatus = (date: Date, dateTasks: CalendarTask[]) => {
    if (dateTasks.length === 0) return null

    const now = new Date()
    const hasOverdue = dateTasks.some((task) => !task.completed && isPast(new Date(task.deadline)))
    const hasDueSoon = dateTasks.some((task) => {
      if (task.completed) return false
      const deadline = new Date(task.deadline)
      return isWithinInterval(deadline, {
        start: startOfDay(now),
        end: subDays(startOfDay(now), -3),
      })
    })
    const hasCompleted = dateTasks.some((task) => task.completed)
    const allCompleted = dateTasks.every((task) => task.completed)

    if (hasOverdue) return "overdue"
    if (hasDueSoon) return "due-soon"
    if (allCompleted) return "completed"
    if (hasCompleted) return "partial"
    return "pending"
  }

  const getDateIndicatorColor = (status: string | null) => {
    switch (status) {
      case "overdue":
        return "bg-destructive"
      case "due-soon":
        return "bg-orange-500"
      case "completed":
        return "bg-green-500"
      case "partial":
        return "bg-blue-500"
      case "pending":
        return "bg-primary"
      default:
        return ""
    }
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => (direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1)))
    setSelectedDate(null)
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(isSameDay(date, selectedDate || new Date("1900-01-01")) ? null : date)
  }

  const getTaskTypeIcon = (type: CalendarTask["type"]) => {
    switch (type) {
      case "Assignment":
        return "📝"
      case "Exam":
        return "📚"
      case "Project":
        return "🚀"
      default:
        return "📋"
    }
  }

  const isCollaborativeTask = (task: CalendarTask): task is CollaborativeTask => {
    return "projectId" in task
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-4 sm:p-6 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-4 sm:mb-6 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Calendar View</h1>
          <p className="text-sm sm:text-base text-white/80">Track your tasks and deadlines across time</p>
        </div>
      </div>

      {/* Calendar Card */}
      <Card className="bg-card/50 backdrop-blur border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-center">{format(currentDate, "MMMM yyyy")}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date) => {
              const dateTasks = getTasksForDate(date)
              const status = getDateStatus(date, dateTasks)
              const isCurrentMonth = isSameMonth(date, currentDate)
              const isTodayDate = isToday(date)
              const isSelected = selectedDate && isSameDay(date, selectedDate)

              return (
                <motion.button
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  className={`
                    relative aspect-square p-1 rounded-lg text-sm font-medium transition-colors
                    ${isCurrentMonth ? "text-foreground" : "text-muted-foreground"}
                    ${isTodayDate ? "bg-primary text-primary-foreground" : ""}
                    ${isSelected ? "bg-accent text-accent-foreground" : ""}
                    ${!isTodayDate && !isSelected ? "hover:bg-muted" : ""}
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{format(date, "d")}</span>

                  {/* Task Indicators */}
                  {dateTasks.length > 0 && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${getDateIndicatorColor(status)}`} />
                      {dateTasks.length > 1 && (
                        <div className={`w-1.5 h-1.5 rounded-full ${getDateIndicatorColor(status)} opacity-60`} />
                      )}
                      {dateTasks.length > 2 && (
                        <div className={`w-1.5 h-1.5 rounded-full ${getDateIndicatorColor(status)} opacity-30`} />
                      )}
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="bg-card/50 backdrop-blur border-0 shadow-lg">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Overdue</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-muted-foreground">Due Soon</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">Pending</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Completed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Tasks */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className="bg-card/50 backdrop-blur border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
                </CardTitle>
                <CardDescription>
                  {selectedDateTasks.length === 0
                    ? "No tasks scheduled for this date"
                    : `${selectedDateTasks.length} task${selectedDateTasks.length > 1 ? "s" : ""} scheduled`}
                </CardDescription>
              </CardHeader>

              {selectedDateTasks.length > 0 && (
                <CardContent>
                  <div className="space-y-3">
                    {selectedDateTasks.map((task, index) => {
                      const deadline = new Date(task.deadline)
                      const isOverdue = isPast(deadline) && !task.completed
                      const isDueSoon =
                        isWithinInterval(deadline, {
                          start: startOfDay(new Date()),
                          end: subDays(startOfDay(new Date()), -3),
                        }) && !task.completed

                      return (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`
                            p-3 rounded-xl border transition-colors
                            ${
                              task.completed
                                ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800"
                                : isOverdue
                                  ? "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800"
                                  : isDueSoon
                                    ? "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800"
                                    : "bg-muted/30 border-border"
                            }
                          `}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge variant="secondary" className="text-xs">
                                  {getTaskTypeIcon(task.type)} {task.type}
                                </Badge>
                                {isCollaborativeTask(task) && (
                                  <Badge variant="outline" className="text-xs">
                                    <Users className="w-3 h-3 mr-1" />
                                    Team
                                  </Badge>
                                )}
                                {task.completed && (
                                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                                )}
                                {isOverdue && !task.completed && <AlertTriangle className="w-4 h-4 text-destructive" />}
                                {isDueSoon && !task.completed && (
                                  <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                )}
                              </div>
                              <h4
                                className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}
                              >
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                              )}
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-muted-foreground">Due: {format(deadline, "h:mm a")}</p>
                                {isCollaborativeTask(task) && task.duration && (
                                  <p className="text-xs text-muted-foreground">
                                    Duration: {Math.floor(task.duration / 60)}h {task.duration % 60}m
                                  </p>
                                )}
                                {!isCollaborativeTask(task) && task.duration && (
                                  <p className="text-xs text-muted-foreground">
                                    Duration: {Math.floor(task.duration / 60)}h {task.duration % 60}m
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
