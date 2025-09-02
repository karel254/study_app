"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UserPlus, Mail, Crown, Shield, User, MoreVertical, Trash2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { GroupProject, GroupMember } from "@/types/collaboration"

interface MemberManagementProps {
  project: GroupProject
  onUpdateProject: (project: GroupProject) => void
}

const ROLE_ICONS = {
  owner: Crown,
  admin: Shield,
  member: User,
}

const ROLE_COLORS = {
  owner: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  admin: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  member: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
}

export function MemberManagement({ project, onUpdateProject }: MemberManagementProps) {
  const [projects, setProjects] = useLocalStorage<GroupProject[]>("group-projects", [])
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteData, setInviteData] = useState({
    email: "",
    role: "member" as GroupMember["role"],
  })
  const [copiedInvite, setCopiedInvite] = useState(false)

  const currentUserId = "current-user"
  const isOwner = project.ownerId === currentUserId
  const currentUserRole = project.members.find((m) => m.id === currentUserId)?.role || "member"
  const canManageMembers = isOwner || currentUserRole === "admin"

  const handleInviteMember = () => {
    if (!inviteData.email.trim()) return

    // Simulate sending invitation
    const newMember: GroupMember = {
      id: crypto.randomUUID(),
      name: inviteData.email.split("@")[0],
      email: inviteData.email,
      role: inviteData.role,
      joinedAt: new Date().toISOString(),
    }

    const updatedProject = {
      ...project,
      members: [...project.members, newMember],
      updatedAt: new Date().toISOString(),
    }

    // Update projects in localStorage
    setProjects((prev) => prev.map((p) => (p.id === project.id ? updatedProject : p)))
    onUpdateProject(updatedProject)

    setInviteData({ email: "", role: "member" })
    setShowInviteForm(false)
  }

  const handleRemoveMember = (memberId: string) => {
    if (memberId === project.ownerId) return // Can't remove owner

    const updatedProject = {
      ...project,
      members: project.members.filter((m) => m.id !== memberId),
      updatedAt: new Date().toISOString(),
    }

    setProjects((prev) => prev.map((p) => (p.id === project.id ? updatedProject : p)))
    onUpdateProject(updatedProject)
  }

  const handleChangeRole = (memberId: string, newRole: GroupMember["role"]) => {
    if (memberId === project.ownerId && newRole !== "owner") return // Can't change owner role

    const updatedProject = {
      ...project,
      members: project.members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)),
      updatedAt: new Date().toISOString(),
    }

    setProjects((prev) => prev.map((p) => (p.id === project.id ? updatedProject : p)))
    onUpdateProject(updatedProject)
  }

  const generateInviteLink = () => {
    const inviteLink = `${window.location.origin}/invite/${project.id}`
    navigator.clipboard.writeText(inviteLink)
    setCopiedInvite(true)
    setTimeout(() => setCopiedInvite(false), 2000)
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Team Members</h2>
          <p className="text-sm text-muted-foreground">{project.members.length} members</p>
        </div>
        {canManageMembers && (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={generateInviteLink}>
              {copiedInvite ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copiedInvite ? "Copied!" : "Copy Link"}
            </Button>
            <Button onClick={() => setShowInviteForm(true)} size="sm">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite
            </Button>
          </div>
        )}
      </div>

      {/* Invite Form */}
      <AnimatePresence>
        {showInviteForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <Card className="w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Invite Team Member</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowInviteForm(false)}>
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteData.email}
                    onChange={(e) => setInviteData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="colleague@university.edu"
                  />
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={inviteData.role}
                    onValueChange={(value: GroupMember["role"]) => setInviteData((prev) => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {inviteData.role === "admin"
                      ? "Can manage members and project settings"
                      : "Can view and edit tasks"}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button onClick={handleInviteMember} className="flex-1">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Invite
                </Button>
                <Button variant="outline" onClick={() => setShowInviteForm(false)}>
                  Cancel
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Members List */}
      <div className="space-y-3">
        {project.members.map((member) => {
          const RoleIcon = ROLE_ICONS[member.role]
          const isCurrentUser = member.id === currentUserId
          const canModifyMember = canManageMembers && !isCurrentUser && member.id !== project.ownerId

          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group"
            >
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="text-sm font-medium">{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium truncate">
                          {member.name} {isCurrentUser && "(You)"}
                        </h4>
                        <Badge variant="secondary" className={ROLE_COLORS[member.role]}>
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {member.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {canModifyMember && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {member.role !== "admin" && (
                          <DropdownMenuItem onClick={() => handleChangeRole(member.id, "admin")}>
                            <Shield className="w-4 h-4 mr-2" />
                            Make Admin
                          </DropdownMenuItem>
                        )}
                        {member.role === "admin" && (
                          <DropdownMenuItem onClick={() => handleChangeRole(member.id, "member")}>
                            <User className="w-4 h-4 mr-2" />
                            Make Member
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleRemoveMember(member.id)} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Empty State */}
      {project.members.length === 1 && (
        <Card className="p-8 text-center">
          <UserPlus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Invite Your Team</h3>
          <p className="text-muted-foreground mb-4">Collaborate with classmates by inviting them to your project</p>
          {canManageMembers && (
            <Button onClick={() => setShowInviteForm(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Members
            </Button>
          )}
        </Card>
      )}
    </div>
  )
}
