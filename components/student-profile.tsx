"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "@/components/theme-provider"
import { Edit3, Save, X, Sun, Moon, User, GraduationCap, BookOpen, School } from "lucide-react"
import type { StudentProfile } from "./student-onboarding"

interface StudentProfileComponentProps {
  profile: StudentProfile
  onUpdateProfile: (profile: StudentProfile) => void
}

export function StudentProfileComponent({ profile, onUpdateProfile }: StudentProfileComponentProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<StudentProfile>(profile)
  const { theme, toggleTheme } = useTheme()

  const handleSave = () => {
    onUpdateProfile(editedProfile)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const profileFields = [
    { key: "name" as keyof StudentProfile, label: "Full Name", icon: User, required: true },
    { key: "course" as keyof StudentProfile, label: "Course / Major", icon: BookOpen, required: true },
    { key: "year" as keyof StudentProfile, label: "Year / Semester", icon: GraduationCap, required: true },
    { key: "university" as keyof StudentProfile, label: "University", icon: School, required: false },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-balance">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>
        <Button variant="outline" size="icon" onClick={toggleTheme} className="rounded-full bg-transparent">
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </Button>
      </div>

      {/* Profile Card */}
      <Card className="shadow-lg border-0 bg-card/50 backdrop-blur">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{profile.name || "Student"}</CardTitle>
                <CardDescription>{profile.course || "Course not set"}</CardDescription>
              </div>
            </div>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="rounded-xl">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isEditing ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {profileFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key} className="flex items-center space-x-2">
                    <field.icon className="w-4 h-4" />
                    <span>{field.label}</span>
                    {field.required && <span className="text-destructive">*</span>}
                  </Label>
                  {field.key === "year" ? (
                    <Select
                      value={editedProfile[field.key]}
                      onValueChange={(value) => setEditedProfile((prev) => ({ ...prev, [field.key]: value }))}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select your current year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1st Year">1st Year</SelectItem>
                        <SelectItem value="2nd Year">2nd Year</SelectItem>
                        <SelectItem value="3rd Year">3rd Year</SelectItem>
                        <SelectItem value="4th Year">4th Year</SelectItem>
                        <SelectItem value="Graduate">Graduate</SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={field.key}
                      value={editedProfile[field.key] || ""}
                      onChange={(e) => setEditedProfile((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      className="rounded-xl"
                    />
                  )}
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <Button onClick={handleCancel} variant="outline" className="flex-1 rounded-xl bg-transparent">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} className="flex-1 rounded-xl">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {profileFields.map((field) => (
                <div key={field.key} className="flex items-center space-x-3 p-3 rounded-xl bg-muted/30">
                  <field.icon className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{field.label}</p>
                    <p className="text-sm text-muted-foreground">{profile[field.key] || "Not set"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card className="shadow-lg border-0 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg">Appearance</CardTitle>
          <CardDescription>Customize your app experience</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
            <div className="flex items-center space-x-3">
              {theme === "light" ? (
                <Sun className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">{theme === "light" ? "Light mode" : "Dark mode"}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={toggleTheme} className="rounded-xl bg-transparent">
              Switch to {theme === "light" ? "Dark" : "Light"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
