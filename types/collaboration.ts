export type GroupMember = {
  id: string
  name: string
  email: string
  role: "owner" | "admin" | "member"
  avatar?: string
  joinedAt: string
}

export type Task = {
  id: string
  title: string
  description: string
  deadline: string
  duration: number // Duration in minutes
  type: "Assignment" | "Exam" | "Project"
  completed: boolean
  createdAt: string
}

export type GroupProject = {
  id: string
  name: string
  description: string
  color: string
  duration: number // Duration in minutes
  taskType: "Assignment" | "Exam" | "Project"
  deadline: string // ISO string format
  createdAt: string
  updatedAt: string
  members: GroupMember[]
  ownerId: string
  settings: {
    allowMemberInvites: boolean
    taskVisibility: "all" | "assigned-only"
    deadlineNotifications: boolean
  }
}

export type CollaborativeTask = {
  id: string
  title: string
  description: string
  deadline: string
  duration: number // Duration in minutes
  type: "Assignment" | "Exam" | "Project"
  completed: boolean
  createdAt: string
  projectId?: string
  assignedTo?: string[]
  createdBy: string
  priority: "low" | "medium" | "high"
  comments: TaskComment[]
}

export type TaskComment = {
  id: string
  content: string
  authorId: string
  authorName: string
  createdAt: string
}
