"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, CheckCircle2, Clock, User, Users, Target } from "lucide-react"
import type { Task, CollaborativeTask, GroupProject } from "@/types/collaboration"
import { AddTaskForm } from "./add-task-form"
import { CollaborativeAddTaskForm } from "./collaborative-add-task-form"
import { TaskItem } from "./task-item"
import { CollaborativeTaskItem } from "./collaborative-task-item"
import { isWithinInterval, subDays, startOfDay } from "date-fns"

interface UnifiedTaskDashboardProps {
  individualTasks: Task[]
  collaborativeTasks: CollaborativeTask[]
  projects: GroupProject[]
  onAddIndividualTask: (task: Omit<Task, "id" | "createdAt">) => void
  onUpdateIndividualTask: (id: string, updates: Partial<Task>) => void
  onDeleteIndividualTask: (id: string) => void
  onAddCollaborativeTask: (task: Omit<CollaborativeTask, "id" | "createdAt" | "createdBy" | "comments">) => void
  onUpdateCollaborativeTask: (id: string, updates: Partial<CollaborativeTask>) => void
  onDeleteCollaborativeTask: (id: string) => void
  onShowGroups: () => void
}

type FilterType = "all" | "personal" | "collaborative" | "pending" | "completed" | "upcoming" | "high-priority" | "project"
type TaskWithType = (Task & { type: "individual" }) | (CollaborativeTask & { type: "collaborative" })

export function UnifiedTaskDashboard({
  individualTasks,
  collaborativeTasks,
  projects,
  onAddIndividualTask,
  onUpdateIndividualTask,
  onDeleteIndividualTask,
  onAddCollaborativeTask,
  onUpdateCollaborativeTask,
  onDeleteCollaborativeTask,
  onShowGroups,
}: UnifiedTaskDashboardProps) {
  const [showAddForm, setShowAddForm] = useState<"individual" | "collaborative" | null>(null)
  const [selectedProject, setSelectedProject] = useState<GroupProject | null>(null)
  const [filter, setFilter] = useState<FilterType>("all")
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string | null>(null)

  const allTasks: TaskWithType[] = useMemo(() => {
    const individual: TaskWithType[] = individualTasks.map((task) => ({ ...task, type: "individual" as const }))
    const collaborative: TaskWithType[] = collaborativeTasks.map((task) => ({
      ...task,
      type: "collaborative" as const,
    }))
    return [...individual, ...collaborative]
  }, [individualTasks, collaborativeTasks])

  const { upcomingTasks, filteredTasks, stats } = useMemo(() => {
    const now = new Date()
    const threeDaysFromNow = subDays(startOfDay(now), -3)

    const upcoming = allTasks.filter((task) => {
      if (task.completed) return false
      const deadline = new Date(task.deadline)
      return isWithinInterval(deadline, { start: startOfDay(now), end: threeDaysFromNow })
    })

    let filtered: TaskWithType[] = allTasks
    switch (filter) {
      case "personal":
        filtered = allTasks.filter((task) => task.type === "individual")
        break
      case "collaborative":
        filtered = allTasks.filter((task) => task.type === "collaborative")
        break
      case "pending":
        filtered = allTasks.filter((task) => !task.completed)
        break
      case "completed":
        filtered = allTasks.filter((task) => task.completed)
        break
      case "upcoming":
        filtered = upcoming
        break
      case "high-priority":
        filtered = allTasks.filter(
          (task) => task.type === "collaborative" && (task as CollaborativeTask).priority === "high",
        )
        break
      case "project":
        if (selectedProjectFilter) {
          filtered = allTasks.filter((task) => 
            task.type === "collaborative" && 
            (task as CollaborativeTask).projectId === selectedProjectFilter
          )
        }
        break
      default:
        filtered = allTasks
    }

    // Sort by completion status, then priority (for collaborative), then deadline
    filtered = filtered.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }

      // Priority sorting for collaborative tasks
      if (a.type === "collaborative" && b.type === "collaborative") {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        const aPriority = (a as CollaborativeTask).priority
        const bPriority = (b as CollaborativeTask).priority
        if (aPriority !== bPriority) {
          return priorityOrder[bPriority] - priorityOrder[aPriority]
        }
      }

      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    })

    const stats = {
      total: allTasks.length,
      personal: individualTasks.length,
      collaborative: collaborativeTasks.length,
      completed: allTasks.filter((t) => t.completed).length,
      pending: allTasks.filter((t) => !t.completed).length,
      upcoming: upcoming.length,
      highPriority: collaborativeTasks.filter((t) => t.priority === "high" && !t.completed).length,
      
      // Detailed breakdowns
      personalPending: individualTasks.filter((t) => !t.completed).length,
      collaborativePending: collaborativeTasks.filter((t) => !t.completed).length,
      completedPersonal: individualTasks.filter((t) => t.completed).length,
      completedTeam: collaborativeTasks.filter((t) => t.completed).length,
      upcomingPersonal: upcoming.filter((t) => t.type === "individual").length,
      upcomingTeam: upcoming.filter((t) => t.type === "collaborative").length,
      
      // Project-based stats
      projectsWithTasks: projects.filter(p => 
        collaborativeTasks.some(t => t.projectId === p.id)
      ).length,
      totalProjects: projects.length,
    }

    return { upcomingTasks: upcoming, filteredTasks: filtered, stats }
  }, [allTasks, filter, individualTasks.length, collaborativeTasks.length])

  const filterOptions = [
    { value: "all" as const, label: "All Tasks", count: stats.total, icon: Target },
    { value: "personal" as const, label: "Personal", count: stats.personal, icon: User },
    { value: "collaborative" as const, label: "Team", count: stats.collaborative, icon: Users },
    { value: "pending" as const, label: "Pending", count: stats.pending, icon: Clock },
    { value: "upcoming" as const, label: "Due Soon", count: stats.upcoming, icon: AlertTriangle },
    { value: "high-priority" as const, label: "High Priority", count: stats.highPriority, icon: AlertTriangle },
    { value: "completed" as const, label: "Completed", count: stats.completed, icon: CheckCircle2 },
  ]

  const getProjectForTask = (task: CollaborativeTask) => {
    return projects.find((p) => p.id === task.projectId)
  }

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
      {/* Sticky Header - Only the title and action buttons */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b pb-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-balance">All Tasks</h1>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => setShowAddForm("individual")} size="sm" variant="outline" className="rounded-full">
              <User className="w-4 h-4 mr-2" />
              Personal
            </Button>
            <Button onClick={onShowGroups} size="sm" variant="outline" className="rounded-full">
              <Users className="w-4 h-4 mr-2" />
              Groups
            </Button>
          </div>
          </div>
        </div>

      {/* Quick Stats Cards - Regular scrollable content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Tasks</p>
                <p className="text-xs text-blue-600">
                  {stats.personal} personal • {stats.collaborative} team
                </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xs text-orange-600">
                  {stats.personalPending} personal • {stats.collaborativePending} team
                </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.upcoming}</p>
                  <p className="text-xs text-muted-foreground">Due Soon</p>
                <p className="text-xs text-red-600">
                  {stats.upcomingPersonal} personal • {stats.upcomingTeam} team
                </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-xs text-green-600">
                  {stats.completedPersonal} personal • {stats.completedTeam} team
                </p>
                </div>
              </div>
            </CardContent>
          </Card>
      </div>

      {/* Project-based Stats */}
      {projects.length > 0 && (
        <Card className="bg-card/50 backdrop-blur border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Team Projects Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => {
                const projectTasks = collaborativeTasks.filter(task => task.projectId === project.id)
                const completedTasks = projectTasks.filter(task => task.completed).length
                const pendingTasks = projectTasks.filter(task => !task.completed).length
                const overdueTasks = projectTasks.filter(task => {
                  if (task.completed) return false
                  const deadline = new Date(task.deadline)
                  return deadline < new Date()
                }).length

                return (
                  <div key={project.id} className="p-3 rounded-lg border bg-background/50">
                    <div className="flex items-center space-x-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: project.color }}
                      />
                      <h4 className="font-medium text-sm">{project.name}</h4>
                    </div>
                    
                    {/* Project Type and Duration */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>{project.taskType || "Project"}</span>
                      <span>{Math.floor((project.duration || 60) / 60)}h {(project.duration || 60) % 60}m</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-bold text-blue-600">{projectTasks.length}</div>
                        <div className="text-muted-foreground">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-orange-600">{pendingTasks}</div>
                        <div className="text-muted-foreground">Pending</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-green-600">{completedTasks}</div>
                        <div className="text-muted-foreground">Done</div>
                      </div>
                    </div>
                    
                    {/* Project Deadline */}
                    {(project.deadline || project.taskType) && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        {project.deadline && (
                          <div className="text-xs text-muted-foreground text-center">
                            Due: {new Date(project.deadline).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {overdueTasks > 0 && (
                      <div className="mt-2 text-center">
                        <div className="text-xs text-red-600 font-medium">
                          ⚠️ {overdueTasks} overdue
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Task Summary */}
      {collaborativeTasks.length > 0 && (
        <Card className="bg-card/50 backdrop-blur border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Team Tasks Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <div className="text-2xl font-bold text-blue-600">{stats.collaborative}</div>
                <div className="text-sm text-muted-foreground">Total Team Tasks</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30">
                <div className="text-2xl font-bold text-orange-600">{stats.collaborativePending}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
                <div className="text-2xl font-bold text-green-600">{stats.completedTeam}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/30">
                <div className="text-2xl font-bold text-red-600">{stats.highPriority}</div>
                <div className="text-sm text-muted-foreground">High Priority</div>
        </div>
      </div>
            
            {/* Progress Bar */}
            {stats.collaborative > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Team Progress</span>
                  <span>{Math.round((stats.completedTeam / stats.collaborative) * 100)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(stats.completedTeam / stats.collaborative) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Tasks Alert */}
      {stats.upcoming > 0 && filter !== "upcoming" && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <div className="flex-1">
                  <p className="font-medium text-orange-900 dark:text-orange-100">
                    {stats.upcoming} task{stats.upcoming > 1 ? "s" : ""} due within 3 days
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">Review your upcoming deadlines</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilter("upcoming")}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900/50"
                >
                  View All
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filter Tabs - Regular scrollable content */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {filterOptions.map((option) => {
          const Icon = option.icon
          return (
            <Button
              key={option.value}
              variant={filter === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(option.value)}
              className="rounded-full whitespace-nowrap"
            >
              <Icon className="w-4 h-4 mr-2" />
              {option.label}
              {option.count > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {option.count}
                </Badge>
              )}
            </Button>
          )
        })}
        
        {/* Project-specific filters */}
        {projects.length > 0 && (
          <>
            <Separator orientation="vertical" className="h-8" />
            {projects.map((project) => {
              const projectTasks = collaborativeTasks.filter(task => task.projectId === project.id)
              const isActive = filter === "project" && selectedProjectFilter === project.id
              
              return (
                <Button
                  key={project.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setFilter("project")
                    setSelectedProjectFilter(project.id)
                  }}
                  className="rounded-full whitespace-nowrap"
                >
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: project.color }}
                  />
                  {project.name}
                  {projectTasks.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {projectTasks.length}
                    </Badge>
                  )}
                </Button>
              )
            })}
            
            {/* Clear Project Filter */}
            {(filter === "project" && selectedProjectFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilter("all")
                  setSelectedProjectFilter(null)
                }}
                className="rounded-full text-muted-foreground hover:text-foreground"
              >
                Clear Filter
              </Button>
            )}
          </>
        )}
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-muted-foreground mb-2">No tasks found</h3>
              <p className="text-sm text-muted-foreground">
                {filter === "all" ? "Add your first task to get started" : "No tasks match the current filter"}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {/* Personal Tasks Section - Only show when there are personal tasks in filtered results */}
              {filteredTasks.filter((task) => task.type === "individual").length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <h3 className="font-medium text-muted-foreground">Personal Tasks</h3>
                      <Separator className="flex-1" />
                    </div>
                  {filteredTasks
                    .filter((task) => task.type === "individual")
                    .map((task, index) => (
                      <TaskItem
                        key={task.id}
                        task={task as Task}
                        onUpdate={onUpdateIndividualTask}
                        onDelete={onDeleteIndividualTask}
                        index={index}
                      />
                    ))}
                </div>
              )}

              {/* Collaborative Tasks Section - Only show when there are team tasks in filtered results */}
              {filteredTasks.filter((task) => task.type === "collaborative").length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-medium text-muted-foreground">
                      {filter === "project" && selectedProjectFilter 
                        ? `Team Tasks - ${projects.find(p => p.id === selectedProjectFilter)?.name}`
                        : "Team Tasks"
                      }
                    </h3>
                        <Separator className="flex-1" />
                      </div>
                  {filteredTasks
                    .filter((task) => task.type === "collaborative")
                    .map((task, index) => {
                      const project = getProjectForTask(task as CollaborativeTask)
                      if (!project) return null

                      return (
                        <div key={task.id} className="space-y-2">
                          {/* Project Context */}
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground ml-4">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                            <span>{project.name}</span>
                            <div className="flex -space-x-1">
                              {project.members.slice(0, 3).map((member) => (
                                <Avatar key={member.id} className="w-5 h-5 border border-background">
                                  <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                          </div>
                          <CollaborativeTaskItem
                            task={task as CollaborativeTask}
                            project={project}
                            onUpdate={onUpdateCollaborativeTask}
                            onDelete={onDeleteCollaborativeTask}
                            index={index}
                          />
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Task Forms */}
      <AnimatePresence>
        {showAddForm === "individual" && (
          <AddTaskForm
            onSubmit={(task) => {
              onAddIndividualTask(task)
              setShowAddForm(null)
            }}
            onCancel={() => setShowAddForm(null)}
          />
        )}
        {showAddForm === "collaborative" && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <CardHeader>
                <CardTitle>Select Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {projects.map((project) => (
                  <Button
                    key={project.id}
                    variant="outline"
                    className="w-full justify-start h-auto p-4 bg-transparent"
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color }} />
                      <div className="text-left">
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">{project.members.length} members</p>
                      </div>
                    </div>
                  </Button>
                ))}
                <Button variant="ghost" onClick={() => setShowAddForm(null)} className="w-full">
                  Cancel
                </Button>
              </CardContent>
            </motion.div>
          </div>
        )}
        {selectedProject && (
          <CollaborativeAddTaskForm
            project={selectedProject}
            onSubmit={(task) => {
              onAddCollaborativeTask(task)
              setShowAddForm(null)
              setSelectedProject(null)
            }}
            onCancel={() => {
              setShowAddForm(null)
              setSelectedProject(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
