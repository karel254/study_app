"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, CheckCircle2, AlertTriangle, Clock, Flag, Activity } from "lucide-react"
import type { GroupProject, CollaborativeTask } from "@/types/collaboration"
import { formatDistanceToNow, isWithinInterval, subDays, startOfDay, isPast } from "date-fns"

interface CollaborationDashboardProps {
  projects: GroupProject[]
  tasks: CollaborativeTask[]
  onSelectProject: (project: GroupProject) => void
}

export function CollaborationDashboard({ projects, tasks, onSelectProject }: CollaborationDashboardProps) {
  const currentUserId = "current-user"

  const stats = useMemo(() => {
    const now = new Date()
    const threeDaysFromNow = subDays(startOfDay(now), -3)

    const myTasks = tasks.filter((task) => task.assignedTo?.includes(currentUserId) || task.createdBy === currentUserId)

    const upcomingTasks = tasks.filter((task) => {
      if (task.completed) return false
      const deadline = new Date(task.deadline)
      return isWithinInterval(deadline, { start: startOfDay(now), end: threeDaysFromNow })
    })

    const overdueTasks = tasks.filter((task) => {
      if (task.completed) return false
      return isPast(new Date(task.deadline))
    })

    const completedThisWeek = tasks.filter((task) => {
      if (!task.completed) return false
      const completedDate = new Date(task.createdAt) // Using createdAt as proxy for completion date
      const weekAgo = subDays(now, 7)
      return completedDate >= weekAgo
    })

    const highPriorityTasks = tasks.filter((task) => !task.completed && task.priority === "high")

    return {
      totalProjects: projects.length,
      totalTasks: tasks.length,
      myTasks: myTasks.length,
      completedTasks: tasks.filter((t) => t.completed).length,
      upcomingTasks: upcomingTasks.length,
      overdueTasks: overdueTasks.length,
      completedThisWeek: completedThisWeek.length,
      highPriorityTasks: highPriorityTasks.length,
      recentTasks: tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    }
  }, [projects, tasks, currentUserId])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getTaskTypeIcon = (type: CollaborativeTask["type"]) => {
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

  const getPriorityColor = (priority: CollaborativeTask["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-600 dark:text-red-400"
      case "medium":
        return "text-yellow-600 dark:text-yellow-400"
      case "low":
        return "text-green-600 dark:text-green-400"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-balance">Collaboration Hub</h1>
        <p className="text-muted-foreground">Overview of all your team projects and tasks</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalProjects}</p>
                <p className="text-sm text-muted-foreground">Active Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completedTasks}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.upcomingTasks}</p>
                <p className="text-sm text-muted-foreground">Due Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.myTasks}</p>
                <p className="text-sm text-muted-foreground">My Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(stats.overdueTasks > 0 || stats.highPriorityTasks > 0) && (
        <div className="space-y-3">
          {stats.overdueTasks > 0 && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <div className="flex-1">
                    <p className="font-medium text-destructive">
                      {stats.overdueTasks} overdue task{stats.overdueTasks > 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-destructive/80">Immediate attention required</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {stats.highPriorityTasks > 0 && (
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Flag className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <div className="flex-1">
                    <p className="font-medium text-red-900 dark:text-red-100">
                      {stats.highPriorityTasks} high priority task{stats.highPriorityTasks > 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">Focus on these first</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Active Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Active Projects</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No active projects</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => {
                const projectTasks = tasks.filter((task) => task.projectId === project.id)
                const completedTasks = projectTasks.filter((task) => task.completed).length
                const progress = projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0

                return (
                  <motion.div
                    key={project.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onSelectProject(project)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                        <div>
                          <h4 className="font-medium">{project.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {projectTasks.length} tasks • {project.members.length} members
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{Math.round(progress)}%</p>
                        <div className="w-16 h-2 bg-muted rounded-full mt-1">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Recent Tasks</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentTasks.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentTasks.map((task) => {
                const project = projects.find((p) => p.id === task.projectId)
                if (!project) return null

                return (
                  <div key={task.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium truncate">{task.title}</p>
                        <Badge variant="secondary" className="text-xs">
                          {getTaskTypeIcon(task.type)} {task.type}
                        </Badge>
                        <Flag className={`w-3 h-3 ${getPriorityColor(task.priority)}`} />
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-sm text-muted-foreground truncate">{project.name}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    {task.completed && <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
