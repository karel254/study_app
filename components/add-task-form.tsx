"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus } from "lucide-react"
import type { Task } from "@/app/page"
import { format } from "date-fns"

interface AddTaskFormProps {
  onSubmit: (task: Omit<Task, "id" | "createdAt">) => void
  onCancel: () => void
}

export function AddTaskForm({ onSubmit, onCancel }: AddTaskFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    duration: 60, // Default 1 hour in minutes
    type: "" as Task["type"] | "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.deadline || !formData.type) return

    onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim(),
      deadline: formData.deadline,
      duration: formData.duration,
      type: formData.type as Task["type"],
      completed: false,
    })
  }

  const canSubmit = formData.title.trim() && formData.deadline && formData.type

  // Get today's date in YYYY-MM-DD format for min date
  const today = format(new Date(), "yyyy-MM-dd")

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 400, duration: 0.2 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Add New Task</CardTitle>
                <CardDescription>Create a new assignment, exam, or project</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Math Assignment 3"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="rounded-xl"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: Task["type"]) => setFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Assignment">📝 Assignment</SelectItem>
                    <SelectItem value="Exam">📚 Exam</SelectItem>
                    <SelectItem value="Project">🚀 Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline *</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
                  min={today}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData((prev) => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                  className="rounded-xl"
                  placeholder="60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add any additional details..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="rounded-xl resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-xl bg-transparent">
                  Cancel
                </Button>
                <Button type="submit" disabled={!canSubmit} className="flex-1 rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
