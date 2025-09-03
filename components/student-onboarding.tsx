"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap, User, BookOpen, Calendar } from "lucide-react"

export type StudentProfile = {
  name: string
  course: string
  year: string
  university?: string
}

interface StudentOnboardingProps {
  onComplete: (profile: StudentProfile) => void
}

export function StudentOnboarding({ onComplete }: StudentOnboardingProps) {
  const [profile, setProfile] = useState<StudentProfile>({
    name: "",
    course: "",
    year: "",
    university: "",
  })
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: "Welcome to StudyTracker",
      description: "Let's set up your profile to get started",
      icon: GraduationCap,
    },
    {
      title: "Personal Information",
      description: "Tell us about yourself",
      icon: User,
    },
    {
      title: "Academic Details",
      description: "Your course and year information",
      icon: BookOpen,
    },
    {
      title: "Almost Done!",
      description: "Optional university information",
      icon: Calendar,
    },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      onComplete(profile)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true
      case 1:
        return profile.name.trim() !== ""
      case 2:
        return profile.course.trim() !== "" && profile.year.trim() !== ""
      case 3:
        return true
      default:
        return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <GraduationCap className="w-10 h-10 text-primary" />
            </div>
            <p className="text-muted-foreground">
              Your personal study companion for tracking assignments, deadlines, and focus sessions.
            </p>
          </div>
        )
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={profile.name}
                onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                className="rounded-xl"
              />
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="course">Course / Major</Label>
              <Input
                id="course"
                placeholder="e.g., Computer Science, Business Administration"
                value={profile.course}
                onChange={(e) => setProfile((prev) => ({ ...prev, course: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year / Semester</Label>
              <Select value={profile.year} onValueChange={(value) => setProfile((prev) => ({ ...prev, year: value }))}>
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
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="university">University (Optional)</Label>
              <Input
                id="university"
                placeholder="Enter your university name"
                value={profile.university}
                onChange={(e) => setProfile((prev) => ({ ...prev, university: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="text-center text-sm text-muted-foreground">
              You can always update this information later in your profile.
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-card/95 backdrop-blur">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center space-x-2 mb-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index <= currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <CardTitle className="text-xl">{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>

            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handleBack} className="flex-1 rounded-xl bg-transparent">
                  Back
                </Button>
              )}
              <Button onClick={handleNext} disabled={!canProceed()} className="flex-1 rounded-xl">
                {currentStep === steps.length - 1 ? "Get Started" : "Next"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
