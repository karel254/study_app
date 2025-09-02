"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Users, Calendar, MoreVertical, Edit, Trash2, ArrowLeft, ListTodo } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { GroupProject, GroupMember, CollaborativeTask } from "@/types/collaboration"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CollaborativeAddTaskForm } from "./collaborative-add-task-form"

const PROJECT_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Violet
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#84CC16", // Lime
]

interface GroupManagementProps {
  onSelectProject: (project: GroupProject | null) => void
  selectedProject: GroupProject | null
  projects: GroupProject[]
  onUpdateProjects: (projects: GroupProject[]) => void
  onBack?: () => void
  onAddCollaborativeTask: (task: Omit<CollaborativeTask, "id" | "createdAt" | "createdBy" | "comments">) => void
  collaborativeTasks: CollaborativeTask[]
}

export function GroupManagement({
  onSelectProject,
  selectedProject,
  projects,
  onUpdateProjects,
  onBack,
  onAddCollaborativeTask,
  collaborativeTasks,
}: GroupManagementProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingProject, setEditingProject] = useState<GroupProject | null>(null)
  const [showAddTaskForm, setShowAddTaskForm] = useState<GroupProject | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: PROJECT_COLORS[0],
    duration: 60, // Default 1 hour in minutes
    taskType: "Project" as "Assignment" | "Exam" | "Project",
    deadline: "", // ISO string format
  })

  const currentUser: GroupMember = {
    id: "current-user",
    name: "You",
    email: "user@example.com",
    role: "owner",
    joinedAt: new Date().toISOString(),
  }

  const handleCreateProject = () => {
    if (!formData.name.trim()) return

    const newProject: GroupProject = {
      id: crypto.randomUUID(),
      name: formData.name,
      description: formData.description,
      color: formData.color,
      duration: formData.duration,
      taskType: formData.taskType,
      deadline: formData.deadline,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      members: [currentUser],
      ownerId: currentUser.id,
      settings: {
        allowMemberInvites: true,
        taskVisibility: "all",
        deadlineNotifications: true,
      },
    }

    onUpdateProjects([...projects, newProject])
    
    // Automatically create initial team tasks for the new project
    const initialTasks = [
      {
        title: `${formData.name} - Planning Phase`,
        description: `Initial planning and setup for ${formData.name}`,
        deadline: formData.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        duration: formData.duration || 60,
        type: formData.taskType as "Assignment" | "Exam" | "Project",
        completed: false,
        projectId: newProject.id,
        priority: "high" as const,
        assignedTo: [],
      },
      {
        title: `${formData.name} - Research`,
        description: `Research and gather information for ${formData.name}`,
        deadline: formData.deadline || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        duration: formData.duration || 120,
        type: formData.taskType as "Assignment" | "Exam" | "Project",
        completed: false,
        projectId: newProject.id,
        priority: "medium" as const,
        assignedTo: [],
      }
    ]
    
    // Add the initial tasks
    initialTasks.forEach(task => onAddCollaborativeTask(task))
    
    setFormData({ name: "", description: "", color: PROJECT_COLORS[0], duration: 60, taskType: "Project", deadline: "" })
    setShowCreateForm(false)
  }

  const handleEditProject = (project: GroupProject) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description,
      color: project.color,
      duration: project.duration || 60,
      taskType: project.taskType || "Project",
      deadline: project.deadline || "",
    })
    setShowCreateForm(true)
  }

  const handleUpdateProject = () => {
    if (!editingProject || !formData.name.trim()) return

    const updatedProject: GroupProject = {
      ...editingProject,
      name: formData.name,
      description: formData.description,
      color: formData.color,
      duration: formData.duration,
      taskType: formData.taskType,
      deadline: formData.deadline,
      updatedAt: new Date().toISOString(),
    }

    onUpdateProjects(projects.map((p) => (p.id === updatedProject.id ? updatedProject : p)))
    
    // Update related collaborative tasks if project name or type changes
    if (editingProject.name !== formData.name || editingProject.taskType !== formData.taskType) {
      // This will trigger a re-render of the dashboard with updated task information
      // The dashboard's useMemo will automatically recalculate stats
    }
    
    setFormData({ name: "", description: "", color: PROJECT_COLORS[0], duration: 60, taskType: "Project", deadline: "" })
    setEditingProject(null)
    setShowCreateForm(false)
  }

  const handleDeleteProject = (projectId: string) => {
    onUpdateProjects(projects.filter((p) => p.id !== projectId))
  }

  const handleAddTask = (project: GroupProject) => {
    setShowAddTaskForm(project)
  }

  const handleTaskSubmit = (task: Omit<CollaborativeTask, "id" | "createdAt" | "createdBy" | "comments">) => {
    onAddCollaborativeTask(task)
    setShowAddTaskForm(null)
  }

  const getProjectTaskCount = (projectId: string) => {
    return collaborativeTasks.filter(task => task.projectId === projectId).length
  }

  const getProjectCompletedTaskCount = (projectId: string) => {
    return collaborativeTasks.filter(task => task.projectId === projectId && task.completed).length
  }

  const resetForm = () => {
    setFormData({ name: "", description: "", color: PROJECT_COLORS[0], duration: 60, taskType: "Project", deadline: "" })
    setShowCreateForm(false)
    setEditingProject(null)
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-4 sm:p-6 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-4 sm:mb-6 shadow-lg">
        <div className="flex items-center space-x-3 sm:space-x-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2 text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-balance text-white">Group Projects</h1>
            <p className="text-sm sm:text-base text-white/80">Manage your team projects and collaborations</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="rounded-full bg-white/20 border-white/30 text-white hover:bg-white/30 text-xs sm:text-sm px-3 sm:px-4" size="sm">
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">+</span>
          </Button>
        </div>
      </div>

      {/* Selected Project Banner */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative overflow-hidden rounded-2xl p-4"
            style={{ backgroundColor: `${selectedProject.color}15` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedProject.color }} />
                <div>
                  <h3 className="font-semibold">{selectedProject.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedProject.members.length} member{selectedProject.members.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onSelectProject(null)}>
                View All
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <Card className="w-full max-w-md p-6 space-y-4 bg-gradient-to-br from-blue-50 to-white border-blue-200 shadow-xl">
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl p-4 -m-6 mb-6">
                <h3 className="text-lg font-semibold text-white">{editingProject ? "Edit Project" : "Create New Project"}</h3>
                <Button variant="ghost" size="sm" onClick={resetForm} className="text-white hover:bg-white/20">
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter project name"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Project description (optional)"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Project Color</Label>
                  <div className="flex space-x-2 mt-2">
                    {PROJECT_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setFormData((prev) => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? "border-foreground" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="taskType">Task Type</Label>
                    <Select
                      value={formData.taskType}
                      onValueChange={(value: "Assignment" | "Exam" | "Project") =>
                        setFormData((prev) => ({ ...prev, taskType: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Assignment">📝 Assignment</SelectItem>
                        <SelectItem value="Exam">📚 Exam</SelectItem>
                        <SelectItem value="Project">🚀 Project</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="15"
                      step="15"
                      value={formData.duration}
                      onChange={(e) => setFormData((prev) => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                      placeholder="60"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="deadline">Project Deadline</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button onClick={editingProject ? handleUpdateProject : handleCreateProject} className="flex-1">
                  {editingProject ? "Update Project" : "Create Project"}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects Grid */}
      <div className="grid gap-4">
        {projects.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Group Projects</h3>
            <p className="text-muted-foreground mb-4">Create your first group project to start collaborating</p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </Card>
        ) : (
          projects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`p-3 sm:p-4 cursor-pointer transition-all bg-gradient-to-br from-blue-50 to-white border-blue-200 shadow-md hover:shadow-lg ${
                  selectedProject?.id === project.id ? "ring-2 ring-blue-500 bg-blue-100" : ""
                }`}
                onClick={() => onSelectProject(project)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: project.color }} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate text-sm sm:text-base">{project.name}</h3>
                      {project.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                      )}
                      <div className="flex items-center space-x-3 sm:space-x-4 mt-2 sm:mt-3">
                        <div className="flex items-center space-x-1 text-xs sm:text-sm text-muted-foreground">
                          <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{project.members.length}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs sm:text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">{new Date(project.createdAt).toLocaleDateString()}</span>
                          <span className="sm:hidden">{new Date(project.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                      
                      {/* New Project Fields */}
                      <div className="grid grid-cols-3 gap-2 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Type</div>
                          <div className="text-xs sm:text-sm font-medium">{project.taskType}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Duration</div>
                          <div className="text-xs sm:text-sm font-medium">
                            {Math.floor(project.duration / 60)}h {(project.duration % 60)}m
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Deadline</div>
                          <div className="text-xs sm:text-sm font-medium">
                            {project.deadline ? (
                              <>
                                <span className="hidden sm:inline">{new Date(project.deadline).toLocaleDateString()}</span>
                                <span className="sm:hidden">{new Date(project.deadline).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                              </>
                            ) : "Not set"}
                          </div>
                        </div>
                      </div>

                      {/* Task Information */}
                      <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <ListTodo className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{getProjectTaskCount(project.id)} tasks</span>
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-green-600">
                              <span>✓ {getProjectCompletedTaskCount(project.id)} completed</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddTask(project)
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 sm:px-3"
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="hidden sm:inline">Add Task</span>
                            <span className="sm:hidden">+</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()} className="p-2">
                        <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditProject(project)
                        }}
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteProject(project.id)
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Task Form Modal */}
      <AnimatePresence>
        {showAddTaskForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <Card className="w-full max-w-md p-6 space-y-4 bg-gradient-to-br from-blue-50 to-white border-blue-200 shadow-xl">
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl p-4 -m-6 mb-6">
                <h3 className="text-lg font-semibold text-white">Add Task to {showAddTaskForm.name}</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowAddTaskForm(null)} className="text-white hover:bg-white/20">
                  ×
                </Button>
              </div>

              <CollaborativeAddTaskForm
                project={showAddTaskForm}
                onSubmit={handleTaskSubmit}
                onCancel={() => setShowAddTaskForm(null)}
              />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
