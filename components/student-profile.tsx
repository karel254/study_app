"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "@/components/theme-provider"
import { Edit3, Save, X, Sun, Moon, User, GraduationCap, BookOpen, School, LogOut, HelpCircle } from "lucide-react"
import type { StudentProfile } from "./student-onboarding"
import { AnimatePresence } from "framer-motion"

interface StudentProfileComponentProps {
  profile: StudentProfile
  onUpdateProfile: (profile: StudentProfile) => void
  onLogout?: () => void
  onShowHelp?: () => void
}

export function StudentProfileComponent({ profile, onUpdateProfile, onLogout, onShowHelp }: StudentProfileComponentProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<StudentProfile>(profile)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const handleSave = () => {
    onUpdateProfile(editedProfile)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = () => {
    // Clear all localStorage data
    localStorage.clear()
    
    // Clear sessionStorage as well
    sessionStorage.clear()
    
    // Clear any other storage mechanisms
    if (window.indexedDB) {
      // Clear IndexedDB if available
      indexedDB.databases().then(databases => {
        databases.forEach(db => {
          if (db.name) {
            indexedDB.deleteDatabase(db.name)
          }
        })
      })
    }
    
    // Clear cookies
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=")
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
    })
    
    // Call the logout callback if provided
    if (onLogout) {
      onLogout()
    } else {
      // Default behavior: redirect to onboarding
      window.location.href = "/"
      window.location.reload()
    }
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
      <div className="sticky top-0 z-20 bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-4 sm:p-6 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-4 sm:mb-6 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Student Profile</h1>
          <p className="text-sm sm:text-base text-white/80">Manage your academic information and preferences</p>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="shadow-lg border-0 bg-card/50 backdrop-blur">
        <CardContent className="pt-6">
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-6">
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="rounded-xl">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
            {onShowHelp && (
              <Button variant="outline" size="sm" onClick={onShowHelp} className="rounded-xl bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100">
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout} 
              className="rounded-xl border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Profile Display */}
          <div className="flex items-center space-x-3 mb-6 p-4 rounded-lg bg-muted/30">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{profile.name || "Student"}</h2>
              <p className="text-sm text-muted-foreground">{profile.course || "Course not set"}</p>
            </div>
          </div>

          <div className="space-y-4">
            {isEditing ? (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }} className="space-y-4">
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
          </div>
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

      {/* Logout Confirmation Dialog */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <LogOut className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Logout Confirmation</h3>
                <p className="text-gray-600 mb-6">
                  This will completely clear all your data including tasks, projects, and settings. 
                  This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmLogout}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Logout & Clear Data
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
