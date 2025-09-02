"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  CheckCircle2,
  MoreVertical,
  Edit3,
  Trash2,
  Calendar,
  AlertTriangle,
  Flag,
  MessageCircle,
  User,
} from "lucide-react"
import type { CollaborativeTask, GroupProject } from "@/types/collaboration"
import { formatDistanceToNow, isPast, isWithinInterval, subDays, startOfDay } from "date-fns"

interface CollaborativeTaskItemProps {
  task: CollaborativeTask
  project: GroupProject
  onUpdate: (id: string, updates: Partial<CollaborativeTask>) => void
  onDelete: (id: string) => void
  index: number
}

export function CollaborativeTaskItem({ task, project, onUpdate, onDelete, index }: CollaborativeTaskItemProps) {
  const [isCompleting, setIsCompleting] = useState(false)

  const deadline = new Date(task.deadline)
  const now = new Date()
  const isOverdue = isPast(deadline) && !task.completed
  const isDueSoon =
    isWithinInterval(deadline, {
      start: startOfDay(now),
      end: subDays(startOfDay(now), -3),
    }) && !task.completed

  const currentUserId = "current-user"
  const isAssignedToMe = task.assignedTo?.includes(currentUserId) || task.createdBy === currentUserId
  const assignedMembers = task.assignedTo
    ? project.members.filter((member) => task.assignedTo!.includes(member.id))
    : []

  const handleToggleComplete = async () => {
    setIsCompleting(true)
    setTimeout(() => {
      onUpdate(task.id, { completed: !task.completed })
      setIsCompleting(false)
    }, 300)
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

  const getDeadlineColor = () => {
    if (task.completed) return "text-muted-foreground"
    if (isOverdue) return "text-destructive"
    if (isDueSoon) return "text-orange-600 dark:text-orange-400"
    return "text-muted-foreground"
  }

  const getCardBorder = () => {
    if (task.completed) return "border-green-200 dark:border-green-800"
    if (isOverdue) return "border-destructive/50"
    if (isDueSoon) return "border-orange-200 dark:border-orange-800"
    if (isAssignedToMe) return "border-primary/30"
    return "border-border"
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      <Card
        className={`transition-all duration-200 ${getCardBorder()} ${
          task.completed ? "bg-muted/30" : "bg-card hover:shadow-md"
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            {/* Checkbox */}
            <div className="pt-1">
              <motion.div animate={isCompleting ? { scale: 0.8 } : { scale: 1 }} transition={{ duration: 0.2 }}>
                <Checkbox checked={task.completed} onCheckedChange={handleToggleComplete} className="rounded-full" />
              </motion.div>
            </div>

            {/* Task Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3
                      className={`font-medium text-balance ${
                        task.completed ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {task.title}
                    </h3>
                    {isAssignedToMe && !task.completed && (
                      <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                        <User className="w-3 h-3 mr-1" />
                        Mine
                      </Badge>
                    )}
                  </div>
                  {task.description && (
                    <p className={`text-sm mt-1 ${task.completed ? "text-muted-foreground" : "text-muted-foreground"}`}>
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onUpdate(task.id, { completed: !task.completed })}>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {task.completed ? "Mark Pending" : "Mark Complete"}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Add Comment
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(task.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Task Meta */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="text-xs">
                    {getTaskTypeIcon(task.type)} {task.type}
                  </Badge>

                  <div className="flex items-center space-x-1">
                    <Flag className={`w-3 h-3 ${getPriorityColor(task.priority)}`} />
                    <span className={`text-xs capitalize ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                  </div>

                  <div className={`flex items-center space-x-1 text-xs ${getDeadlineColor()}`}>
                    {isOverdue && !task.completed ? (
                      <AlertTriangle className="w-3 h-3" />
                    ) : (
                      <Calendar className="w-3 h-3" />
                    )}
                    <span>
                      {isOverdue && !task.completed
                        ? "Overdue"
                        : task.completed
                          ? "Completed"
                          : formatDistanceToNow(deadline, { addSuffix: true })}
                    </span>
                  </div>

                  {/* Duration */}
                  {task.duration && (
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <span>⏱️</span>
                      <span>
                        {Math.floor(task.duration / 60)}h {task.duration % 60}m
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {/* Assigned Members */}
                  {assignedMembers.length > 0 && (
                    <div className="flex -space-x-1">
                      {assignedMembers.slice(0, 3).map((member) => (
                        <Avatar key={member.id} className="w-6 h-6 border-2 border-background">
                          <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                      ))}
                      {assignedMembers.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">+{assignedMembers.length - 3}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Comments Count */}
                  {task.comments.length > 0 && (
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <MessageCircle className="w-3 h-3" />
                      <span>{task.comments.length}</span>
                    </div>
                  )}

                  {task.completed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-600 dark:text-green-400"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
